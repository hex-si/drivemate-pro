import { ArrowRight, Navigation } from "lucide-react";
import { Link } from "react-router-dom";
import { useHubOrders } from "@/hooks/useHubOrders";

export default function ActiveDeliveryCard() {
  const { orders } = useHubOrders();
  const activeOrder = orders.find(
    (o) => o.status === "assigned" || o.status === "picked_up" || o.status === "on_the_way"
  );

  if (!activeOrder) return null;

  return (
    <div className="relative">
      <div className="absolute -inset-[1px] rounded-2xl bg-primary/30 pulse-online" />
      <Link
        to="/agent/active-delivery"
        className="relative glass rounded-2xl p-4 space-y-3 block active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary">Active Delivery</span>
          </div>
          <span className="text-xs text-muted-foreground">{activeOrder.hubOrderId}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">Pickup</p>
            <p className="text-sm font-medium text-foreground truncate">
              {activeOrder.pickupAddress || "Pickup location"}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">Delivery</p>
            <p className="text-sm font-medium text-foreground truncate">
              {activeOrder.deliveryAddress}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Customer: <span className="text-foreground">{activeOrder.customerName}</span>
          </p>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold active:scale-95 transition-transform"
            onClick={(e) => {
              e.preventDefault();
              window.open(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeOrder.deliveryAddress)}`,
                "_blank"
              );
            }}
          >
            <Navigation className="w-3 h-3" />
            Navigate
          </button>
        </div>
      </Link>
    </div>
  );
}
