import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Package, DollarSign, XCircle, CheckCircle, Bell, Loader2 } from "lucide-react";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { formatDistanceToNow } from "date-fns";

const iconMap: Record<string, { icon: React.ElementType; color: string }> = {
  new_order: { icon: Package, color: "text-primary bg-primary/15" },
  order_update: { icon: CheckCircle, color: "text-primary bg-primary/15" },
  earnings: { icon: DollarSign, color: "text-accent bg-accent/15" },
  cancelled: { icon: XCircle, color: "text-destructive bg-destructive/15" },
};

export default function NotificationsPage() {
  const { notifications, loading, markAsRead, markAllRead } = useRealtimeNotifications();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Notifications</h1>
        <button onClick={markAllRead} className="text-xs text-primary font-medium">
          Mark all read
        </button>
      </div>

      <div className="space-y-2">
        {notifications.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center">
            <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        )}

        {notifications.map((n, i) => {
          const config = iconMap[n.type] || iconMap.new_order;
          const timeAgo = formatDistanceToNow(new Date(n.created_at), { addSuffix: true });

          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => !n.is_read && markAsRead(n.id)}
              className={cn(
                "glass rounded-2xl p-4 flex items-start gap-3 transition-all cursor-pointer active:scale-[0.98]",
                !n.is_read && "border border-primary/20"
              )}
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", config.color)}>
                <config.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{n.title}</p>
                  {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{timeAgo}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
