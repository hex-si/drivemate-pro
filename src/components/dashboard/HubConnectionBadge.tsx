import { cn } from "@/lib/utils";
import { Wifi, WifiOff } from "lucide-react";
import { useHubConnection } from "@/hooks/useHubConnection";

export default function HubConnectionBadge() {
  const connected = useHubConnection();

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors",
        connected
          ? "bg-primary/10 border-primary/30 text-primary"
          : "bg-destructive/10 border-destructive/30 text-destructive"
      )}
    >
      {connected ? (
        <Wifi className="w-3 h-3" />
      ) : (
        <WifiOff className="w-3 h-3" />
      )}
      {connected ? "Hub Connected" : "Hub Offline"}
    </div>
  );
}
