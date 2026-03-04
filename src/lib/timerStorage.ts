import { TimerState } from "@/types";

const TIMER_KEY = "toktok-timers";

export function loadTimers(): TimerState[] {
  try {
    const raw = localStorage.getItem(TIMER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTimers(timers: TimerState[]): void {
  localStorage.setItem(TIMER_KEY, JSON.stringify(timers));
}

export function startTimer(activityId: string, childId: string, durationMinutes: number): TimerState[] {
  const timers = loadTimers().filter((t) => t.activityId !== activityId);
  timers.push({ activityId, childId, timerStartTimestamp: Date.now(), timerDurationMinutes: durationMinutes });
  saveTimers(timers);
  return timers;
}

export function clearTimer(activityId: string): TimerState[] {
  const timers = loadTimers().filter((t) => t.activityId !== activityId);
  saveTimers(timers);
  return timers;
}

export function getTimer(activityId: string): TimerState | undefined {
  return loadTimers().find((t) => t.activityId === activityId);
}

export function getRemainingMs(timer: TimerState): number {
  const elapsed = Date.now() - timer.timerStartTimestamp;
  const totalMs = timer.timerDurationMinutes * 60 * 1000;
  return Math.max(0, totalMs - elapsed);
}
