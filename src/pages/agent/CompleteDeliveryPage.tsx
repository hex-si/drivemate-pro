import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, CheckSquare, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export default function CompleteDeliveryPage() {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [completed, setCompleted] = useState(false);

  const fees = {
    base: 15.00,
    distance: 5.50,
    weight: 1.50,
    fragility: 0,
    weather: 0,
    urgency: 0,
  };
  const total = Object.values(fees).reduce((a, b) => a + b, 0);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(URL.createObjectURL(file));
    }
  };

  const handleComplete = () => {
    setCompleted(true);
    setTimeout(() => navigate("/agent/dashboard"), 3000);
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

  return (
    <div className="px-4 py-4 space-y-5">
      <h1 className="text-xl font-bold text-foreground">Complete Delivery</h1>

      {/* Photo Upload */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">Proof of Delivery</p>
        {photo ? (
          <div className="relative rounded-xl overflow-hidden">
            <img src={photo} alt="Proof" className="w-full h-48 object-cover" />
            <button
              onClick={() => setPhoto(null)}
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
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoUpload}
            />
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
        <div
          className={cn(
            "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
            confirmed ? "bg-primary border-primary" : "border-muted-foreground"
          )}
        >
          {confirmed && <CheckSquare className="w-4 h-4 text-primary-foreground" />}
        </div>
        <p className="text-sm text-foreground">Recipient confirmed package received</p>
      </button>

      {/* Fee Breakdown */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">Fee Summary</p>
        <div className="space-y-2">
          <FeeRow label="Base fee" value={fees.base} />
          <FeeRow label="Distance surcharge" value={fees.distance} />
          <FeeRow label="Weight surcharge" value={fees.weight} />
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
        disabled={!photo || !confirmed}
        className={cn(
          "w-full py-4 rounded-2xl text-base font-bold transition-all",
          photo && confirmed
            ? "bg-primary text-primary-foreground active:scale-[0.98]"
            : "bg-secondary text-muted-foreground cursor-not-allowed"
        )}
      >
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
