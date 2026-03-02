import { AppData, Child, Activity } from "@/types";

const STORAGE_KEY = "toktok-token-data";

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function createEmptyData(): AppData {
  return { children: [], selectedChildId: "" };
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function shouldResetWeekly(lastResetDate: string): boolean {
  const last = new Date(lastResetDate + "T00:00:00");
  const lastMonday = getMonday(last);
  const thisMonday = getMonday(new Date());
  return thisMonday.getTime() > lastMonday.getTime();
}

function shouldResetMonthly(lastResetDate: string): boolean {
  const last = new Date(lastResetDate + "T00:00:00");
  const now = new Date();
  return now.getFullYear() > last.getFullYear() || now.getMonth() > last.getMonth();
}

function applyResets(data: AppData): AppData {
  const today = new Date().toISOString().split("T")[0];
  let changed = false;
  const updated = {
    ...data,
    children: data.children.map((child) => ({
      ...child,
      activities: child.activities.map((act) => {
        const needsReset =
          act.periodType === "weekly"
            ? shouldResetWeekly(act.lastResetDate)
            : shouldResetMonthly(act.lastResetDate);
        if (needsReset) {
          changed = true;
          return { ...act, remainingQuota: act.totalQuota, lastResetDate: today };
        }
        return act;
      }),
    })),
  };
  if (changed) saveData(updated);
  return updated;
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw) as AppData;
      return applyResets(data);
    }
  } catch {}
  const empty = createEmptyData();
  saveData(empty);
  return empty;
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addChild(data: AppData, name: string): AppData {
  const newChild: Child = {
    id: generateId(),
    name,
    activities: [],
  };
  const updated = {
    ...data,
    children: [...data.children, newChild],
    selectedChildId: newChild.id,
  };
  saveData(updated);
  return updated;
}

export function addActivity(data: AppData, childId: string, activity: Omit<Activity, "id" | "remainingQuota" | "logs" | "lastResetDate">): AppData {
  const today = new Date().toISOString().split("T")[0];
  const newActivity: Activity = {
    ...activity,
    id: generateId(),
    remainingQuota: activity.totalQuota,
    logs: [],
    lastResetDate: today,
  };
  const updated = {
    ...data,
    children: data.children.map((c) =>
      c.id === childId ? { ...c, activities: [...c.activities, newActivity] } : c
    ),
  };
  saveData(updated);
  return updated;
}

export function updateActivity(data: AppData, childId: string, activityId: string, updates: Partial<Pick<Activity, "name" | "icon" | "periodType" | "totalQuota" | "durationText">>): AppData {
  const updated = {
    ...data,
    children: data.children.map((c) =>
      c.id === childId
        ? {
            ...c,
            activities: c.activities.map((a) =>
              a.id === activityId ? { ...a, ...updates } : a
            ),
          }
        : c
    ),
  };
  saveData(updated);
  return updated;
}

export function deleteActivity(data: AppData, childId: string, activityId: string): AppData {
  const updated = {
    ...data,
    children: data.children.map((c) =>
      c.id === childId
        ? { ...c, activities: c.activities.filter((a) => a.id !== activityId) }
        : c
    ),
  };
  saveData(updated);
  return updated;
}

export function useToken(data: AppData, childId: string, activityId: string): AppData {
  const now = new Date().toISOString();
  const updated = {
    ...data,
    children: data.children.map((c) =>
      c.id === childId
        ? {
            ...c,
            activities: c.activities.map((a) =>
              a.id === activityId && a.remainingQuota > 0
                ? {
                    ...a,
                    remainingQuota: a.remainingQuota - 1,
                    logs: [...a.logs, { date: now }],
                  }
                : a
            ),
          }
        : c
    ),
  };
  saveData(updated);
  return updated;
}
