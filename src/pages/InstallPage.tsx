import { Download, Smartphone, Share2, Plus, Home, Chrome, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function InstallPage() {
  const navigate = useNavigate();
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-primary/15 flex items-center justify-center mx-auto">
            <Download className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Install DeliverPro</h1>
          <p className="text-lg text-muted-foreground">
            Add DeliverPro to your home screen for quick access
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-8">
          {isIOS ? (
            // iOS Instructions
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-foreground">iPhone & iPad Instructions</h2>

              <div className="space-y-4">
                <div className="bg-secondary/50 rounded-2xl p-6 space-y-3 border border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">
                      1
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground">Open in Safari</h3>
                      <p className="text-muted-foreground">Make sure you're viewing this app in Safari browser</p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-2xl p-6 space-y-3 border border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">
                      2
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Tap the Share Button
                      </h3>
                      <p className="text-muted-foreground">Tap the Share icon at the bottom of your screen</p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-2xl p-6 space-y-3 border border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">
                      3
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Select "Add to Home Screen"
                      </h3>
                      <p className="text-muted-foreground">Scroll down and tap "Add to Home Screen" option</p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-2xl p-6 space-y-3 border border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">
                      4
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Confirm & Install
                      </h3>
                      <p className="text-muted-foreground">Tap "Add" to add DeliverPro to your home screen</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Android Instructions
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-foreground">Android Instructions</h2>

              <div className="space-y-4">
                <div className="bg-secondary/50 rounded-2xl p-6 space-y-3 border border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">
                      1
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground">Open in Browser</h3>
                      <p className="text-muted-foreground">Use Chrome or your default Android browser</p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-2xl p-6 space-y-3 border border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">
                      2
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Chrome className="w-4 h-4" />
                        Tap Menu (⋮)
                      </h3>
                      <p className="text-muted-foreground">Tap the three-dot menu button in the top right corner</p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-2xl p-6 space-y-3 border border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">
                      3
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Select "Install app"
                      </h3>
                      <p className="text-muted-foreground">Look for "Install app" or "Add to Home screen" option</p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-2xl p-6 space-y-3 border border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">
                      4
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Confirm Installation
                      </h3>
                      <p className="text-muted-foreground">Tap "Install" to add DeliverPro to your home screen</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Benefits */}
          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20 space-y-4">
            <h3 className="font-semibold text-foreground">Why Install?</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Quick access from your home screen
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Works offline with cached content
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Launches in full-screen, app-like experience
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Faster loading and better performance
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/auth/login")}
            className="flex-1 h-14 rounded-2xl bg-secondary text-foreground text-lg font-semibold active:scale-[0.97] transition-transform"
          >
            Back to Login
          </button>
          <button
            onClick={() => window.history.back()}
            className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground text-lg font-semibold active:scale-[0.97] transition-transform"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
