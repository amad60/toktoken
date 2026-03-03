import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  const handleInstall = async () => {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-card border-t border-border shadow-[0_-4px_20px_-4px_hsl(210_30%_80%/0.4)]">
      <div className="max-w-lg mx-auto flex items-center gap-3">
        <p className="text-sm text-foreground flex-1">
          Add Toktok Token to your home screen for easier access.
        </p>
        <Button
          onClick={handleInstall}
          size="sm"
          className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/80 btn-press shrink-0"
        >
          Add to Home
        </Button>
        <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
