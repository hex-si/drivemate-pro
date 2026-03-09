import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Package, MapPin, Clock, XCircle, CheckCircle, Truck, ArrowRight, Store, Eye } from "lucide-react";
import { useHubOrders } from "@/hooks/useHubOrders";
import type { HubOrder } from "@/services/hubService";
import { useToast } from "@/hooks/use-toast";
import OrderDetailSheet from "@/components/orders/OrderDetailSheet";

type Tab = "active" | "completed";

export default function OrdersPage() {
  const { orders, hubConnected, updateStatus } = useHubOrders();
  const [activeTab, setActiveTab] = useState<Tab>("active");
  const [selectedOrder, setSelectedOrder] = useState<HubOrder | null>(null);
  const { toast } = useToast();

  const activeOrders = orders.filter(
    (o) => o.status === "assigned" || o.status === "picked_up" || o.status === "on_the_way"
  );
  const completedOrders = orders.filter(
    (o) => o.status === "delivered" || o.status === "cancelled"
  );
  const filtered = activeTab === "active" ? activeOrders : completedOrders;

  const handleStatusUpdate = async (order: HubOrder, newStatus: string, cancelReason?: string) => {
    const { success, error } = await updateStatus(order.hubOrderId, newStatus, cancelReason);
    if (success) {
      toast({ title: "Status updated", description: `Order set to ${newStatus}` });
    } else {
      toast({ title: "Update failed", description: error || "Try again", variant: "destructive" });
    }
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
        {!hubConnected && (
          <span className="text-xs text-accent bg-accent/15 px-2 py-1 rounded-full font-medium">
            Offline mode
          </span>
        )}
        {hubConnected && (
          <span className="text-xs text-primary bg-primary/15 px-2 py-1 rounded-full font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Live
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("active")}
          className={cn(
            "flex-1 py-3 rounded-xl text-base font-bold transition-all active:scale-95",
            activeTab === "active" ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
          )}
        >
          Active ({activeOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={cn(
            "flex-1 py-3 rounded-xl text-base font-bold transition-all active:scale-95",
            activeTab === "completed" ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
          )}
        >
          History ({completedOrders.length})
        </button>
      </div>

      {/* Orders */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-4"
        >
          {filtered.length === 0 && (
            <div className="glass rounded-2xl p-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-lg">
                {activeTab === "active" ? "No active orders" : "No completed orders yet"}
              </p>
            </div>
          )}
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} onStatusUpdate={handleStatusUpdate} onViewDetails={setSelectedOrder} />
          ))}
        </motion.div>
      </AnimatePresence>

      <OrderDetailSheet order={selectedOrder} open={!!selectedOrder} onOpenChange={(o) => !o && setSelectedOrder(null)} />
    </div>
  );
}

function OrderCard({
  order,
  onStatusUpdate,
  onViewDetails,
}: {
  order: HubOrder;
  onStatusUpdate: (order: HubOrder, status: string, reason?: string) => void;
  onViewDetails: (order: HubOrder) => void;
}) {
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [updating, setUpdating] = useState(false);

  const handleAction = async (status: string, reason?: string) => {
    setUpdating(true);
    await onStatusUpdate(order, status, reason);
    setUpdating(false);
    setShowCancel(false);
  };

  const statusColor: Record<string, string> = {
    assigned: "text-accent bg-accent/15",
    picked_up: "text-primary bg-primary/15",
    on_the_way: "text-primary bg-primary/15",
    delivered: "text-primary bg-primary/15",
    cancelled: "text-destructive bg-destructive/15",
  };

  const statusLabel: Record<string, string> = {
    assigned: "Assigned",
    picked_up: "Picked Up",
    on_the_way: "On The Way",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">{order.customerName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Store className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{order.sourceSite}</span>
          </div>
        </div>
        <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", statusColor[order.status])}>
          {statusLabel[order.status]}
        </span>
      </div>

      {/* Address */}
      <div className="flex items-start gap-3 bg-secondary/50 rounded-xl p-3">
        <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-foreground leading-relaxed">{order.deliveryAddress}</p>
      </div>

      {/* Items */}
      {order.items.length > 0 && (
        <div className="space-y-1">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.quantity}x {item.name}
              </span>
              <span className="text-foreground font-medium">₵{item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Total + Fee + View */}
      <div className="flex items-center justify-between border-t border-border pt-3">
        <div>
          <p className="text-xs text-muted-foreground">Order Total</p>
          <p className="text-lg font-bold text-foreground">₵{order.total.toFixed(2)}</p>
        </div>
        <button
          onClick={() => onViewDetails(order)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold active:scale-95 transition-transform"
        >
          <Eye className="w-3.5 h-3.5" /> Details
        </button>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Your Fee</p>
          <p className="text-lg font-bold text-accent">₵{order.fee.toFixed(2)}</p>
        </div>
      </div>

      {/* Action Buttons - BIG and clear */}
      {order.status === "assigned" && !showCancel && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowCancel(true)}
            disabled={updating}
            className="h-14 rounded-xl bg-destructive/15 text-destructive text-base font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
          >
            <XCircle className="w-5 h-5" />
            Cancel
          </button>
          <button
            onClick={() => handleAction("picked_up")}
            disabled={updating}
            className="h-14 rounded-xl bg-primary text-primary-foreground text-base font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
          >
            <CheckCircle className="w-5 h-5" />
            Confirm Pickup
          </button>
        </div>
      )}

      {order.status === "picked_up" && !showCancel && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowCancel(true)}
            disabled={updating}
            className="h-14 rounded-xl bg-destructive/15 text-destructive text-base font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
          >
            <XCircle className="w-5 h-5" />
            Cancel
          </button>
          <button
            onClick={() => handleAction("on_the_way")}
            disabled={updating}
            className="h-14 rounded-xl bg-primary text-primary-foreground text-base font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
          >
            <Truck className="w-5 h-5" />
            Start Delivery
          </button>
        </div>
      )}

      {order.status === "on_the_way" && !showCancel && (
        <button
          onClick={() => handleAction("delivered")}
          disabled={updating}
          className="w-full h-16 rounded-xl bg-primary text-primary-foreground text-lg font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
        >
          <CheckCircle className="w-6 h-6" />
          Mark as Delivered
        </button>
      )}

      {order.status === "cancelled" && order.cancelReason && (
        <div className="bg-destructive/10 rounded-xl p-3">
          <p className="text-xs text-destructive font-medium">Reason: {order.cancelReason}</p>
        </div>
      )}

      {/* Cancel reason input */}
      {showCancel && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-3"
        >
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Why are you cancelling? (required)"
            className="w-full h-24 px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive resize-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setShowCancel(false); setCancelReason(""); }}
              className="h-14 rounded-xl glass text-foreground text-base font-bold active:scale-95 transition-transform"
            >
              Go Back
            </button>
            <button
              onClick={() => cancelReason.trim() && handleAction("cancelled", cancelReason)}
              disabled={!cancelReason.trim() || updating}
              className="h-14 rounded-xl bg-destructive text-destructive-foreground text-base font-bold active:scale-95 transition-transform disabled:opacity-50"
            >
              Confirm Cancel
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
