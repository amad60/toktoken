import { AppData, Child, Activity, Chore } from "@/types";

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
      chores: (child.chores || []).map((chore) => {
        const needsReset =
          chore.periodType === "weekly"
            ? shouldResetWeekly(chore.lastResetDate)
            : shouldResetMonthly(chore.lastResetDate);
        if (needsReset) {
          changed = true;
          return { ...chore, progressCount: 0, lastResetDate: today };
        }
        return chore;
      }),
    })),
  };
  if (changed) saveData(updated);
  return updated;
}

// Migrate old data that may not have earnCredits/chores/progressCount
function migrateData(data: AppData): AppData {
  let migrated = false;
  const updated = {
    ...data,
    children: data.children.map((child) => {
      const c = { ...child };
      if (c.earnCredits === undefined) { c.earnCredits = 0; migrated = true; }
      if (!c.chores) { c.chores = []; migrated = true; }
      // Migrate remainingCount → progressCount
      c.chores = c.chores.map((ch: any) => {
        if (ch.progressCount === undefined && ch.remainingCount !== undefined) {
          migrated = true;
          const { remainingCount, ...rest } = ch;
          return { ...rest, progressCount: rest.totalCount - remainingCount };
        }
        if (ch.progressCount === undefined) {
          migrated = true;
          return { ...ch, progressCount: 0 };
        }
        return ch;
      });
      return c;
    }),
  };
  if (migrated) saveData(updated);
  return updated;
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw) as AppData;
      return applyResets(migrateData(data));
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
    earnCredits: 0,
    chores: [],
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

// Chore CRUD
export function addChore(data: AppData, childId: string, chore: Omit<Chore, "id" | "progressCount" | "logs" | "lastResetDate">): AppData {
  const today = new Date().toISOString().split("T")[0];
  const newChore: Chore = {
    ...chore,
    id: generateId(),
    progressCount: 0,
    logs: [],
    lastResetDate: today,
  };
  const updated = {
    ...data,
    children: data.children.map((c) =>
      c.id === childId ? { ...c, chores: [...c.chores, newChore] } : c
    ),
  };
  saveData(updated);
  return updated;
}

export function updateChore(data: AppData, childId: string, choreId: string, updates: Partial<Pick<Chore, "name" | "icon" | "periodType" | "totalCount" | "rewardAmount">>): AppData {
  const updated = {
    ...data,
    children: data.children.map((c) =>
      c.id === childId
        ? {
            ...c,
            chores: c.chores.map((ch) =>
              ch.id === choreId ? { ...ch, ...updates } : ch
            ),
          }
        : c
    ),
  };
  saveData(updated);
  return updated;
}

export function deleteChore(data: AppData, childId: string, choreId: string): AppData {
  const updated = {
    ...data,
    children: data.children.map((c) =>
      c.id === childId
        ? { ...c, chores: c.chores.filter((ch) => ch.id !== choreId) }
        : c
    ),
  };
  saveData(updated);
  return updated;
}

export function completeChore(data: AppData, childId: string, choreId: string): AppData {
  const now = new Date().toISOString();
  const updated = {
    ...data,
    children: data.children.map((c) => {
      if (c.id !== childId) return c;
      let reward = 0;
      const chores = c.chores.map((ch) => {
        if (ch.id === choreId && ch.progressCount < ch.totalCount) {
          const newProgress = ch.progressCount + 1;
          if (newProgress === ch.totalCount) {
            reward = ch.rewardAmount;
          }
          return {
            ...ch,
            progressCount: newProgress,
            logs: [...ch.logs, { date: now }],
          };
        }
        return ch;
      });
      return { ...c, chores, earnCredits: c.earnCredits + reward };
    }),
  };
  saveData(updated);
  return updated;
}

export function useEarnCredit(data: AppData, childId: string, activityId: string): AppData {
  const now = new Date().toISOString();
  const updated = {
    ...data,
    children: data.children.map((c) => {
      if (c.id !== childId || c.earnCredits <= 0) return c;
      return {
        ...c,
        earnCredits: c.earnCredits - 1,
        activities: c.activities.map((a) =>
          a.id === activityId
            ? {
                ...a,
                remainingQuota: a.remainingQuota + 1,
                logs: [...a.logs, { date: now }],
              }
            : a
        ),
      };
    }),
  };
  saveData(updated);
  return updated;
}
