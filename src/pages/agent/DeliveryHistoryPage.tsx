import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Search, Eye, Receipt, Share2, Download, MessageCircle, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface DeliveryRecord {
  id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string | null;
  pickup_address: string;
  delivery_address: string;
  total_fee: number | null;
  proof_photo_url: string | null;
  status: string;
  updated_at: string;
  created_at: string;
  special_instructions: string | null;
  base_fee: number | null;
  distance_surcharge: number | null;
  weight_surcharge: number | null;
}

export default function DeliveryHistoryPage() {
  const { agent } = useAuth();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!agent) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("delivery_orders")
        .select("*")
        .eq("agent_user_id", agent.user_id)
        .eq("status", "delivered")
        .order("updated_at", { ascending: false });
      if (data) setDeliveries(data as DeliveryRecord[]);
      setLoading(false);
    };
    fetch();
  }, [agent]);

  const filtered = deliveries.filter(
    (d) =>
      d.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      d.order_code.toLowerCase().includes(search.toLowerCase()) ||
      d.delivery_address.toLowerCase().includes(search.toLowerCase())
  );

  const selected = selectedId ? deliveries.find((d) => d.id === selectedId) : null;

  const shareToWhatsApp = (d: DeliveryRecord) => {
    const phone = d.customer_phone?.replace(/[^0-9+]/g, "").replace("+", "") || "";
    const msg = encodeURIComponent(
      `📦 *DeliverPro Receipt*\n\n` +
      `Order: ${d.order_code}\n` +
      `Customer: ${d.customer_name}\n` +
      `Delivered to: ${d.delivery_address}\n` +
      `Fee: ₵${(d.total_fee || 0).toFixed(2)}\n` +
      `Date: ${format(new Date(d.updated_at), "dd MMM yyyy, hh:mm a")}\n\n` +
      `Thank you for choosing DeliverPro! 🚀`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <h1 className="text-xl font-bold text-foreground">Delivery History</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, code, or address..."
          className="w-full bg-secondary rounded-xl pl-10 pr-4 py-3 text-sm text-foreground outline-none focus:ring-2 ring-primary/50 placeholder:text-muted-foreground"
        />
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} completed deliveries</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 pb-24">
            {filtered.length === 0 && (
              <div className="glass rounded-2xl p-12 text-center">
                <Package className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No deliveries found</p>
              </div>
            )}

            {filtered.map((d) => (
              <motion.div
                key={d.id}
                layout
                className="glass rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">{d.customer_name}</p>
                    <p className="text-[10px] text-muted-foreground">{d.order_code} · {format(new Date(d.updated_at), "dd MMM yyyy")}</p>
                  </div>
                  <span className="text-sm font-bold text-accent">₵{(d.total_fee || 0).toFixed(2)}</span>
                </div>

                <p className="text-xs text-muted-foreground truncate">{d.delivery_address}</p>

                {/* Proof Photo Thumbnail */}
                {d.proof_photo_url && (
                  <div className="flex items-center gap-2">
                    <img src={d.proof_photo_url} alt="Proof" className="w-12 h-12 rounded-lg object-cover" />
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" /> Proof photo
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedId(selectedId === d.id ? null : d.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl glass text-xs font-bold text-foreground active:scale-95 transition-transform"
                  >
                    <Eye className="w-3.5 h-3.5" /> Details
                  </button>
                  <button
                    onClick={() => navigate(`/agent/receipt/${d.order_code}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold active:scale-95 transition-transform"
                  >
                    <Receipt className="w-3.5 h-3.5" /> Receipt
                  </button>
                  {d.customer_phone && (
                    <button
                      onClick={() => shareToWhatsApp(d)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#25D366]/15 text-[#25D366] text-xs font-bold active:scale-95 transition-transform"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {selectedId === d.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 border-t border-border pt-3"
                    >
                      <DetailRow label="Pickup" value={d.pickup_address} />
                      <DetailRow label="Delivery" value={d.delivery_address} />
                      <DetailRow label="Phone" value={d.customer_phone || "N/A"} />
                      <DetailRow label="Created" value={format(new Date(d.created_at), "dd MMM yyyy, hh:mm a")} />
                      <DetailRow label="Completed" value={format(new Date(d.updated_at), "dd MMM yyyy, hh:mm a")} />
                      {d.special_instructions && <DetailRow label="Notes" value={d.special_instructions} />}

                      {d.proof_photo_url && (
                        <div className="pt-2">
                          <p className="text-[10px] text-muted-foreground mb-1">Proof of Delivery</p>
                          <img src={d.proof_photo_url} alt="Proof" className="w-full rounded-xl max-h-48 object-cover" />
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs text-foreground text-right">{value}</span>
    </div>
  );
}
