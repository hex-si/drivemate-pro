import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { HubOrder } from "@/services/hubService";
import { hubService } from "@/services/hubService";

export interface IncomingOrder {
  order: HubOrder;
  countdown: number;
}

/**
 * Listens for new order assignments via:
 * 1. Hub WebSocket (new_order event)
 * 2. Supabase realtime INSERT on delivery_orders for this agent
 * Fires browser push notification + provides accept/reject.
 */
export function useIncomingOrder() {
  const { agent, user } = useAuth();
  const [incoming, setIncoming] = useState<IncomingOrder | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const showPushNotification = useCallback((order: HubOrder) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const n = new Notification("New Delivery Request!", {
        body: `${order.customerName} — ${order.deliveryAddress}\nFee: ₵${order.fee.toFixed(2)}`,
        icon: "/icon-192.png",
        tag: "incoming-order",
        requireInteraction: true,
      });
      n.onclick = () => {
        window.focus();
        n.close();
      };
    }
  }, []);

  const playSound = useCallback(() => {
    try {
      if (!audioRef.current) {
        // Use a simple oscillator beep
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.value = 0.3;
        osc.start();
        setTimeout(() => { osc.stop(); ctx.close(); }, 300);
      }
    } catch { /* silent */ }
  }, []);

  const startCountdown = useCallback((order: HubOrder) => {
    // Clear any existing countdown
    if (countdownRef.current) clearInterval(countdownRef.current);

    setIncoming({ order, countdown: 30 });
    showPushNotification(order);
    playSound();

    countdownRef.current = setInterval(() => {
      setIncoming((prev) => {
        if (!prev) return null;
        if (prev.countdown <= 1) {
          clearInterval(countdownRef.current!);
          countdownRef.current = null;
          return null; // Auto-reject on timeout
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);
  }, [showPushNotification, playSound]);

  // Listen to hub WebSocket for new_order events
  useEffect(() => {
    if (!agent) return;

    const unsubscribe = hubService.onOrdersUpdate((orders: HubOrder[]) => {
      // Check for newly assigned orders
      const newAssigned = orders.find(
        (o) => o.status === "assigned" && o.agentId === agent.agent_code
      );
      if (newAssigned && (!incoming || incoming.order.hubOrderId !== newAssigned.hubOrderId)) {
        startCountdown(newAssigned);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [agent, startCountdown, incoming]);

  // Listen to Supabase realtime for new delivery_orders assigned to this agent
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("incoming-orders")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "delivery_orders",
          filter: `agent_user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new as any;
          const order: HubOrder = {
            id: row.id,
            hubOrderId: row.order_code,
            customerName: row.customer_name,
            customerPhone: row.customer_phone || undefined,
            pickupAddress: row.pickup_address,
            deliveryAddress: row.delivery_address,
            specialInstructions: row.special_instructions || undefined,
            items: [],
            total: row.total_fee || 0,
            sourceSite: "Hub",
            status: "assigned",
            agentId: row.agent_id || "",
            agentName: "",
            createdAt: row.created_at,
            fee: row.total_fee || 0,
          };
          startCountdown(order);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, startCountdown]);

  const accept = useCallback(async () => {
    if (!incoming || !agent || !user) return;
    if (countdownRef.current) clearInterval(countdownRef.current);

    // Record acceptance
    await supabase.from("agent_order_responses").insert({
      agent_id: agent.id,
      user_id: user.id,
      order_id: incoming.order.id,
      response_type: "accepted",
    });

    // Update order status
    await supabase
      .from("delivery_orders")
      .update({ status: "accepted" })
      .eq("id", incoming.order.id);

    // Also notify hub
    hubService.updateOrderStatus(incoming.order.hubOrderId, "accepted");

    setIncoming(null);
  }, [incoming, agent, user]);

  const reject = useCallback(async () => {
    if (!incoming || !agent || !user) return;
    if (countdownRef.current) clearInterval(countdownRef.current);

    await supabase.from("agent_order_responses").insert({
      agent_id: agent.id,
      user_id: user.id,
      order_id: incoming.order.id,
      response_type: "rejected",
      reason: "Agent rejected",
    });

    hubService.updateOrderStatus(incoming.order.hubOrderId, "rejected");

    setIncoming(null);
  }, [incoming, agent, user]);

  const dismiss = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setIncoming(null);
  }, []);

  return { incoming, accept, reject, dismiss };
}
