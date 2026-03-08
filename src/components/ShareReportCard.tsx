import { forwardRef } from "react";
import { WeeklyReportData } from "@/lib/weeklyReport";

interface Props {
  childName: string;
  report: WeeklyReportData;
}

export const ShareReportCard = forwardRef<HTMLDivElement, Props>(
  ({ childName, report }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1080,
          background: "linear-gradient(180deg, #f0f4ff 0%, #fdf6f0 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Confetti dots */}
        {[
          { top: 60, left: 120, bg: "#fbbf24", size: 18 },
          { top: 40, left: 300, bg: "#a78bfa", size: 12 },
          { top: 90, left: 500, bg: "#34d399", size: 16 },
          { top: 30, left: 700, bg: "#f472b6", size: 14 },
          { top: 80, left: 880, bg: "#60a5fa", size: 10 },
          { top: 130, left: 200, bg: "#fb923c", size: 10 },
          { top: 110, left: 650, bg: "#fbbf24", size: 14 },
          { top: 50, left: 950, bg: "#34d399", size: 12 },
        ].map((dot, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: dot.top,
              left: dot.left,
              width: dot.size,
              height: dot.size,
              borderRadius: "50%",
              background: dot.bg,
              opacity: 0.5,
            }}
          />
        ))}

        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: "#1e293b",
            marginBottom: 80,
          }}
        >
          {childName}'s Week
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 60,
            marginBottom: 100,
          }}
        >
          {[
            { emoji: "⭐", value: report.choresCompleted > 0 ? String(report.choresCompleted) : "—", label: "Chores completed" },
            { emoji: "🎁", value: report.rewardsUsed > 0 ? String(report.rewardsUsed) : "—", label: "Rewards used" },
            { emoji: "🔥", value: report.activeDays > 0 ? `${report.activeDays}` : "—", label: "Active days" },
          ].map((m, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 52 }}>{m.emoji}</div>
              <div style={{ fontSize: 72, fontWeight: 800, color: "#1e293b", lineHeight: 1.2 }}>
                {m.value}
              </div>
              <div style={{ fontSize: 28, color: "#64748b", fontWeight: 500, lineHeight: 1.4, letterSpacing: 0, whiteSpace: "normal", display: "block", textAlign: "center" }}>
                {m.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 24, color: "#94a3b8", fontWeight: 500, letterSpacing: "0.5px", opacity: 0.7 }}>
          toktoken.lovable.app
        </div>
      </div>
    );
  }
);

ShareReportCard.displayName = "ShareReportCard";
