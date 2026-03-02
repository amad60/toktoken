import { useState } from "react";
import { Activity, EMOJI_LIST } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; icon: string; periodType: "weekly" | "monthly"; totalQuota: number; durationText?: string }) => void;
  onDelete?: () => void;
  initial?: Activity;
}

export function ActivityForm({ open, onClose, onSave, onDelete, initial }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "🎮");
  const [periodType, setPeriodType] = useState<"weekly" | "monthly">(initial?.periodType ?? "weekly");
  const [quota, setQuota] = useState(String(initial?.totalQuota ?? 3));
  const [duration, setDuration] = useState(initial?.durationText ?? "");

  const handleSave = () => {
    if (!name.trim() || !quota) return;
    onSave({
      name: name.trim(),
      icon,
      periodType,
      totalQuota: Math.max(1, parseInt(quota) || 1),
      durationText: duration.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="rounded-2xl bg-card mx-4 max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">{initial ? "Edit Activity" : "Add Activity"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-foreground text-sm font-semibold">Icon</Label>
            <div className="flex flex-wrap gap-2 mt-1 max-h-28 overflow-y-auto">
              {EMOJI_LIST.map((e) => (
                <button
                  key={e}
                  onClick={() => setIcon(e)}
                  className={`text-2xl w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    icon === e ? "bg-primary/30 ring-2 ring-primary" : "hover:bg-muted"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-foreground text-sm font-semibold">Activity Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl bg-muted text-foreground mt-1" placeholder="e.g. Play PS" />
          </div>
          <div>
            <Label className="text-foreground text-sm font-semibold">Period</Label>
            <Select value={periodType} onValueChange={(v) => setPeriodType(v as "weekly" | "monthly")}>
              <SelectTrigger className="rounded-xl bg-muted text-foreground mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card rounded-xl">
                <SelectItem value="weekly">Weekly (resets Monday)</SelectItem>
                <SelectItem value="monthly">Monthly (resets 1st)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-foreground text-sm font-semibold">Tokens per period</Label>
            <Input type="number" min="1" value={quota} onChange={(e) => setQuota(e.target.value)} className="rounded-xl bg-muted text-foreground mt-1" />
          </div>
          <div>
            <Label className="text-foreground text-sm font-semibold">Duration text (optional)</Label>
            <Input value={duration} onChange={(e) => setDuration(e.target.value)} className="rounded-xl bg-muted text-foreground mt-1" placeholder="e.g. 1 hour per use" />
          </div>
          <Button onClick={handleSave} className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/80 font-bold h-11">
            Save
          </Button>
          {onDelete && (
            <Button variant="outline" onClick={onDelete} className="w-full rounded-xl text-destructive border-destructive hover:bg-destructive/10">
              Delete Activity
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
