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
  customerPhone?: string;
  pickupAddress?: string;
  deliveryAddress: string;
  specialInstructions?: string;
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
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private connecting = false;
  private connected = false;

  async connect(agentId: string, agentName: string) {
    // Prevent duplicate connections
    if (this.connecting || this.connected) return;
    this.connecting = true;
    this.agentId = agentId;
    this.agentName = agentName;
    
    try {
      const { data, error } = await supabase.functions.invoke("hub-config");
      if (error) {
        console.warn("Hub config unavailable");
        this.connecting = false;
        return;
      }
      if (data?.hubUrl && data?.apiKey) {
        this.hubUrl = data.hubUrl;
        this.apiKey = data.apiKey;
        this.reconnectAttempts = 0;
        this.initWebSocket();
      }
    } catch {
      // Hub not available — app works fine without it
    }
    this.connecting = false;
  }

  private initWebSocket() {
    if (!this.hubUrl || !this.apiKey) return;
    if (this.ws?.readyState === WebSocket.OPEN) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;

    try {
      this.ws = new WebSocket(
        `${this.hubUrl}?role=agent&agentId=${this.agentId}&apiKey=${this.apiKey}`
      );

      this.ws.onopen = () => {
        this.connected = true;
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "orders_update" && data.orders) {
            this.listeners.forEach((fn) => fn(data.orders));
          }
        } catch {
          // ignore parse errors
        }
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.reconnectAttempts++;
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          const delay = Math.min(5000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
          this.reconnectTimer = setTimeout(() => this.initWebSocket(), delay);
        }
      };

      this.ws.onerror = () => {
        // Silently handle — onclose will fire next and handle reconnect
      };
    } catch {
      // Connection failed silently
    }
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.reconnectAttempts = this.maxReconnectAttempts; // prevent reconnect
    this.ws?.close();
    this.ws = null;
    this.connected = false;
    this.connecting = false;
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

      if (error) return { success: false, error: error.message };
      if (data?.error) return { success: false, error: data.error };
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}

export const hubService = new HubService();
