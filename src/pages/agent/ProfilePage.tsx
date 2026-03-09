import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Camera, Bike, Car, Footprints, Star, Package, DollarSign, Calendar, Save, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

type Vehicle = "bike" | "car" | "foot";

const vehicles: { key: Vehicle; icon: React.ElementType; label: string }[] = [
  { key: "bike", icon: Bike, label: "Bike" },
  { key: "car", icon: Car, label: "Car" },
  { key: "foot", icon: Footprints, label: "Foot" },
];

export default function ProfilePage() {
  const { agent } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [vehicle, setVehicle] = useState<Vehicle>("bike");
  const [saving, setSaving] = useState(false);
  const { canInstall, install } = useInstallPrompt();

  useEffect(() => {
    if (agent) {
      setName(agent.full_name || "");
      setPhone(agent.phone || "");
      setEmail(agent.email || "");
      setVehicle((agent.vehicle as Vehicle) || "bike");
    }
  }, [agent]);

  const handleSave = async () => {
    if (!agent) return;
    setSaving(true);
    const { error } = await supabase
      .from("delivery_agents")
      .update({ full_name: name, phone, email, vehicle })
      .eq("user_id", agent.user_id);
    setSaving(false);
    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated successfully!");
    }
  };

  const memberSince = agent?.created_at
    ? format(new Date(agent.created_at), "MMM yyyy")
    : "—";

  return (
    <div className="px-4 py-4 space-y-5">
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center text-3xl font-bold text-primary">
            {(agent?.full_name?.[0] || "A").toUpperCase()}
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center active:scale-90 transition-transform">
            <Camera className="w-3.5 h-3.5 text-primary-foreground" />
          </button>
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">{agent?.full_name || "Agent"}</h1>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-bold mt-1">
            {agent?.agent_code || "—"}
          </span>
        </div>
        {agent?.is_verified && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            ✅ Verified
          </span>
        )}
      </div>

      {/* Editable Fields */}
      <div className="space-y-3">
        <div className="glass rounded-2xl p-4 space-y-4">
          <p className="text-sm font-semibold text-foreground">Personal Info</p>
          <Field label="Full Name" value={name} onChange={setName} />
          <Field label="Phone" value={phone} onChange={setPhone} type="tel" />
          <Field label="Email" value={email} onChange={setEmail} type="email" />
        </div>

        {/* Vehicle Selector */}
        <div className="glass rounded-2xl p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Vehicle Type</p>
          <div className="grid grid-cols-3 gap-2">
            {vehicles.map((v) => (
              <button
                key={v.key}
                onClick={() => setVehicle(v.key)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl transition-all active:scale-95",
                  vehicle === v.key
                    ? "bg-primary/15 border border-primary/40"
                    : "glass"
                )}
              >
                <v.icon className={cn("w-6 h-6", vehicle === v.key ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-xs font-medium", vehicle === v.key ? "text-primary" : "text-muted-foreground")}>
                  {v.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">Performance</p>
        <div className="grid grid-cols-2 gap-3">
          <PerfStat icon={Star} label="Avg Rating" value={String(agent?.average_rating || 0)} />
          <PerfStat icon={Package} label="Deliveries" value={String(agent?.total_deliveries || 0)} />
          <PerfStat icon={DollarSign} label="Earnings" value={`₵${(agent?.total_earnings || 0).toLocaleString()}`} />
          <PerfStat icon={Calendar} label="Member Since" value={memberSince} />
        </div>
      </div>

      {/* Save */}
      <div className="space-y-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Changes
        </motion.button>

        {canInstall && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={install}
            className="w-full py-4 rounded-2xl glass text-foreground text-base font-bold flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5 text-primary" />
            Install App
          </motion.button>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 ring-primary/50 transition-all"
      />
    </div>
  );
}

function PerfStat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-2">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <div>
        <p className="text-sm font-bold text-foreground">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
