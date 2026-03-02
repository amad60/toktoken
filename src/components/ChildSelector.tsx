import { Child } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Props {
  children: Child[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAddChild: (name: string) => void;
}

export function ChildSelector({ children, selectedId, onSelect, onAddChild }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const handleAdd = () => {
    if (name.trim()) {
      onAddChild(name.trim());
      setName("");
      setOpen(false);
    }
  };

  if (children.length === 0) return null;

  return (
    <div className="flex items-center gap-2 bg-card rounded-2xl p-1.5 shadow-[0_2px_12px_-4px_hsl(210_30%_80%/0.5)]">
      <Select value={selectedId} onValueChange={onSelect}>
        <SelectTrigger className="flex-1 bg-muted text-foreground font-bold text-lg rounded-xl border-0 h-12 transition-all">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-card rounded-xl">
          {children.map((c) => (
            <SelectItem key={c.id} value={c.id} className="text-base font-semibold">
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="icon"
        onClick={() => setOpen(true)}
        className="h-12 w-12 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 shrink-0 btn-press"
      >
        <Plus className="h-5 w-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl bg-card mx-4 w-[90vw] max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add Child</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Child's name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl bg-muted text-foreground"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button onClick={handleAdd} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/80 btn-press">
            Add
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
