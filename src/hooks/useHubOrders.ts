import { useState, useEffect, useCallback } from "react";
import { hubService, HubOrder } from "@/services/hubService";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook that provides orders from the hub + local Supabase cache.
 * While the hub connection is being set up, it falls back to local orders.
 */
export function useHubOrders() {
  const { agent } = useAuth();
  const [hubOrders, setHubOrders] = useState<HubOrder[]>([]);
  const [localOrders, setLocalOrders] = useState<any[]>([]);
  const [hubConnected, setHubConnected] = useState(false);

  // Connect to hub when agent is available
  useEffect(() => {
    if (!agent) return;
    hubService.connect(agent.agent_code, agent.full_name);

    const unsubscribe = hubService.onOrdersUpdate((orders) => {
      setHubOrders(orders);
      setHubConnected(true);
    });

    return () => {
      unsubscribe();
      hubService.disconnect();
    };
  }, [agent]);

  // Fetch local orders from Supabase as fallback/cache
  useEffect(() => {
    if (!agent) return;

    const fetchLocal = async () => {
      const { data } = await supabase
        .from("delivery_orders")
        .select("*")
        .eq("agent_user_id", agent.user_id)
        .order("created_at", { ascending: false });
      if (data) setLocalOrders(data);
    };

    fetchLocal();

    // Realtime subscription for local orders
    const channel = supabase
      .channel("agent-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "delivery_orders",
          filter: `agent_user_id=eq.${agent.user_id}`,
        },
        () => fetchLocal()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agent]);

  const updateStatus = useCallback(
    async (hubOrderId: string, status: string, cancelReason?: string) => {
      return hubService.updateOrderStatus(hubOrderId, status, cancelReason);
    },
    []
  );

  // Use hub orders if connected, otherwise use local
  const orders = hubConnected ? hubOrders : localOrders.map((o) => ({
    id: o.id,
    hubOrderId: o.order_code,
    customerName: o.customer_name,
    deliveryAddress: o.delivery_address,
    items: [],
    total: o.total_fee || 0,
    sourceSite: "Local",
    status: mapLocalStatus(o.status),
    agentId: o.agent_id || "",
    agentName: "",
    createdAt: o.created_at,
    fee: o.total_fee || 0,
  })) as HubOrder[];

  return { orders, hubConnected, updateStatus };
}

function mapLocalStatus(status: string): HubOrder["status"] {
  const map: Record<string, HubOrder["status"]> = {
    pending_assignment: "assigned",
    accepted: "assigned",
    en_route_pickup: "assigned",
    arrived_pickup: "assigned",
    picked_up: "picked_up",
    in_transit: "on_the_way",
    arrived_delivery: "on_the_way",
    delivered: "delivered",
    cancelled: "cancelled",
  };
  return map[status] || "assigned";
}
