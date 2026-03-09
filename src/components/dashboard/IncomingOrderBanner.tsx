import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Package, MapPin } from "lucide-react";
import { useIncomingOrder } from "@/hooks/useIncomingOrder";
import { Progress } from "@/components/ui/progress";

export default function IncomingOrderBanner() {
  const { incoming, accept, reject } = useIncomingOrder();

  return (
    <AnimatePresence>
      {incoming && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.25 }}
          className="glass-strong rounded-2xl p-4 border-primary/40 border space-y-3"
        >
          {/* Countdown progress */}
          <Progress
            value={(incoming.countdown / 30) * 100}
            className="h-1.5 bg-secondary"
          />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">New Delivery Request!</p>
              <p className="text-xs text-muted-foreground truncate">
                {incoming.order.customerName}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-primary">{incoming.countdown}</span>
            </div>
          </div>

          {/* Addresses */}
          <div className="flex items-start gap-2 text-xs">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="min-w-0">
              {incoming.order.pickupAddress && (
                <p className="text-muted-foreground truncate">
                  From: {incoming.order.pickupAddress}
                </p>
              )}
              <p className="text-foreground font-medium truncate">
                To: {incoming.order.deliveryAddress}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground">Est. fee:</span>
            <span className="font-bold text-accent">₵{incoming.order.fee.toFixed(2)}</span>
            {incoming.order.items.length > 0 && (
              <span className="text-muted-foreground">
                • {incoming.order.items.length} item(s)
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={reject}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-destructive/15 text-destructive font-semibold text-sm active:scale-95 transition-transform"
            >
              <X className="w-4 h-4" />
              Reject
            </button>
            <button
              onClick={accept}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-95 transition-transform"
            >
              <Check className="w-4 h-4" />
              Accept
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
