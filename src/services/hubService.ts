/**
 * Central OrderHub Service
 * 
 * Connects to the external hub via WebSocket for realtime order updates
 * and REST API for status changes.
 * 
 * Replace HUB_URL and HUB_API_KEY with your actual values.
 */

// TODO: Replace with your actual hub URL and API key
const HUB_URL = import.meta.env.VITE_HUB_URL || "https://your-hub-url.com";
const HUB_API_KEY = import.meta.env.VITE_HUB_API_KEY || "your-api-key";

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

  connect(agentId: string, agentName: string) {
    this.agentId = agentId;
    this.agentName = agentName;
    this.initWebSocket();
  }

  private initWebSocket() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      const wsUrl = HUB_URL.replace(/^http/, "ws");
      this.ws = new WebSocket(
        `${wsUrl}?role=agent&agentId=${this.agentId}&apiKey=${HUB_API_KEY}`
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
      const res = await fetch(`${HUB_URL}/api/orders/${hubOrderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": HUB_API_KEY,
        },
        body: JSON.stringify({
          status,
          agentId: this.agentId,
          agentName: this.agentName,
          ...(cancelReason && { cancelReason }),
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        return { success: false, error: err };
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}

export const hubService = new HubService();
