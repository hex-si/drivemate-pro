import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type Status = "online" | "offline" | "busy";

const statusConfig: Record<Status, { label: string; color: string; bg: string }> = {
  online: { label: "Online", color: "bg-primary", bg: "bg-primary/15 border-primary/40" },
  busy: { label: "Busy", color: "bg-accent", bg: "bg-accent/15 border-accent/40" },
  offline: { label: "Offline", color: "bg-destructive", bg: "bg-destructive/15 border-destructive/40" },
};

const statusOrder: Status[] = ["online", "busy", "offline"];

interface AvailabilityToggleProps {
  status: Status;
  onStatusChange: (status: Status) => void;
}

export default function AvailabilityToggle({ status, onStatusChange }: AvailabilityToggleProps) {
  const config = statusConfig[status];

  const cycleStatus = () => {
    const idx = statusOrder.indexOf(status);
    const next = statusOrder[(idx + 1) % statusOrder.length];
    onStatusChange(next);
  };

  return (
    <button
      onClick={cycleStatus}
      className={cn(
        "relative flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold transition-all active:scale-95",
        config.bg
      )}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span
          className={cn(
            "absolute inline-flex h-full w-full rounded-full opacity-75",
            config.color,
            status === "online" && "animate-ping"
          )}
        />
        <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", config.color)} />
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={status}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="text-foreground"
        >
          {config.label}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
