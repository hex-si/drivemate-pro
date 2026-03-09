import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Package, Calendar, DollarSign, Star, CreditCard, CheckCircle2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { subDays, subWeeks, startOfWeek, endOfWeek, format, formatDistanceToNow } from "date-fns";

type Period = "daily" | "weekly" | "monthly";

export default function EarningsPage() {
  const { agent, user } = useAuth();
  const [period, setPeriod] = useState<Period>("daily");
  const [deliveredOrders, setDeliveredOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"earnings" | "payments">("earnings");

  useEffect(() => {
    if (!agent) return;
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("delivery_orders")
        .select("*")
        .eq("agent_user_id", agent.user_id)
        .eq("status", "delivered")
        .order("updated_at", { ascending: false });
      if (data) setDeliveredOrders(data);
    };
    fetchOrders();
  }, [agent]);

  useEffect(() => {
    if (!user) return;
    const fetchPayments = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("type", "earnings")
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) setPayments(data);
    };
    fetchPayments();
  }, [user]);

  const lifetime = deliveredOrders.reduce((s, o) => s + (o.total_fee || 0), 0);

  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEarnings = deliveredOrders
    .filter((o) => new Date(o.updated_at) >= weekStart)
    .reduce((s, o) => s + (o.total_fee || 0), 0);

  const todayStr = format(now, "yyyy-MM-dd");
  const todayEarnings = deliveredOrders
    .filter((o) => o.updated_at?.startsWith(todayStr))
    .reduce((s, o) => s + (o.total_fee || 0), 0);

  const avgFee = deliveredOrders.length > 0 ? lifetime / deliveredOrders.length : 0;

  const chartData = useMemo(() => {
    if (period === "daily") {
      return Array.from({ length: 14 }, (_, i) => {
        const date = subDays(now, 13 - i);
        const dateStr = format(date, "yyyy-MM-dd");
        const value = deliveredOrders
          .filter((o) => o.updated_at?.startsWith(dateStr))
          .reduce((s, o) => s + (o.total_fee || 0), 0);
        return { label: format(date, "d/M"), value };
      });
    }
    if (period === "weekly") {
      return Array.from({ length: 8 }, (_, i) => {
        const ws = startOfWeek(subWeeks(now, 7 - i));
        const we = endOfWeek(ws);
        const value = deliveredOrders
          .filter((o) => { const d = new Date(o.updated_at); return d >= ws && d <= we; })
          .reduce((s, o) => s + (o.total_fee || 0), 0);
        return { label: `W${i + 1}`, value };
      });
    }
    // monthly - last 12 months
    return Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const monthStr = format(monthDate, "yyyy-MM");
      const value = deliveredOrders
        .filter((o) => o.updated_at?.startsWith(monthStr))
        .reduce((s, o) => s + (o.total_fee || 0), 0);
      return { label: format(monthDate, "MMM"), value };
    });
  }, [deliveredOrders, period]);

  const bestPeriod = chartData.reduce((max, d) => (d.value > max.value ? d : max), chartData[0]);

  const weekOrderCount = deliveredOrders.filter(
    (o) => new Date(o.updated_at) >= weekStart
  ).length;

  return (
    <div className="px-4 py-4 space-y-5">
      {/* Hero */}
      <div className="text-center space-y-1">
        <p className="text-sm text-muted-foreground">Lifetime Earnings</p>
        <h1 className="text-4xl font-bold text-gradient-amber">₵{lifetime.toFixed(2)}</h1>
        <div className="flex items-center justify-center gap-3 mt-2">
          <span className="px-3 py-1 rounded-full glass text-xs font-medium text-foreground">
            This week: <span className="text-accent">₵{weekEarnings.toFixed(2)}</span>
          </span>
          <span className="px-3 py-1 rounded-full glass text-xs font-medium text-foreground">
            Today: <span className="text-accent">₵{todayEarnings.toFixed(2)}</span>
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Analytics</p>
          <div className="flex gap-1">
            {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium transition-all",
                  period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <motion.div key={period} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 6% 18%)" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(240 5% 55%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(240 5% 55%)" }} axisLine={false} tickLine={false} width={35} />
              <Tooltip
                contentStyle={{
                  background: "hsl(240 10% 8%)",
                  border: "1px solid hsl(240 6% 18%)",
                  borderRadius: "12px",
                  fontSize: 12,
                  color: "#fff",
                }}
              />
              <Bar dataKey="value" fill="hsl(43 100% 49%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
        {bestPeriod && bestPeriod.value > 0 && (
          <p className="text-[10px] text-muted-foreground text-center">
            Best: <span className="text-accent font-medium">{bestPeriod.label}</span> — ₵{bestPeriod.value.toFixed(2)}
          </p>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Package} label="Total Deliveries" value={String(deliveredOrders.length)} />
        <StatCard icon={Calendar} label="This Week" value={String(weekOrderCount)} />
        <StatCard icon={DollarSign} label="Avg Fee" value={`₵${avgFee.toFixed(2)}`} />
        <StatCard icon={Star} label="Rating" value={`${agent?.average_rating || 0} ⭐`} />
      </div>

      {/* Tabbed History */}
      <div>
        <div className="flex gap-1 mb-3">
          <button
            onClick={() => setActiveTab("earnings")}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
              activeTab === "earnings" ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
            )}
          >
            Delivery Earnings
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
              activeTab === "payments" ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
            )}
          >
            Confirmed Payments
          </button>
        </div>

        <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          {activeTab === "earnings" && (
            <>
              {deliveredOrders.length === 0 && (
                <div className="glass rounded-xl p-6 text-center">
                  <p className="text-sm text-muted-foreground">No delivered orders yet</p>
                </div>
              )}
              {deliveredOrders.slice(0, 20).map((o) => (
                <div key={o.id} className="glass rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{o.order_code}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(o.updated_at), "MMM d, yyyy")} · {o.delivery_address?.slice(0, 30)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-accent">₵{(o.total_fee || 0).toFixed(2)}</span>
                </div>
              ))}
            </>
          )}

          {activeTab === "payments" && (
            <>
              {payments.length === 0 && (
                <div className="glass rounded-xl p-6 text-center">
                  <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No confirmed payments yet</p>
                </div>
              )}
              {payments.map((p) => {
                const meta = (p.metadata as any) || {};
                const timeAgo = formatDistanceToNow(new Date(p.created_at), { addSuffix: true });
                return (
                  <div key={p.id} className="glass rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {meta.order_code || "Payment"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {timeAgo}{meta.customer_name ? ` · ${meta.customer_name}` : ""}
                          {meta.payment_method ? ` · ${meta.payment_method}` : ""}
                        </p>
                      </div>
                    </div>
                    {meta.amount != null && (
                      <span className="text-sm font-bold text-accent">₦{Number(meta.amount).toFixed(2)}</span>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-3 space-y-2">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
