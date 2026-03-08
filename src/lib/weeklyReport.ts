import { Child } from "@/types";

export interface WeeklyReportData {
  tokensEarned: number;
  choresCompleted: number;
  rewardsUsed: number;
  activeDays: number;
}

export function getWeeklyReport(child: Child): WeeklyReportData {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  const choreLogsInRange = child.chores.flatMap((ch) =>
    ch.logs.filter((l) => new Date(l.date).getTime() >= sevenDaysAgo)
  );

  const activityLogsInRange = child.activities.flatMap((act) =>
    act.logs.filter((l) => new Date(l.date).getTime() >= sevenDaysAgo)
  );

  // tokensEarned = sum of rewardAmount for each completed chore set in the period
  // Since each chore log entry represents one step, and reward is given when totalCount is met,
  // we approximate: count chore logs and multiply by reward per completion
  // Actually, the simplest accurate approach: sum rewardAmount for each chore proportionally
  // But the spec says "sum of tokens from choreLogs" — treat each chore log as earning
  // (rewardAmount / totalCount) tokens. Actually let's just count completed full sets.
  // Simpler: each chore log = 1 chore step. Tokens earned = sum of (rewardAmount) for chores
  // where the full set was completed within the window. But that's complex.
  // Spec says tokensEarned = "sum of tokens from choreLogs". Let's compute it as:
  // For each chore, count logs in range. For every totalCount logs, that's one completion = rewardAmount tokens.
  let tokensEarned = 0;
  for (const chore of child.chores) {
    const logsInRange = chore.logs.filter(
      (l) => new Date(l.date).getTime() >= sevenDaysAgo
    ).length;
    if (chore.totalCount > 0) {
      const completions = Math.floor(logsInRange / chore.totalCount);
      tokensEarned += completions * chore.rewardAmount;
    }
  }

  const choresCompleted = choreLogsInRange.length;
  const rewardsUsed = activityLogsInRange.length;

  const daySet = new Set<string>();
  for (const l of choreLogsInRange) {
    daySet.add(new Date(l.date).toISOString().split("T")[0]);
  }
  for (const l of activityLogsInRange) {
    daySet.add(new Date(l.date).toISOString().split("T")[0]);
  }
  const activeDays = daySet.size;

  return { tokensEarned, choresCompleted, rewardsUsed, activeDays };
}

export function getProudMoment(childName: string, report: WeeklyReportData): string {
  if (report.choresCompleted === 1) {
    return `${childName} completed the first chore this week. Great start!`;
  }
  if (report.choresCompleted >= 10) {
    return `${childName} showed great effort this week!`;
  }
  if (report.activeDays >= 4) {
    return `${childName} stayed very consistent this week!`;
  }
  if (report.rewardsUsed >= 3) {
    return `${childName} enjoyed the rewards this week!`;
  }
  return `${childName} is building great habits.`;
}
