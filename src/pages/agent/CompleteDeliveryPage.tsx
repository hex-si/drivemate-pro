import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, CheckSquare, PartyPopper, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useHubOrders } from "@/hooks/useHubOrders";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function CompleteDeliveryPage() {
  const navigate = useNavigate();
  const { orders, updateStatus } = useHubOrders();
  const { agent } = useAuth();
  const { toast } = useToast();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localOrder, setLocalOrder] = useState<any>(null);

  const order = orders.find(
    (o) => o.status === "on_the_way" || o.status === "picked_up"
  );

  // Fetch local order for fee breakdown
  useEffect(() => {
    if (!order || !agent) return;
    const fetchLocal = async () => {
      const { data } = await supabase
        .from("delivery_orders")
        .select("*")
        .eq("order_code", order.hubOrderId)
        .maybeSingle();
      if (data) setLocalOrder(data);
    };
    fetchLocal();
  }, [order?.hubOrderId, agent]);

  const fees = {
    base: localOrder?.base_fee || 0,
    distance: localOrder?.distance_surcharge || 0,
    weight: localOrder?.weight_surcharge || 0,
    fragility: localOrder?.fragility_surcharge || 0,
    weather: localOrder?.weather_adjustment || 0,
    urgency: localOrder?.urgency_bonus || 0,
  };
  const total = localOrder?.total_fee || order?.fee || 0;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleComplete = async () => {
    if (!order) return;
    setSubmitting(true);

    try {
      let photoUrl: string | null = null;

      // Upload proof photo
      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const path = `${order.hubOrderId}/${Date.now()}.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("delivery-proofs")
          .upload(path, photoFile);

        if (uploadError) {
          toast({ title: "Photo upload failed", description: uploadError.message, variant: "destructive" });
          setSubmitting(false);
          return;
        }
        photoUrl = supabase.storage.from("delivery-proofs").getPublicUrl(uploadData.path).data.publicUrl;
      }

      // Update local order with proof
      if (localOrder && photoUrl) {
        await supabase
          .from("delivery_orders")
          .update({ proof_photo_url: photoUrl, status: "delivered" as any })
          .eq("id", localOrder.id);
      }

      // Update hub status
      const { success, error } = await updateStatus(order.hubOrderId, "delivered");
      if (!success) {
        toast({ title: "Status update failed", description: error, variant: "destructive" });
        setSubmitting(false);
        return;
      }

      setCompleted(true);
      setTimeout(() => navigate("/agent/dashboard"), 3000);
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
      setSubmitting(false);
    }
  };

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
        >
          <PartyPopper className="w-20 h-20 text-accent mb-4" />
        </motion.div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Delivery Complete! 🎉</h1>
        <p className="text-muted-foreground mb-2">Great job! You earned</p>
        <p className="text-3xl font-bold text-accent mb-6">₵{total.toFixed(2)}</p>
        <p className="text-xs text-muted-foreground">Redirecting to dashboard...</p>
      </motion.div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
        <p className="text-lg font-semibold text-foreground">No delivery to complete</p>
        <p className="text-sm text-muted-foreground mt-1">Go back to your dashboard</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-5">
      <h1 className="text-xl font-bold text-foreground">Complete Delivery</h1>

      {/* Photo Upload */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">Proof of Delivery</p>
        {photoPreview ? (
          <div className="relative rounded-xl overflow-hidden">
            <img src={photoPreview} alt="Proof" className="w-full h-48 object-cover" />
            <button
              onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
              className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-background/80 text-xs text-foreground"
            >
              Retake
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed border-border cursor-pointer active:scale-[0.98] transition-transform">
            <Camera className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Tap to take photo</p>
            <p className="text-[10px] text-muted-foreground">or choose from gallery</p>
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
          </label>
        )}
      </div>

      {/* Confirmation */}
      <button
        onClick={() => setConfirmed(!confirmed)}
        className={cn(
          "w-full glass rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-all",
          confirmed && "border-primary/40 border"
        )}
      >
        <div className={cn(
          "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
          confirmed ? "bg-primary border-primary" : "border-muted-foreground"
        )}>
          {confirmed && <CheckSquare className="w-4 h-4 text-primary-foreground" />}
        </div>
        <p className="text-sm text-foreground">Recipient confirmed package received</p>
      </button>

      {/* Fee Breakdown */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">Fee Summary</p>
        <div className="space-y-2">
          {fees.base > 0 && <FeeRow label="Base fee" value={fees.base} />}
          {fees.distance > 0 && <FeeRow label="Distance surcharge" value={fees.distance} />}
          {fees.weight > 0 && <FeeRow label="Weight surcharge" value={fees.weight} />}
          {fees.fragility > 0 && <FeeRow label="Fragility surcharge" value={fees.fragility} />}
          {fees.weather > 0 && <FeeRow label="Weather adjustment" value={fees.weather} />}
          {fees.urgency > 0 && <FeeRow label="Urgency bonus" value={fees.urgency} />}
          <div className="border-t border-border pt-2 flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Total Earned</span>
            <span className="text-xl font-bold text-accent">₵{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Complete Button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleComplete}
        disabled={!photoFile || !confirmed || submitting}
        className={cn(
          "w-full py-4 rounded-2xl text-base font-bold transition-all flex items-center justify-center gap-2",
          photoFile && confirmed
            ? "bg-primary text-primary-foreground active:scale-[0.98]"
            : "bg-secondary text-muted-foreground cursor-not-allowed"
        )}
      >
        {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
        Complete Delivery
      </motion.button>
    </div>
  );
}

function FeeRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">₵{value.toFixed(2)}</span>
    </div>
  );
}
