import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import { Download } from "lucide-react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

export default function AgentLayout() {
  const { canInstall, install } = useInstallPrompt();
  const { unreadCount } = useRealtimeNotifications();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-40 glass-strong">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          <span className="text-sm font-bold tracking-tight text-foreground">
            Deliver<span className="text-primary">Pro</span>
          </span>
          <div className="flex items-center gap-1">
            {canInstall && (
              <button
                onClick={install}
                className="p-2 rounded-lg bg-primary/10 text-primary active:scale-95 transition-transform"
                aria-label="Install app"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            <NotificationBell unreadCount={unreadCount} />
          </div>
        </div>
      </header>

      <main className="pt-14 pb-20 max-w-lg mx-auto">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
