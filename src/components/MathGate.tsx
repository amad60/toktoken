import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onPass: () => void;
  onCancel: () => void;
}

export function MathGate({ open, onPass, onCancel }: Props) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState(false);

  const { a, b } = useMemo(
    () => ({
      a: Math.floor(Math.random() * 8) + 2,
      b: Math.floor(Math.random() * 8) + 2,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open]
  );

  const handleSubmit = () => {
    if (parseInt(answer) === a * b) {
      setAnswer("");
      setError(false);
      onPass();
    } else {
      setError(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setAnswer(""); setError(false); onCancel(); } }}>
      <DialogContent className="rounded-2xl bg-card mx-4 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">Parent Verification</DialogTitle>
        </DialogHeader>
        <p className="text-foreground text-center text-lg font-bold">
          {a} × {b} = ?
        </p>
        <Input
          type="number"
          value={answer}
          onChange={(e) => { setAnswer(e.target.value); setError(false); }}
          placeholder="Your answer"
          className="rounded-xl bg-muted text-foreground text-center text-lg"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        {error && <p className="text-destructive text-sm text-center">Wrong answer, try again.</p>}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setAnswer(""); setError(false); onCancel(); }} className="flex-1 rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/80">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
