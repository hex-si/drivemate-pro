import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  CheckCircle2, DollarSign, Star, MapPin, 
  Package, TrendingUp, User, Zap, PlusCircle, History 
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAgentAvailability } from "@/hooks/useAgentAvailability";
import { useAuth } from "@/contexts/AuthContext";
import AvailabilityToggle from "@/components/dashboard/AvailabilityToggle";
import ActiveDeliveryCard from "@/components/dashboard/ActiveDeliveryCard";
import IncomingOrderBanner from "@/components/dashboard/IncomingOrderBanner";
import { useHubOrders } from "@/hooks/useHubOrders";
import HubConnectionBadge from "@/components/dashboard/HubConnectionBadge";
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function DashboardPage() {
  const { status, changeStatus } = useAgentAvailability();
  const { agent } = useAuth();
  const { orders, hubConnected } = useHubOrders();
  const agentName = agent?.full_name?.split(" ")[0] || "Agent";

  const todayDeliveries = orders.filter((o) => o.status === "delivered").length;
  const todayEarnings = orders.filter((o) => o.status === "delivered").reduce((s, o) => s + o.fee, 0);
  const activeOrders = orders.filter(
    (o) => o.status === "assigned" || o.status === "picked_up" || o.status === "on_the_way"
  );

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="px-4 py-4 space-y-5"
    >
      <IncomingOrderBanner />

      {/* Hero */}
      <motion.div variants={item} className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-xl font-bold text-primary">
          {agentName[0]}
        </div>
        <div className="flex-1">
          <p className="text-muted-foreground text-sm">{greeting()}</p>
          <h1 className="text-xl font-bold text-foreground">{agentName} 👋</h1>
          {agent?.agent_code && (
            <p className="text-xs text-muted-foreground">ID: {agent.agent_code}</p>
          )}
        </div>
        <AvailabilityToggle status={status} onStatusChange={changeStatus} />
      </motion.div>

      {/* Hub Connection Status */}
      <motion.div variants={item} className="flex justify-center">
        <HubConnectionBadge />
      </motion.div>


      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        <StatsCard icon={CheckCircle2} label="Deliveries" value={todayDeliveries} color="primary" />
        <StatsCard icon={DollarSign} label="Earnings" value={`₵${todayEarnings.toFixed(0)}`} color="accent" />
        <StatsCard icon={Star} label="Rating" value={agent?.average_rating || 0} color="warning" />
      </motion.div>

      {/* Active Delivery */}
      {activeOrders.length > 0 && (
        <motion.div variants={item}>
          <ActiveDeliveryCard />
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div variants={item}>
        <p className="text-sm font-semibold text-foreground mb-3">Quick Actions</p>
        <div className="grid grid-cols-4 gap-2">
          <QuickAction to="/agent/new-order" icon={PlusCircle} label="New Order" highlight />
          <QuickAction to="/agent/orders" icon={Package} label="Orders" />
          <QuickAction to="/agent/history" icon={History} label="History" />
          <QuickAction to="/agent/earnings" icon={TrendingUp} label="Earnings" />
        </div>
      </motion.div>

      {/* Recent Orders */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-foreground">Recent Orders</p>
          <Link to="/agent/orders" className="text-xs text-primary font-medium">
            View All
          </Link>
        </div>
        <div className="space-y-2">
          {orders.slice(0, 5).map((order) => (
            <Link
              key={order.id}
              to="/agent/orders"
              className="glass rounded-xl p-3 flex items-center gap-3 active:scale-[0.98] transition-transform"
            >
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                <MapPin className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{order.customerName}</span>
                  <span
                    className={cn(
                      "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                      order.status === "delivered"
                        ? "bg-primary/15 text-primary"
                        : order.status === "cancelled"
                        ? "bg-destructive/15 text-destructive"
                        : "bg-accent/15 text-accent"
                    )}
                  >
                    {order.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{order.deliveryAddress}</p>
              </div>
              <div className="text-right shrink-0">
                {order.fee > 0 && (
                  <p className="text-sm font-semibold text-accent">₵{order.fee.toFixed(2)}</p>
                )}
              </div>
            </Link>
          ))}
          {orders.length === 0 && (
            <div className="glass rounded-xl p-6 text-center">
              <p className="text-sm text-muted-foreground">No orders yet</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatsCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    primary: "text-primary bg-primary/10",
    accent: "text-accent bg-accent/10",
    warning: "text-accent bg-accent/10",
  };
  return (
    <div className="glass rounded-2xl p-3 space-y-2">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colorMap[color])}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-lg font-bold text-foreground">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
  highlight,
  onClick,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  highlight?: boolean;
  onClick?: () => void;
}) {
  const classes = cn(
    "flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all active:scale-95",
    highlight ? "bg-primary/15 border border-primary/30" : "glass"
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={classes}>
        <Icon className={cn("w-5 h-5", highlight ? "text-primary" : "text-muted-foreground")} />
        <span className={cn("text-[10px] font-medium", highlight ? "text-primary" : "text-muted-foreground")}>
          {label}
        </span>
      </button>
    );
  }

  return (
    <Link to={to} className={classes}>
      <Icon className={cn("w-5 h-5", highlight ? "text-primary" : "text-muted-foreground")} />
      <span className={cn("text-[10px] font-medium", highlight ? "text-primary" : "text-muted-foreground")}>
        {label}
      </span>
    </Link>
  );
}
