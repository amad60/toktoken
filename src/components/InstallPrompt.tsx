import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { getInstallPrompt, clearInstallPrompt } from "@/main";

const DISMISS_KEY = "toktok-install-dismissed";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === "1");
  const [isInstalled, setIsInstalled] = useState(
    () => window.matchMedia("(display-mode: standalone)").matches
  );

  useEffect(() => {
    if (isInstalled || dismissed) return;

    const interval = setInterval(() => {
      const prompt = getInstallPrompt();
      if (prompt) {
        setDeferredPrompt(prompt);
        clearInterval(interval);
      }
    }, 300);

    const installedHandler = () => {
      setIsInstalled(true);
      trackEvent("pwa_installed", "", "", {});
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      clearInterval(interval);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, [isInstalled, dismissed]);

  if (!deferredPrompt || dismissed || isInstalled) return null;

  const handleInstall = async () => {
    trackEvent("pwa_install_clicked", "", "", {});
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    clearInstallPrompt();
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    trackEvent("pwa_install_dismissed", "", "", {});
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-card border-t border-border shadow-[0_-4px_20px_-4px_hsl(210_30%_80%/0.4)]">
      <div className="max-w-lg mx-auto flex items-center gap-3">
        <span className="text-2xl">🎟️</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            Keep tokens on your home screen
          </p>
          <p className="text-xs text-muted-foreground">
            One tap away when your child asks
          </p>
        </div>
        <button
          onClick={handleInstall}
          className="shrink-0 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-bold hover:bg-primary/80 btn-press"
        >
          Install
        </button>
        <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
