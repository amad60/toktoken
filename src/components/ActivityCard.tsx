import { Activity } from "@/types";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface Props {
  activity: Activity;
  earnCredits: number;
  onUseToken: () => void;
  onUseEarnCredit: () => void;
  onViewHistory: () => void;
  onEdit: () => void;
}

export function ActivityCard({ activity, earnCredits, onUseToken, onUseEarnCredit, onViewHistory, onEdit }: Props) {
  const { icon, name, remainingQuota, totalQuota, durationText, periodType } = activity;
  const progress = totalQuota > 0 ? (remainingQuota / totalQuota) * 100 : 0;
  const isEmpty = remainingQuota === 0;

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

      <div className="w-full space-y-1">
        <div className="flex justify-between text-xs">
          <span className="font-bold text-foreground">
            {remainingQuota} / {totalQuota}
          </span>
          <span className="text-muted-foreground capitalize text-[10px]">
            {periodType === "weekly" ? "Mon reset" : "1st reset"}
          </span>
        </div>
        <Progress
          value={progress}
          className={`h-2 rounded-full bg-muted ${isEmpty ? "[&>div]:bg-destructive" : "[&>div]:bg-secondary"} [&>div]:rounded-full`}
        />
      </div>

      {isEmpty ? (
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
      ) : (
        <>
          <p className="text-[11px] text-secondary font-medium">You still have choices ✨</p>
          <Button
            onClick={onUseToken}
            className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/80 font-bold text-sm h-9 btn-press"
          >
            Use Token
          </Button>
        </>
      )}
    </div>
  );
}
