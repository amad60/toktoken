import { Child } from "@/types";
import { getWeeklyReport, getProudMoment } from "@/lib/weeklyReport";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  child: Child | null;
}

function MetricCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="bg-muted/50 rounded-2xl p-4 flex flex-col items-center gap-1 text-center">
      <span className="text-2xl">{emoji}</span>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <span className="text-xl font-extrabold text-foreground">{value}</span>
    </div>
  );
}

export function WeeklyReportModal({ open, onClose, child }: Props) {
  if (!child) return null;

  const report = getWeeklyReport(child);
  const proudMessage = getProudMoment(child.name, report);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="rounded-2xl bg-card mx-4 w-[90vw] max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-foreground text-center">
            <div className="text-lg font-extrabold">{child.name}</div>
            <div className="text-sm font-semibold text-muted-foreground">Weekly Report</div>
          </DialogTitle>
          <p className="text-xs text-muted-foreground text-center mt-1">Last 7 days</p>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-2">
          <MetricCard
            emoji="⭐"
            label="Tokens Earned"
            value={report.tokensEarned > 0 ? String(report.tokensEarned) : "Not yet"}
          />
          <MetricCard
            emoji="🧹"
            label="Chores Completed"
            value={report.choresCompleted > 0 ? String(report.choresCompleted) : "Not yet"}
          />
          <MetricCard
            emoji="🎁"
            label="Rewards Used"
            value={report.rewardsUsed > 0 ? String(report.rewardsUsed) : "Not yet"}
          />
          <MetricCard
            emoji="🔥"
            label="Active Days"
            value={report.activeDays > 0 ? `${report.activeDays} days` : "Not yet"}
          />
        </div>

        <div className="mt-4 bg-accent/10 rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-bold text-accent-foreground">Proud Moment</span>
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <p className="text-sm font-semibold text-foreground leading-relaxed">
            {proudMessage}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
