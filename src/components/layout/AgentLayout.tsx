import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import { Bell, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

export default function AgentLayout() {
  const { canInstall, install } = useInstallPrompt();
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
            <Link to="/agent/notifications" className="relative p-2 -mr-2">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {/* Badge will be added with real data */}
            </Link>
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
