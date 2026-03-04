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

const MAX_VISIBLE_STARS = 3;

export function ActivityCard({ activity, earnCredits, onUseToken, onUseEarnCredit, onViewHistory, onEdit }: Props) {
  const { icon, name, remainingQuota, totalQuota, durationText, periodType } = activity;
  const progress = totalQuota > 0 ? (remainingQuota / totalQuota) * 100 : 0;
  const isEmpty = remainingQuota === 0;
  const [confirmOpen, setConfirmOpen] = useState(false);

  const visibleStars = Math.min(remainingQuota, MAX_VISIBLE_STARS);
  const overflow = remainingQuota - MAX_VISIBLE_STARS;
  const emptySlots = isEmpty ? Math.min(totalQuota, MAX_VISIBLE_STARS) : 0;

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
      <div className="relative w-full flex flex-col items-center gap-1.5">
        <div className="flex items-center justify-center gap-1 min-h-[28px]">
          {isEmpty ? (
            // Empty outlined slots
            Array.from({ length: emptySlots }).map((_, i) => (
              <span
                key={i}
                className="text-lg opacity-30 select-none"
                style={{ filter: "grayscale(1)" }}
              >
                ⭐
              </span>
            ))
          ) : (
            // Filled stars
            <>
              {Array.from({ length: visibleStars }).map((_, i) => (
                <button
                  key={i}
                  onClick={handleStarTap}
                  className="text-lg transition-transform active:scale-125 btn-press select-none"
                  aria-label={`Use token for ${name}`}
                >
                  ⭐
                </button>
              ))}
              {overflow > 0 && (
                <span className="text-[11px] font-bold text-muted-foreground ml-0.5">
                  +{overflow}
                </span>
              )}
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
