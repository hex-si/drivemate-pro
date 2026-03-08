/**
 * Central OrderHub Service
 * 
 * Connects to the external hub via WebSocket for realtime order updates
 * and uses edge functions for secure API calls.
 */

import { supabase } from "@/integrations/supabase/client";

export interface HubOrder {
  id: string;
  hubOrderId: string;
  customerName: string;
  deliveryAddress: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  sourceSite: string;
  status: "assigned" | "picked_up" | "on_the_way" | "delivered" | "cancelled";
  agentId: string;
  agentName: string;
  createdAt: string;
  fee: number;
  cancelReason?: string;
}

type HubEventHandler = (orders: HubOrder[]) => void;

class HubService {
  private ws: WebSocket | null = null;
  private listeners: Set<HubEventHandler> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private agentId: string = "";
  private agentName: string = "";
  private hubUrl: string | null = null;
  private apiKey: string | null = null;

  async connect(agentId: string, agentName: string) {
    this.agentId = agentId;
    this.agentName = agentName;
    
    // Fetch hub config from edge function
    try {
      const { data, error } = await supabase.functions.invoke("hub-config");
      if (error) {
        console.error("Failed to get hub config:", error);
        return;
      }
      if (data.hubUrl && data.apiKey) {
        this.hubUrl = data.hubUrl;
        this.apiKey = data.apiKey;
        this.initWebSocket();
      } else {
        console.warn("Hub not configured:", data.error);
      }
    } catch (e) {
      console.error("Hub config error:", e);
    }
  }

  private initWebSocket() {
    if (!this.hubUrl || !this.apiKey) return;
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(
        `${this.hubUrl}?role=agent&agentId=${this.agentId}&apiKey=${this.apiKey}`
      );

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "orders_update" && data.orders) {
            this.listeners.forEach((fn) => fn(data.orders));
          }
        } catch (e) {
          console.error("Hub WS parse error:", e);
        }
      };

      this.ws.onclose = () => {
        this.reconnectTimer = setTimeout(() => this.initWebSocket(), 5000);
      };

      this.ws.onerror = (e) => {
        console.error("Hub WS error:", e);
      };
    } catch (e) {
      console.error("Hub WS connection failed:", e);
    }
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }

  onOrdersUpdate(handler: HubEventHandler) {
    this.listeners.add(handler);
    return () => this.listeners.delete(handler);
  }

  async updateOrderStatus(
    hubOrderId: string,
    status: string,
    cancelReason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke("hub-update-status", {
        body: {
          hubOrderId,
          status,
          agentId: this.agentId,
          agentName: this.agentName,
          cancelReason,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }
      if (data.error) {
        return { success: false, error: data.error };
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}

export const hubService = new HubService();
