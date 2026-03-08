import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Package, Calendar, DollarSign, Star, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

type Period = "daily" | "weekly" | "monthly";

const dailyData = Array.from({ length: 14 }, (_, i) => ({
  label: `${14 - i}d`,
  value: Math.floor(Math.random() * 80 + 20),
}));
const weeklyData = Array.from({ length: 8 }, (_, i) => ({
  label: `W${8 - i}`,
  value: Math.floor(Math.random() * 400 + 100),
}));
const monthlyData = Array.from({ length: 12 }, (_, i) => ({
  label: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  value: Math.floor(Math.random() * 1500 + 300),
}));

const chartData: Record<Period, typeof dailyData> = {
  daily: dailyData,
  weekly: weeklyData,
  monthly: monthlyData,
};

const mockHistory = [
  { id: "ORD-1042", date: "Mar 7", address: "12 Osu Oxford St", fee: 18.50 },
  { id: "ORD-1041", date: "Mar 7", address: "5 Cantonments Rd", fee: 22.00 },
  { id: "ORD-1040", date: "Mar 6", address: "8 Dzorwulu Ave", fee: 14.00 },
  { id: "ORD-1038", date: "Mar 6", address: "3 Labone Link", fee: 30.00 },
  { id: "ORD-1035", date: "Mar 5", address: "17 Achimota Rd", fee: 25.50 },
];

export default function EarningsPage() {
  const [period, setPeriod] = useState<Period>("daily");
  const data = chartData[period];
  const bestDay = data.reduce((max, d) => (d.value > max.value ? d : max), data[0]);

  return (
    <div className="px-4 py-4 space-y-5">
      {/* Hero */}
      <div className="text-center space-y-1">
        <p className="text-sm text-muted-foreground">Lifetime Earnings</p>
        <h1 className="text-4xl font-bold text-gradient-amber">₵4,285.50</h1>
        <div className="flex items-center justify-center gap-3 mt-2">
          <span className="px-3 py-1 rounded-full glass text-xs font-medium text-foreground">
            This week: <span className="text-accent">₵342.00</span>
          </span>
          <span className="px-3 py-1 rounded-full glass text-xs font-medium text-foreground">
            Today: <span className="text-accent">₵124.50</span>
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
        <motion.div
          key={period}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-48"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 6% 18%)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "hsl(240 5% 55%)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(240 5% 55%)" }}
                axisLine={false}
                tickLine={false}
                width={35}
              />
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
        <p className="text-[10px] text-muted-foreground text-center">
          Best: <span className="text-accent font-medium">{bestDay.label}</span> — ₵{bestDay.value}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Package} label="Total Deliveries" value="186" />
        <StatCard icon={Calendar} label="This Week" value="12" />
        <StatCard icon={DollarSign} label="Avg Fee" value="₵23.04" />
        <StatCard icon={Star} label="Rating" value="4.8 ⭐" />
      </div>

      {/* History */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">Earnings History</p>
        <div className="space-y-2">
          {mockHistory.map((item) => (
            <div key={item.id} className="glass rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{item.id}</p>
                <p className="text-xs text-muted-foreground">
                  {item.date} · {item.address}
                </p>
              </div>
              <span className="text-sm font-bold text-accent">₵{item.fee.toFixed(2)}</span>
            </div>
          ))}
        </div>
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
