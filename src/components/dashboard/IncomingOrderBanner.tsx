import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Check, X, Package } from "lucide-react";

export default function IncomingOrderBanner() {
  // Mock: set to true to show banner
  const [show, setShow] = useState(false);
  const [countdown, setCountdown] = useState(30);

  // Demo: show banner after 3 seconds
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!show) return;
    if (countdown <= 0) {
      setShow(false);
      return;
    }
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [show, countdown]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.25 }}
          className="glass-strong rounded-2xl p-4 border-primary/40 border space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">New Delivery Request!</p>
              <p className="text-xs text-muted-foreground">Airport Residential → East Legon</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary">{countdown}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground">Est. fee:</span>
            <span className="font-bold text-accent">₵25.00</span>
            <span className="text-muted-foreground">• 3.2 km</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShow(false)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-destructive/15 text-destructive font-semibold text-sm active:scale-95 transition-transform"
            >
              <X className="w-4 h-4" />
              Reject
            </button>
            <button
              onClick={() => setShow(false)}
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
