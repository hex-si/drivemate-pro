import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { hubService } from "@/services/hubService";

type Status = "online" | "offline" | "busy";

export function useAgentAvailability() {
  const { user, agent } = useAuth();
  const [status, setStatus] = useState<Status>("offline");
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch current availability on mount
  useEffect(() => {
    if (!user || !agent) return;

    const fetchStatus = async () => {
      const { data } = await supabase
        .from("agent_availability")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        const dbStatus = data.status as Status;
        setStatus(dbStatus);
        // Sync to hub on load
        hubService.sendAvailability(dbStatus);
      }
      setLoading(false);
    };

    fetchStatus();
  }, [user, agent]);

  // Heartbeat: update last_seen every 30s while online/busy
  useEffect(() => {
    if (!user || status === "offline") {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const heartbeat = () => {
      supabase
        .from("agent_availability")
        .update({ last_seen: new Date().toISOString() })
        .eq("user_id", user.id)
        .then(() => {});
      // Also keep hub alive
      hubService.sendAvailability(status);
    };

    // Immediate heartbeat then every 30s
    heartbeat();
    intervalRef.current = setInterval(heartbeat, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user, status]);

  // Listen for page visibility changes to resync on foreground
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && status !== "offline") {
        hubService.sendAvailability(status);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [status]);

  const changeStatus = useCallback(
    async (newStatus: Status) => {
      if (!user || !agent) return;

      // Upsert availability row
      const { error } = await supabase
        .from("agent_availability")
        .upsert(
          {
            user_id: user.id,
            agent_id: agent.id,
            status: newStatus,
            last_seen: new Date().toISOString(),
          },
          { onConflict: "agent_id" }
        );

      if (!error) {
        setStatus(newStatus);
        // Push to hub immediately
        hubService.sendAvailability(newStatus);
      }
    },
    [user, agent]
  );

  return { status, changeStatus, loading };
}
