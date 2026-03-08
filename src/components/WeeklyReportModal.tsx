import { useRef, useState } from "react";
import { Child } from "@/types";
import { getWeeklyReport, getProudMoment } from "@/lib/weeklyReport";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareReportCard } from "@/components/ShareReportCard";
import { trackEvent } from "@/lib/analytics";
import html2canvas from "html2canvas";

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
  const shareRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  if (!child) return null;

  const report = getWeeklyReport(child);
  const proudMessage = getProudMoment(child.name, report);

  const handleShare = async () => {
    if (!shareRef.current || sharing) return;
    setSharing(true);

    try {
      const canvas = await html2canvas(shareRef.current, {
        width: 1080,
        height: 1080,
        scale: 2,
        backgroundColor: null,
      });

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      if (!blob) return;

      trackEvent("report_shared", child.name, "weekly_report", {
        tokens_earned: report.tokensEarned,
        chores_completed: report.choresCompleted,
        rewards_used: report.rewardsUsed,
        active_days: report.activeDays,
      });

      const file = new File([blob], `${child.name}-weekly-report.png`, { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `${child.name}'s Weekly Report` });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // user cancelled or error
    } finally {
      setSharing(false);
    }
  };

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
            <span className="text-sm font-bold text-accent-foreground">This week</span>
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <p className="text-sm font-semibold text-foreground leading-relaxed">
            {proudMessage}
          </p>
        </div>

        <div className="mt-2 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full bg-muted/50 hover:bg-muted text-muted-foreground gap-2 px-5"
            onClick={handleShare}
            disabled={sharing}
          >
            <Share className="h-4 w-4" />
            {sharing ? "Generating…" : "Share weekly report"}
          </Button>
        </div>

        {/* Hidden share card for image generation */}
        <div style={{ position: "fixed", left: -9999, top: -9999, pointerEvents: "none" }}>
          <ShareReportCard ref={shareRef} childName={child.name} report={report} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
