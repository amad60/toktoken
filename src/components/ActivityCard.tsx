import { Activity } from "@/types";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface Props {
  activity: Activity;
  onUseToken: () => void;
  onViewHistory: () => void;
  onEdit: () => void;
}

export function ActivityCard({ activity, onUseToken, onViewHistory, onEdit }: Props) {
  const { icon, name, remainingQuota, totalQuota, durationText, periodType } = activity;
  const progress = totalQuota > 0 ? (remainingQuota / totalQuota) * 100 : 0;
  const isEmpty = remainingQuota === 0;

  return (
    <div className="bg-card rounded-2xl p-5 shadow-sm border border-border animate-bounce-in flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button onClick={onEdit} className="flex items-center gap-3 min-w-0">
          <span className="text-3xl">{icon}</span>
          <div className="text-left min-w-0">
            <h3 className="font-bold text-foreground text-base truncate">{name}</h3>
            {durationText && (
              <p className="text-xs text-muted-foreground">{durationText}</p>
            )}
          </div>
        </button>
        <button
          onClick={onViewHistory}
          className="text-xs text-muted-foreground underline shrink-0"
        >
          History
        </button>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="font-semibold text-foreground">
            {remainingQuota} / {totalQuota}
          </span>
          <span className="text-muted-foreground text-xs capitalize">
            {periodType === "weekly" ? "Resets Monday" : "Resets 1st"}
          </span>
        </div>
        <Progress value={progress} className="h-2.5 rounded-full bg-muted [&>div]:bg-primary [&>div]:rounded-full" />
      </div>

      {isEmpty ? (
        <p className="text-sm text-destructive font-medium text-center py-1">
          No tokens left. Please wait for next period.
        </p>
      ) : (
        <Button
          onClick={onUseToken}
          className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/80 font-bold text-base h-11"
        >
          Use Token
        </Button>
      )}
    </div>
  );
}
