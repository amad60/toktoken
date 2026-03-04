import { useState, useEffect } from "react";
import { Activity } from "@/types";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getResetCountdown } from "@/lib/resetCountdown";
import { useActivityTimer } from "@/hooks/useActivityTimer";

interface Props {
  activity: Activity;
  earnCredits: number;
  onUseToken: () => void;
  onStartTimer: () => void;
  onUseEarnCredit: () => void;
  onViewHistory: () => void;
  onEdit: () => void;
  onTimerFinished: () => void;
}

const MAX_VISIBLE = 2;

export function ActivityCard({ activity, earnCredits, onUseToken, onStartTimer, onUseEarnCredit, onViewHistory, onEdit, onTimerFinished }: Props) {
  const { icon, name, remainingQuota, totalQuota, durationText, durationMinutes, periodType } = activity;
  const progress = totalQuota > 0 ? (remainingQuota / totalQuota) * 100 : 0;
  const isEmpty = remainingQuota === 0;
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { isRunning, formatted, finished, clearFinished } = useActivityTimer(activity.id);

  useEffect(() => {
    if (finished) {
      clearFinished();
      onTimerFinished();
    }
  }, [finished]);

  const visibleStars = Math.min(remainingQuota, MAX_VISIBLE);
  const overflow = remainingQuota - MAX_VISIBLE;

  const handleStarTap = () => {
    if (isEmpty) return;
    if (isRunning) return;
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    if (durationMinutes) {
      onStartTimer();
    } else {
      onUseToken();
    }
  };

  return (
    <div
      className={`bg-card rounded-2xl p-4 shadow-[0_2px_12px_-4px_hsl(210_30%_80%/0.5)] border border-border animate-bounce-in flex flex-col items-center gap-2 transition-opacity min-h-0 ${isEmpty && !isRunning ? "opacity-60" : ""}`}
    >
      <button onClick={onEdit} className="flex flex-col items-center gap-1 w-full btn-press">
        <span className="text-5xl leading-none">{icon}</span>
        <h3 className="font-bold text-foreground text-sm truncate max-w-full">{name}</h3>
        {durationText && !durationMinutes && (
          <p className="text-[11px] text-muted-foreground">{durationText}</p>
        )}
        {durationMinutes && !isRunning && (
          <p className="text-[11px] text-muted-foreground">{durationMinutes} min per use</p>
        )}
      </button>

      <button
        onClick={onViewHistory}
        className="text-[11px] text-muted-foreground underline"
      >
        History
      </button>

      {/* Timer display */}
      {isRunning && formatted && (
        <div className="w-full bg-primary/10 rounded-xl py-2 px-3 text-center animate-bounce-in">
          <p className="text-sm font-bold text-primary">⏱ {formatted} remaining</p>
        </div>
      )}

      {/* Token star slots */}
      <div className="relative w-full flex flex-col items-center gap-1.5 py-2">
        <div className="flex items-center justify-start gap-2 min-h-[56px]">
          {!isEmpty && !isRunning && (
            <>
              {Array.from({ length: visibleStars }).map((_, i) => (
                <button
                  key={i}
                  onClick={handleStarTap}
                  className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-2xl select-none rounded-full bg-[hsl(45_80%_92%)] shadow-[0_2px_8px_rgba(250,204,21,0.35)] transition-transform duration-150 active:scale-90 btn-press"
                  aria-label={`Use token for ${name}`}
                >
                  ⭐
                </button>
              ))}
              {overflow > 0 && (
                <span className="text-xs font-semibold flex-shrink-0 self-center ml-1.5 text-muted-foreground">
                  (+{overflow})
                </span>
              )}
            </>
          )}
          {isRunning && !isEmpty && (
            <button
              onClick={() => {}}
              className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-2xl select-none rounded-full bg-[hsl(45_80%_92%)] shadow-[0_2px_8px_rgba(250,204,21,0.35)] opacity-40"
              aria-label="Timer already running"
              title="Timer already running"
            >
              ⭐
            </button>
          )}
        </div>

      </div>

      <ConfirmModal
        open={confirmOpen}
        activityName={name}
        title={durationMinutes ? "Start timer?" : "Use Token?"}
        message={durationMinutes ? `Start a ${durationMinutes} minute timer?` : undefined}
        confirmText={durationMinutes ? "Start Timer" : "Confirm"}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />

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

      {isEmpty && !isRunning && (
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
