import { Chore } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

interface Props {
  open: boolean;
  onClose: () => void;
  chore: Chore | null;
}

export function ChoreLogs({ open, onClose, chore }: Props) {
  if (!chore) return null;

  const sortedLogs = [...chore.logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {chore.icon} {chore.name} — History
          </DialogTitle>
        </DialogHeader>
        {sortedLogs.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">No completions yet.</p>
        ) : (
          <div className="space-y-2">
            {sortedLogs.map((log, i) => {
              const d = new Date(log.date);
              return (
                <div key={i} className="flex justify-between px-3 py-2 bg-muted rounded-xl text-sm">
                  <span className="text-foreground font-medium">{format(d, "MMM d, yyyy")}</span>
                  <span className="text-muted-foreground">{format(d, "h:mm a")}</span>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
