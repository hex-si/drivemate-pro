import { ArrowRight, Navigation } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// Mock active delivery
const mockActive = {
  id: "ORD-1043",
  pickup: "15 Airport Residential",
  delivery: "22 East Legon Boundary",
  customer: "Ama Mensah",
  status: "in_transit",
};

export default function ActiveDeliveryCard() {
  // In production, check for active delivery from DB
  const hasActive = true;

  if (!hasActive) return null;

  return (
    <div className="relative">
      {/* Pulsing border effect */}
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
          <span className="text-xs text-muted-foreground">{mockActive.id}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">Pickup</p>
            <p className="text-sm font-medium text-foreground truncate">{mockActive.pickup}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">Delivery</p>
            <p className="text-sm font-medium text-foreground truncate">{mockActive.delivery}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Customer: <span className="text-foreground">{mockActive.customer}</span>
          </p>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold active:scale-95 transition-transform"
            onClick={(e) => {
              e.preventDefault();
              // Open maps
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
