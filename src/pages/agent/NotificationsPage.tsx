import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Package, DollarSign, XCircle, CheckCircle, Bell } from "lucide-react";

const mockNotifications = [
  {
    id: 1, type: "new_order", title: "New delivery request!",
    message: "Airport Residential → East Legon · ₵25.00", time: "5 min ago", read: false,
  },
  {
    id: 2, type: "confirmed", title: "Order confirmed",
    message: "ORD-1042 has been confirmed by the customer", time: "2h ago", read: false,
  },
  {
    id: 3, type: "earnings", title: "Earnings updated",
    message: "You earned ₵18.50 for ORD-1042", time: "2h ago", read: true,
  },
  {
    id: 4, type: "cancelled", title: "Order cancelled",
    message: "ORD-1039 was cancelled by the customer", time: "Yesterday", read: true,
  },
  {
    id: 5, type: "earnings", title: "Earnings updated",
    message: "You earned ₵22.00 for ORD-1041", time: "Yesterday", read: true,
  },
];

const iconMap: Record<string, { icon: React.ElementType; color: string }> = {
  new_order: { icon: Package, color: "text-primary bg-primary/15" },
  confirmed: { icon: CheckCircle, color: "text-primary bg-primary/15" },
  earnings: { icon: DollarSign, color: "text-accent bg-accent/15" },
  cancelled: { icon: XCircle, color: "text-destructive bg-destructive/15" },
};

export default function NotificationsPage() {
  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Notifications</h1>
        <button className="text-xs text-primary font-medium">Mark all read</button>
      </div>

      <div className="space-y-2">
        {mockNotifications.map((n, i) => {
          const config = iconMap[n.type] || iconMap.new_order;
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "glass rounded-2xl p-4 flex items-start gap-3 transition-all",
                !n.read && "border border-primary/20"
              )}
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", config.color)}>
                <config.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{n.title}</p>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
