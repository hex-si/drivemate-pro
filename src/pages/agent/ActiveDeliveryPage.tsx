import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, Navigation, Phone, MessageCircle, FileText, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

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

export default function ActiveDeliveryPage() {
  const [currentStep, setCurrentStep] = useState(3); // picked_up

  const mockOrder = {
    id: "ORD-1043",
    pickup: "15 Airport Residential Area",
    delivery: "22 East Legon Boundary Rd",
    customer: "Ama Mensah",
    phone: "+233205551234",
    notes: "Please call when you arrive. Gate code: 4521. Leave with security if I'm not home.",
    pickupLat: 5.6037,
    pickupLng: -0.1870,
    deliveryLat: 5.6350,
    deliveryLng: -0.1575,
  };

  const advanceStep = () => {
    if (currentStep >= steps.length - 1) return;
    if (currentStep === steps.length - 2) {
      // Go to complete delivery
      window.location.href = "/agent/complete-delivery";
      return;
    }
    setCurrentStep((s) => s + 1);
  };

  return (
    <div className="px-4 py-4 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Active Delivery</h1>
        <span className="text-xs text-muted-foreground">{mockOrder.id}</span>
      </div>

      {/* Map placeholder */}
      <div className="glass rounded-2xl h-44 flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="text-center z-10">
          <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Map view</p>
          <p className="text-[10px] text-muted-foreground">Connect Google Maps API to enable</p>
        </div>
        {/* Pin markers */}
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
              <p className="text-sm font-medium text-foreground">{mockOrder.pickup}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Delivery</p>
              <p className="text-sm font-medium text-foreground">{mockOrder.delivery}</p>
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
                  <div
                    className={cn(
                      "w-px h-6",
                      i < currentStep ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
              <p
                className={cn(
                  "text-sm pt-0.5",
                  i <= currentStep ? "text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Notes */}
      {mockOrder.notes && (
        <div className="glass rounded-2xl p-4 border-accent/20 border">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-accent" />
            <p className="text-sm font-semibold text-foreground">Delivery Notes</p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{mockOrder.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <a
          href={`tel:${mockOrder.phone}`}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl glass text-sm font-medium text-foreground active:scale-95 transition-transform"
        >
          <Phone className="w-4 h-4" />
          Call
        </a>
        <a
          href={`https://wa.me/${mockOrder.phone.replace("+", "")}`}
          target="_blank"
          rel="noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl glass text-sm font-medium text-primary active:scale-95 transition-transform"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>
        <button
          onClick={() => {
            window.open(
              `https://www.google.com/maps/dir/?api=1&destination=${mockOrder.deliveryLat},${mockOrder.deliveryLng}`,
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
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground text-base font-bold active:scale-[0.98] transition-transform"
        >
          {nextLabels[steps[currentStep].key] || "Next Step"}
        </motion.button>
      )}
    </div>
  );
}
