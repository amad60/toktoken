import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  activityName: string;
  title?: string;
  message?: string;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ open, activityName, title, message, confirmText, onConfirm, onCancel }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogContent className="bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">{title || "Use Token?"}</DialogTitle>
        </DialogHeader>
        <p className="text-foreground text-center">
          {message || <>Use 1 token for <span className="font-bold">{activityName}</span>?</>}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1 rounded-xl">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/80 font-bold btn-press">
            {confirmText || "Confirm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
