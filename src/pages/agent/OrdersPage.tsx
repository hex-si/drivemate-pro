import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MapPin, ArrowRight, AlertTriangle, Phone, MessageCircle, Check, X } from "lucide-react";
import { Link } from "react-router-dom";

type Tab = "new" | "active" | "completed" | "cancelled";

const tabs: { key: Tab; label: string; count: number }[] = [
  { key: "new", label: "New", count: 2 },
  { key: "active", label: "Active", count: 1 },
  { key: "completed", label: "Done", count: 24 },
  { key: "cancelled", label: "Cancelled", count: 3 },
];

const mockOrders = [
  {
    id: "ORD-1044", tab: "new", pickup: "12 Airport Bypass", delivery: "45 Spintex Rd",
    distance: 5.2, fee: 28.00, customer: "Kofi Asante", phone: "+233201234567",
    package: "Electronics", weight: 2.5, fragile: true, time: "5 min ago",
  },
  {
    id: "ORD-1045", tab: "new", pickup: "3 Osu Badu St", delivery: "17 Labadi Beach Rd",
    distance: 2.1, fee: 15.50, customer: "Esi Mensah", phone: "+233209876543",
    package: "Documents", weight: 0.3, fragile: false, time: "12 min ago",
  },
  {
    id: "ORD-1043", tab: "active", pickup: "15 Airport Residential", delivery: "22 East Legon",
    distance: 3.8, fee: 22.00, customer: "Ama Mensah", phone: "+233205551234",
    package: "Food delivery", weight: 1.2, fragile: false, time: "30 min ago",
  },
  {
    id: "ORD-1042", tab: "completed", pickup: "12 Osu Oxford St", delivery: "8 Cantonments",
    distance: 1.5, fee: 18.50, customer: "Yaw Boateng", phone: "+233201112233",
    package: "Clothing", weight: 0.8, fragile: false, time: "2h ago",
  },
  {
    id: "ORD-1039", tab: "cancelled", pickup: "6 Tema Hwy", delivery: "14 Teshie Rd",
    distance: 7.0, fee: 0, customer: "Akua Darko", phone: "+233207778899",
    package: "Furniture", weight: 15.0, fragile: true, time: "Yesterday",
  },
];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<Tab>("new");
  const filtered = mockOrders.filter((o) => o.tab === activeTab);

  return (
    <div className="px-4 py-4 space-y-4">
      <h1 className="text-xl font-bold text-foreground">Orders</h1>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all active:scale-95",
              activeTab === tab.key
                ? "bg-primary text-primary-foreground"
                : "glass text-muted-foreground"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                activeTab === tab.key
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        {filtered.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-muted-foreground text-sm">No orders in this category</p>
          </div>
        )}
        {filtered.map((order) => (
          <OrderCard key={order.id} order={order} tab={activeTab} />
        ))}
      </motion.div>
    </div>
  );
}

function OrderCard({ order, tab }: { order: typeof mockOrders[0]; tab: Tab }) {
  return (
    <div className="glass rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">{order.id}</span>
          {order.fragile && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-destructive bg-destructive/15 px-1.5 py-0.5 rounded-full">
              <AlertTriangle className="w-3 h-3" />
              Fragile
            </span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground">{order.time}</span>
      </div>

      {/* Addresses */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="w-px h-6 bg-border" />
          <div className="w-2 h-2 rounded-full bg-accent" />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <p className="text-xs text-foreground truncate">{order.pickup}</p>
          <p className="text-xs text-foreground truncate">{order.delivery}</p>
        </div>
      </div>

      {/* Info row */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{order.distance} km</span>
        <span>•</span>
        <span>{order.weight} kg</span>
        <span>•</span>
        <span>{order.package}</span>
      </div>

      {/* Fee + Actions */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-lg font-bold text-accent">₵{order.fee.toFixed(2)}</span>
          <p className="text-[10px] text-muted-foreground">{order.customer}</p>
        </div>
        {tab === "new" && (
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl bg-destructive/15 text-destructive text-sm font-semibold active:scale-95 transition-transform">
              Reject
            </button>
            <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold active:scale-95 transition-transform">
              Accept
            </button>
          </div>
        )}
        {tab === "active" && (
          <Link
            to="/agent/active-delivery"
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold active:scale-95 transition-transform"
          >
            Track
          </Link>
        )}
        {(tab === "completed" || tab === "cancelled") && (
          <div className="flex gap-2">
            <a href={`tel:${order.phone}`} className="p-2 rounded-xl glass active:scale-95 transition-transform">
              <Phone className="w-4 h-4 text-muted-foreground" />
            </a>
            <a
              href={`https://wa.me/${order.phone.replace("+", "")}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl glass active:scale-95 transition-transform"
            >
              <MessageCircle className="w-4 h-4 text-primary" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
