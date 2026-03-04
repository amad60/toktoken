import { useState } from "react";
import { Activity } from "@/types";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getResetCountdown } from "@/lib/resetCountdown";

interface Props {
  activity: Activity;
  earnCredits: number;
  onUseToken: () => void;
  onUseEarnCredit: () => void;
  onViewHistory: () => void;
  onEdit: () => void;
}

// Stars scroll horizontally when > 3

export function ActivityCard({ activity, earnCredits, onUseToken, onUseEarnCredit, onViewHistory, onEdit }: Props) {
  const { icon, name, remainingQuota, totalQuota, durationText, periodType } = activity;
  const progress = totalQuota > 0 ? (remainingQuota / totalQuota) * 100 : 0;
  const isEmpty = remainingQuota === 0;
  const [confirmOpen, setConfirmOpen] = useState(false);

  // All stars rendered; row scrolls if needed
  const emptySlots = isEmpty ? Math.min(totalQuota, 3) : 0;

  const handleStarTap = () => {
    if (isEmpty) return;
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    onUseToken();
  };

  return (
    <div
      className={`bg-card rounded-2xl p-4 shadow-[0_2px_12px_-4px_hsl(210_30%_80%/0.5)] border border-border animate-bounce-in flex flex-col items-center gap-2 transition-opacity min-h-0 ${isEmpty ? "opacity-60" : ""}`}
    >
      <button onClick={onEdit} className="flex flex-col items-center gap-1 w-full btn-press">
        <span className="text-5xl leading-none">{icon}</span>
        <h3 className="font-bold text-foreground text-sm truncate max-w-full">{name}</h3>
        {durationText && (
          <p className="text-[11px] text-muted-foreground">{durationText}</p>
        )}
      </button>

      <button
        onClick={onViewHistory}
        className="text-[11px] text-muted-foreground underline"
      >
        History
      </button>

      {/* Token star slots */}
      <div className="relative w-full flex flex-col items-center gap-1.5 py-1.5">
        <div className="flex items-center gap-2 min-h-[48px] overflow-x-auto w-full justify-center scrollbar-none">
          {isEmpty ? (
            Array.from({ length: emptySlots }).map((_, i) => (
              <span
                key={i}
                className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-2xl opacity-30 select-none"
                style={{ filter: "grayscale(1)" }}
              >
                ⭐
              </span>
            ))
          ) : (
            <>
              {Array.from({ length: remainingQuota }).map((_, i) => (
                <button
                  key={i}
                  onClick={handleStarTap}
                  className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-2xl select-none transition-transform duration-150 active:scale-105"
                  style={{ filter: "drop-shadow(0 2px 4px rgba(250,204,21,0.45))" }}
                  aria-label={`Use token for ${name}`}
                >
                  ⭐
                </button>
              ))}
            </>
          )}
        </div>

        {/* Inline confirmation popover */}
        {confirmOpen && (
          <div className="absolute top-full mt-1 z-20 bg-card border border-border rounded-xl shadow-lg p-3 w-full animate-bounce-in">
            <p className="text-xs text-foreground text-center mb-2">
              Use 1 token for <span className="font-bold">{name}</span>?
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmOpen(false)}
                className="flex-1 rounded-xl text-xs h-7 px-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/80 font-bold text-xs h-7 px-2 btn-press"
              >
                Confirm
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="w-full space-y-1">
        <div className="flex justify-between text-xs">
          <span className="font-bold text-foreground">
            {remainingQuota} / {totalQuota}
          </span>
          <span className="text-muted-foreground text-[10px]">
            {getResetCountdown(periodType)}
          </span>
        </div>
        <Progress
          value={progress}
          className={`h-2 rounded-full bg-muted ${isEmpty ? "[&>div]:bg-destructive" : "[&>div]:bg-secondary"} [&>div]:rounded-full`}
        />
      </div>

      {isEmpty && (
        <div className="flex flex-col items-center gap-1 w-full">
          <p className="text-[11px] text-destructive font-semibold text-center leading-tight">
            No tokens left
          </p>
          {earnCredits > 0 && (
            <Button
              onClick={onUseEarnCredit}
              className="w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/80 font-bold text-xs h-8 btn-press"
            >
              ⭐ Use Earn Credit
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
