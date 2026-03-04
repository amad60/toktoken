import { useState, useEffect, useCallback } from "react";
import { getTimer, getRemainingMs, clearTimer } from "@/lib/timerStorage";

export function useActivityTimer(activityId: string) {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const check = useCallback(() => {
    const timer = getTimer(activityId);
    if (!timer) {
      setRemainingMs(null);
      return;
    }
    const ms = getRemainingMs(timer);
    if (ms <= 0) {
      clearTimer(activityId);
      setRemainingMs(null);
      setFinished(true);
    } else {
      setRemainingMs(ms);
    }
  }, [activityId]);

  useEffect(() => {
    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [check]);

  const clearFinished = useCallback(() => setFinished(false), []);

  const isRunning = remainingMs !== null && remainingMs > 0;

  const formatted = remainingMs
    ? `${String(Math.floor(remainingMs / 60000)).padStart(2, "0")}:${String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, "0")}`
    : null;

  return { isRunning, remainingMs, formatted, finished, clearFinished };
}
