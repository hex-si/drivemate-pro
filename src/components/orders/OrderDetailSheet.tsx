import { useState } from "react";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription,
} from "@/components/ui/drawer";
import { Phone, MessageCircle, MapPin, Navigation, Copy, Locate, Loader2, Receipt, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HubOrder } from "@/services/hubService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Props {
  order: HubOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function OrderDetailSheet({ order, open, onOpenChange }: Props) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [plusCode, setPlusCode] = useState("");
  const [locating, setLocating] = useState(false);
  const [savingPlus, setSavingPlus] = useState(false);

  if (!order) return null;

  const whatsappMsg = encodeURIComponent(
    `Hi ${order.customerName}, I'm your DeliverPro agent. I'm handling your delivery to ${order.deliveryAddress}. I'll update you as I go! 🚀`
  );
  const cleanPhone = order.customerPhone?.replace(/[^0-9+]/g, "").replace("+", "") || "";

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "GPS not available", variant: "destructive" });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        window.open(
          `https://www.google.com/maps?q=${latitude},${longitude}`,
          "_blank"
        );
        setLocating(false);
      },
      (err) => {
        toast({ title: "Location error", description: err.message, variant: "destructive" });
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const savePlusCode = async () => {
    if (!plusCode.trim()) return;
    setSavingPlus(true);
    const { error } = await supabase
      .from("delivery_orders")
      .update({ plus_code: plusCode.trim() })
      .eq("order_code", order.hubOrderId);
    setSavingPlus(false);
    if (error) {
      toast({ title: "Failed to save Plus Code", variant: "destructive" });
    } else {
      toast({ title: "Plus Code saved ✓" });
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-lg">{order.customerName}</DrawerTitle>
          <DrawerDescription>{order.hubOrderId} · {order.sourceSite}</DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-6 space-y-4 overflow-y-auto">
          {/* Contact Actions */}
          {order.customerPhone && (
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${order.customerPhone}`}
                className="flex items-center justify-center gap-2 py-3 rounded-xl glass text-sm font-bold text-foreground active:scale-95 transition-transform"
              >
                <Phone className="w-4 h-4" /> Call
              </a>
              <a
                href={`https://wa.me/${cleanPhone}?text=${whatsappMsg}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366]/15 text-[#25D366] text-sm font-bold active:scale-95 transition-transform"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            </div>
          )}

          {/* Addresses */}
          <div className="glass rounded-2xl p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Addresses</p>
            {order.pickupAddress && (
              <div className="flex items-start gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Pickup</p>
                  <p className="text-sm text-foreground">{order.pickupAddress}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-accent mt-1.5 shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">Delivery</p>
                <p className="text-sm text-foreground">{order.deliveryAddress}</p>
              </div>
            </div>
            <button
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`, "_blank")}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-bold active:scale-95 transition-transform"
            >
              <Navigation className="w-4 h-4" /> Navigate in Maps
            </button>
          </div>

          {/* Plus Code / GPS Location */}
          <div className="glass rounded-2xl p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer Location</p>
            <button
              onClick={captureLocation}
              disabled={locating}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent/15 text-accent text-sm font-bold active:scale-95 transition-transform disabled:opacity-50"
            >
              {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Locate className="w-4 h-4" />}
              {locating ? "Getting location..." : "Map Locate Me (at customer)"}
            </button>
            <div className="flex gap-2">
              <input
                type="text"
                value={plusCode}
                onChange={(e) => setPlusCode(e.target.value)}
                placeholder="Plus Code (optional) e.g. GQ62+7X"
                className="flex-1 bg-secondary rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 ring-primary/50"
              />
              <button
                onClick={savePlusCode}
                disabled={!plusCode.trim() || savingPlus}
                className="px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold active:scale-95 transition-transform disabled:opacity-50"
              >
                {savingPlus ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </button>
            </div>
          </div>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <div className="glass rounded-2xl p-4 border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-accent" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Delivery Notes</p>
              </div>
              <p className="text-sm text-muted-foreground">{order.specialInstructions}</p>
            </div>
          )}

          {/* Items + Total */}
          {order.items.length > 0 && (
            <div className="glass rounded-2xl p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Items</p>
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
                  <span className="text-foreground font-medium">₵{item.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-border pt-2 mt-2">
                <span className="text-sm font-bold text-foreground">Total</span>
                <span className="text-sm font-bold text-foreground">₵{order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Your Fee</span>
                <span className="text-sm font-bold text-accent">₵{order.fee.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Generate Receipt */}
          {order.status === "delivered" && (
            <button
              onClick={() => {
                onOpenChange(false);
                navigate(`/agent/receipt/${order.hubOrderId}`);
              }}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-primary-foreground text-base font-bold active:scale-95 transition-transform"
            >
              <Receipt className="w-5 h-5" /> Generate Receipt
            </button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
