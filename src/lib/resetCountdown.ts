/**
 * Returns a human-readable countdown string to the next reset date.
 */
export function getResetCountdown(periodType: "weekly" | "monthly"): string {
  const now = new Date();

  let resetDate: Date;

  if (periodType === "weekly") {
    // Next Monday 00:00
    const day = now.getDay(); // 0=Sun, 1=Mon...
    const daysUntilMonday = day === 0 ? 1 : day === 1 ? 7 : 8 - day;
    resetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilMonday, 0, 0, 0, 0);
  } else {
    // 1st of next month 00:00
    resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
  }

  const diffMs = resetDate.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays > 0) return `Resets in ${diffDays}d`;
  if (diffHours > 0) return `Resets in ${diffHours}h`;
  if (diffMinutes > 0) return `Resets in ${diffMinutes}m`;
  return "Resets soon";
}
