import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agentId, setAgentId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentId.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("hub-auth", {
        body: { agentId: agentId.trim() },
      });

      if (error) {
        toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }

      if (data?.error) {
        toast({ title: "Sign in failed", description: data.error, variant: "destructive" });
        setLoading(false);
        return;
      }

      if (data?.session) {
        // Set the session from the hub-auth response
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        toast({ title: `Welcome, ${data.agent?.fullName || agentId}!` });
        navigate("/agent/dashboard");
      }
    } catch (err) {
      toast({ title: "Connection error", description: "Could not reach the server", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-10">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-3xl bg-primary/15 flex items-center justify-center mx-auto">
            <Truck className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Deliver<span className="text-primary">Pro</span>
          </h1>
          <p className="text-muted-foreground">Enter your Agent ID to sign in</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Agent ID</label>
            <input
              type="text"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value.toUpperCase())}
              placeholder="AG-001"
              required
              autoFocus
              className="w-full h-16 px-5 rounded-2xl bg-secondary border-2 border-border text-foreground text-2xl font-bold text-center tracking-widest placeholder:text-muted-foreground/40 placeholder:font-normal placeholder:text-xl focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !agentId.trim()}
            className="w-full h-16 rounded-2xl bg-primary text-primary-foreground text-xl font-bold flex items-center justify-center gap-3 active:scale-[0.97] transition-transform disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Your Agent ID is provided by your admin.<br />
          All accounts are managed through the Central Hub.
        </p>
      </div>
    </div>
  );
}
