import { useState, useEffect } from "react";
import { Chore, CHORE_EMOJI_LIST } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; icon: string; periodType: "weekly" | "monthly"; totalCount: number; rewardAmount: number }) => void;
  onDelete?: () => void;
  initial?: Chore;
}

export function ChoreForm({ open, onClose, onSave, onDelete, initial }: Props) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🧹");
  const [periodType, setPeriodType] = useState<"weekly" | "monthly">("weekly");
  const [count, setCount] = useState("3");
  const [reward, setReward] = useState("1");

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setIcon(initial?.icon ?? "🧹");
      setPeriodType(initial?.periodType ?? "weekly");
      setCount(String(initial?.totalCount ?? 3));
      setReward(String(initial?.rewardAmount ?? 1));
    }
  }, [open, initial]);

  const handleSave = () => {
    if (!name.trim() || !count) return;
    onSave({
      name: name.trim(),
      icon,
      periodType,
      totalCount: Math.max(1, parseInt(count) || 1),
      rewardAmount: Math.max(1, parseInt(reward) || 1),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="bg-card max-h-[90vh] overflow-y-auto p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground">{initial ? "Edit Chore" : "Add Chore"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Label className="text-foreground text-sm font-semibold">Icon</Label>
              <span className="text-3xl">{icon}</span>
            </div>
            <div className="grid grid-cols-8 gap-1.5 mt-2">
              {CHORE_EMOJI_LIST.map((e) => (
                <button
                  key={e}
                  onClick={() => setIcon(e)}
                  className={`text-2xl w-11 h-11 rounded-lg flex items-center justify-center transition-colors btn-press ${
                    icon === e ? "bg-primary/10 ring-2 ring-primary" : "bg-muted hover:bg-muted/70"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-foreground text-sm font-semibold">Chore Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl bg-muted text-foreground mt-1" placeholder="e.g. Wash dishes" />
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
            <Label className="text-foreground text-sm font-semibold">Times per period</Label>
            <Input type="number" min="1" value={count} onChange={(e) => setCount(e.target.value)} className="rounded-xl bg-muted text-foreground mt-1" />
          </div>
          <div>
            <Label className="text-foreground text-sm font-semibold">Reward credits per completion</Label>
            <Input type="number" min="1" value={reward} onChange={(e) => setReward(e.target.value)} className="rounded-xl bg-muted text-foreground mt-1" />
          </div>
          <Button onClick={handleSave} className="w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/80 font-bold h-11 btn-press">
            Save
          </Button>
          {onDelete && (
            <Button variant="outline" onClick={onDelete} className="w-full rounded-xl text-destructive border-destructive hover:bg-destructive/10 btn-press">
              Delete Chore
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
