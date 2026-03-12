import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, ClipboardList, Send, Loader2, MapPin, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Mode = "quick" | "full" | null;

export default function NewOrderPage() {
  const navigate = useNavigate();
  const { agent } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{ orderCode: string; phone: string; address: string } | null>(null);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [packageDesc, setPackageDesc] = useState("");
  const [packageWeight, setPackageWeight] = useState("");
  const [isFragile, setIsFragile] = useState(false);
  const [items, setItems] = useState<{ name: string; quantity: number; price: number }[]>([]);
  const [itemName, setItemName] = useState("");
  const [itemQty, setItemQty] = useState("1");
  const [itemPrice, setItemPrice] = useState("");

  const orderCode = `DP-${Date.now().toString(36).toUpperCase()}`;

  const addItem = () => {
    if (!itemName.trim() || !itemPrice) return;
    setItems([...items, { name: itemName.trim(), quantity: Number(itemQty) || 1, price: Number(itemPrice) || 0 }]);
    setItemName("");
    setItemQty("1");
    setItemPrice("");
  };

  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const canSubmit = customerName.trim() && customerPhone.trim() && deliveryAddress.trim() && pickupAddress.trim();

  const handleSubmit = async () => {
    if (!canSubmit || !agent) return;
    setSubmitting(true);

    const totalFee = items.reduce((s, i) => s + i.price * i.quantity, 0);

    const { error } = await supabase.from("delivery_orders").insert({
      order_code: orderCode,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      pickup_address: pickupAddress.trim(),
      delivery_address: deliveryAddress.trim(),
      special_instructions: specialInstructions.trim() || null,
      package_description: packageDesc.trim() || null,
      package_weight_kg: packageWeight ? Number(packageWeight) : 0,
      is_fragile: isFragile,
      agent_id: agent.id,
      agent_user_id: agent.user_id,
      status: "accepted" as any,
      total_fee: totalFee,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Failed to create order", description: error.message, variant: "destructive" });
      return;
    }

    // Auto-save customer for repeat tracking
    try {
      const { data: existing } = await supabase
        .from("customers")
        .select("id, total_orders")
        .eq("agent_user_id", agent.user_id)
        .eq("phone", customerPhone.trim())
        .maybeSingle();

      if (existing) {
        await supabase.from("customers").update({
          total_orders: (existing.total_orders || 0) + 1,
          address: deliveryAddress.trim(),
        }).eq("id", existing.id);
      } else {
        await supabase.from("customers").insert({
          agent_user_id: agent.user_id,
          name: customerName.trim(),
          phone: customerPhone.trim(),
          address: deliveryAddress.trim(),
          total_orders: 1,
        });
      }
    } catch {}

    setCreated({ orderCode, phone: customerPhone.trim(), address: deliveryAddress.trim() });
    toast({ title: "Order created! ✓" });
  };

  const sendWhatsAppLocationRequest = () => {
    if (!created) return;
    const cleanPhone = created.phone.replace(/[^0-9+]/g, "").replace("+", "");
    const msg = encodeURIComponent(
      `Hi ${customerName}! 🚀 Your delivery from DeliverPro is confirmed.\n\n` +
      `📦 Order: ${created.orderCode}\n` +
      `📍 Delivery to: ${created.address}\n\n` +
      `To help us find you accurately, please share your *live location* via WhatsApp by:\n` +
      `1. Tap the 📎 (attach) button\n` +
      `2. Select "Location"\n` +
      `3. Choose "Share Live Location" (15 min)\n\n` +
      `Or share your Google Plus Code from Google Maps. Thank you! 🙏`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
  };

  const sendWhatsAppUpdate = (message: string) => {
    if (!created) return;
    const cleanPhone = created.phone.replace(/[^0-9+]/g, "").replace("+", "");
    const msg = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
  };

  // Success state
  if (created) {
    return (
      <div className="px-4 py-4 space-y-5">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-3 py-6">
          <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto">
            <Send className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Order Created!</h1>
          <p className="text-sm text-muted-foreground">{created.orderCode}</p>
        </motion.div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Send Customer Updates</p>

          <button
            onClick={sendWhatsAppLocationRequest}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#25D366]/15 text-[#25D366] text-base font-bold active:scale-95 transition-transform"
          >
            <MapPin className="w-5 h-5" /> Request Location via WhatsApp
          </button>

          <button
            onClick={() => sendWhatsAppUpdate(
              `Hi ${customerName}! Your DeliverPro agent is on the way to pick up your package. 🚗 We'll update you when we're headed your way!`
            )}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#25D366]/15 text-[#25D366] text-base font-bold active:scale-95 transition-transform"
          >
            <MessageCircle className="w-5 h-5" /> Send Pickup Update
          </button>

          <button
            onClick={() => sendWhatsAppUpdate(
              `Hi ${customerName}! Your package has been picked up and we're on the way to ${created.address}! 📦🚀 ETA: Shortly.`
            )}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#25D366]/15 text-[#25D366] text-base font-bold active:scale-95 transition-transform"
          >
            <MessageCircle className="w-5 h-5" /> Send On-The-Way Update
          </button>

          <button
            onClick={() => navigate("/agent/orders")}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground text-base font-bold active:scale-95 transition-transform"
          >
            Go to Orders
          </button>
        </div>
      </div>
    );
  }

  // Mode selection
  if (!mode) {
    return (
      <div className="px-4 py-4 space-y-5">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">New Order</h1>
        <p className="text-sm text-muted-foreground">Choose order type</p>

        <div className="space-y-3">
          <button
            onClick={() => setMode("quick")}
            className="w-full glass rounded-2xl p-5 flex items-center gap-4 active:scale-[0.98] transition-transform text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-base font-bold text-foreground">Quick Order</p>
              <p className="text-xs text-muted-foreground">Name, phone, addresses — fast & simple</p>
            </div>
          </button>

          <button
            onClick={() => setMode("full")}
            className="w-full glass rounded-2xl p-5 flex items-center gap-4 active:scale-[0.98] transition-transform text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
              <ClipboardList className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-base font-bold text-foreground">Full Order</p>
              <p className="text-xs text-muted-foreground">Items, weight, fragility, instructions</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4 pb-32">
      <div className="flex items-center gap-3">
        <button onClick={() => setMode(null)} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">{mode === "quick" ? "Quick" : "Full"} Order</h1>
      </div>

      {/* Customer Info */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</p>
        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Customer name *"
          className="w-full bg-secondary rounded-xl px-3 py-3 text-sm text-foreground outline-none focus:ring-2 ring-primary/50 placeholder:text-muted-foreground"
        />
        <input
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="Phone number * (e.g. +233...)"
          type="tel"
          className="w-full bg-secondary rounded-xl px-3 py-3 text-sm text-foreground outline-none focus:ring-2 ring-primary/50 placeholder:text-muted-foreground"
        />
      </div>

      {/* Addresses */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Addresses</p>
        <input
          value={pickupAddress}
          onChange={(e) => setPickupAddress(e.target.value)}
          placeholder="Pickup address *"
          className="w-full bg-secondary rounded-xl px-3 py-3 text-sm text-foreground outline-none focus:ring-2 ring-primary/50 placeholder:text-muted-foreground"
        />
        <input
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          placeholder="Delivery address *"
          className="w-full bg-secondary rounded-xl px-3 py-3 text-sm text-foreground outline-none focus:ring-2 ring-primary/50 placeholder:text-muted-foreground"
        />
      </div>

      {/* Full mode extras */}
      {mode === "full" && (
        <>
          {/* Package Details */}
          <div className="glass rounded-2xl p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Package</p>
            <input
              value={packageDesc}
              onChange={(e) => setPackageDesc(e.target.value)}
              placeholder="Package description"
              className="w-full bg-secondary rounded-xl px-3 py-3 text-sm text-foreground outline-none focus:ring-2 ring-primary/50 placeholder:text-muted-foreground"
            />
            <div className="flex gap-3">
              <input
                value={packageWeight}
                onChange={(e) => setPackageWeight(e.target.value)}
                placeholder="Weight (kg)"
                type="number"
                className="flex-1 bg-secondary rounded-xl px-3 py-3 text-sm text-foreground outline-none focus:ring-2 ring-primary/50 placeholder:text-muted-foreground"
              />
              <button
                onClick={() => setIsFragile(!isFragile)}
                className={cn(
                  "px-4 rounded-xl text-sm font-bold transition-all",
                  isFragile ? "bg-destructive/15 text-destructive border border-destructive/30" : "bg-secondary text-muted-foreground"
                )}
              >
                {isFragile ? "⚠️ Fragile" : "Not Fragile"}
              </button>
            </div>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Special instructions..."
              rows={2}
              className="w-full bg-secondary rounded-xl px-3 py-3 text-sm text-foreground outline-none focus:ring-2 ring-primary/50 placeholder:text-muted-foreground resize-none"
            />
          </div>

          {/* Items */}
          <div className="glass rounded-2xl p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Items</p>
            {items.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-secondary rounded-xl px-3 py-2">
                <span className="text-sm text-foreground">{item.quantity}x {item.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">₵{item.price.toFixed(2)}</span>
                  <button onClick={() => removeItem(i)} className="text-destructive text-xs font-bold">✕</button>
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Item name"
                className="flex-1 bg-secondary rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 ring-primary/50 placeholder:text-muted-foreground"
              />
              <input
                value={itemQty}
                onChange={(e) => setItemQty(e.target.value)}
                placeholder="Qty"
                type="number"
                className="w-14 bg-secondary rounded-xl px-2 py-2.5 text-sm text-foreground outline-none focus:ring-2 ring-primary/50 text-center placeholder:text-muted-foreground"
              />
              <input
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                placeholder="₵"
                type="number"
                className="w-20 bg-secondary rounded-xl px-2 py-2.5 text-sm text-foreground outline-none focus:ring-2 ring-primary/50 placeholder:text-muted-foreground"
              />
              <button onClick={addItem} className="px-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold">+</button>
            </div>
          </div>
        </>
      )}

      {/* Submit */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className={cn(
          "w-full py-4 rounded-2xl text-base font-bold transition-all flex items-center justify-center gap-2",
          canSubmit ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground cursor-not-allowed"
        )}
      >
        {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
        Create Order
      </motion.button>
    </div>
  );
}
