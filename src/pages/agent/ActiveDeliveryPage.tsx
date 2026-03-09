import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, Navigation, Phone, MessageCircle, FileText, MapPin, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHubOrders } from "@/hooks/useHubOrders";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { key: "accepted", label: "Accepted" },
  { key: "en_route_pickup", label: "En Route to Pickup" },
  { key: "arrived_pickup", label: "Arrived at Pickup" },
  { key: "picked_up", label: "Picked Up" },
  { key: "in_transit", label: "In Transit" },
  { key: "arrived_delivery", label: "Arrived at Delivery" },
  { key: "delivered", label: "Delivered" },
];

const nextLabels: Record<string, string> = {
  accepted: "I'm On My Way",
  en_route_pickup: "I've Arrived at Pickup",
  arrived_pickup: "Package Picked Up",
  picked_up: "Starting Delivery",
  in_transit: "I've Arrived at Delivery",
  arrived_delivery: "Complete Delivery",
};

const hubStatusToStep: Record<string, number> = {
  assigned: 0,
  picked_up: 3,
  on_the_way: 4,
};

export default function ActiveDeliveryPage() {
  const { orders, updateStatus } = useHubOrders();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);

  const order = orders.find(
    (o) => o.status === "assigned" || o.status === "picked_up" || o.status === "on_the_way"
  );

  const [currentStep, setCurrentStep] = useState(0);

  // Sync step from hub status
  useEffect(() => {
    if (order) {
      const hubStep = hubStatusToStep[order.status] ?? 0;
      setCurrentStep((prev) => Math.max(prev, hubStep));
    }
  }, [order?.status]);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
        <MapPin className="w-12 h-12 text-muted-foreground mb-3" />
        <p className="text-lg font-semibold text-foreground">No Active Delivery</p>
        <p className="text-sm text-muted-foreground mt-1">Accept an order to get started</p>
      </div>
    );
  }

  const advanceStep = async () => {
    if (currentStep >= steps.length - 1) return;
    setUpdating(true);

    try {
      // Step 2→3: arrived_pickup → picked_up → hub update
      if (currentStep === 2) {
        const { success, error } = await updateStatus(order.hubOrderId, "picked_up");
        if (!success) {
          toast({ title: "Update failed", description: error, variant: "destructive" });
          setUpdating(false);
          return;
        }
      }

      // Step 3→4: picked_up → in_transit → hub update to on_the_way
      if (currentStep === 3) {
        const { success, error } = await updateStatus(order.hubOrderId, "on_the_way");
        if (!success) {
          toast({ title: "Update failed", description: error, variant: "destructive" });
          setUpdating(false);
          return;
        }
      }

      // Step 5: arrived_delivery → navigate to complete
      if (currentStep === 5) {
        navigate("/agent/complete-delivery");
        return;
      }

      setCurrentStep((s) => s + 1);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="px-4 py-4 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Active Delivery</h1>
        <span className="text-xs text-muted-foreground">{order.hubOrderId}</span>
      </div>

      {/* Map placeholder */}
      <div className="glass rounded-2xl h-44 flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="text-center z-10">
          <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Map view</p>
          <p className="text-[10px] text-muted-foreground">Connect Google Maps API to enable</p>
        </div>
        <div className="absolute top-6 left-8 flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-[9px] text-primary font-medium">Pickup</span>
        </div>
        <div className="absolute bottom-6 right-8 flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span className="text-[9px] text-accent font-medium">Delivery</span>
        </div>
      </div>

      {/* Addresses */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1 pt-1">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <div className="w-px h-8 bg-border" />
            <div className="w-3 h-3 rounded-full bg-accent" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-[10px] text-muted-foreground">Pickup</p>
              <p className="text-sm font-medium text-foreground">
                {order.pickupAddress || "Pickup location"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Delivery</p>
              <p className="text-sm font-medium text-foreground">{order.deliveryAddress}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Stepper */}
      <div className="glass rounded-2xl p-4">
        <p className="text-sm font-semibold text-foreground mb-4">Delivery Progress</p>
        <div className="space-y-0">
          {steps.map((step, i) => (
            <div key={step.key} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    i < currentStep
                      ? "bg-primary text-primary-foreground"
                      : i === currentStep
                      ? "bg-primary/20 border-2 border-primary text-primary"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {i < currentStep ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={cn("w-px h-6", i < currentStep ? "bg-primary" : "bg-border")} />
                )}
              </div>
              <p className={cn("text-sm pt-0.5", i <= currentStep ? "text-foreground font-medium" : "text-muted-foreground")}>
                {step.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Notes */}
      {order.specialInstructions && (
        <div className="glass rounded-2xl p-4 border-accent/20 border">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-accent" />
            <p className="text-sm font-semibold text-foreground">Delivery Notes</p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{order.specialInstructions}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {order.customerPhone && (
          <>
            <a
              href={`tel:${order.customerPhone}`}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl glass text-sm font-medium text-foreground active:scale-95 transition-transform"
            >
              <Phone className="w-4 h-4" />
              Call
            </a>
            <a
              href={`https://wa.me/${order.customerPhone.replace("+", "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl glass text-sm font-medium text-primary active:scale-95 transition-transform"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </>
        )}
        <button
          onClick={() => {
            window.open(
              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`,
              "_blank"
            );
          }}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl glass text-sm font-medium text-foreground active:scale-95 transition-transform"
        >
          <Navigation className="w-4 h-4" />
          Maps
        </button>
      </div>

      {/* Advance Button */}
      {currentStep < steps.length - 1 && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={advanceStep}
          disabled={updating}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground text-base font-bold active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {updating && <Loader2 className="w-5 h-5 animate-spin" />}
          {nextLabels[steps[currentStep].key] || "Next Step"}
        </motion.button>
      )}
    </div>
  );
}
