export interface ActivityLog {
  date: string; // ISO string
}

export interface Activity {
  id: string;
  name: string;
  icon: string;
  periodType: "weekly" | "monthly";
  totalQuota: number;
  remainingQuota: number;
  durationText?: string;
  logs: ActivityLog[];
  lastResetDate: string; // ISO date string YYYY-MM-DD
}

export interface Chore {
  id: string;
  name: string;
  icon: string;
  rewardAmount: number;
  periodType: "weekly" | "monthly";
  totalCount: number;
  progressCount: number;
  logs: ActivityLog[];
  lastResetDate: string;
}

export interface Child {
  id: string;
  name: string;
  activities: Activity[];
  earnCredits: number;
  chores: Chore[];
}

export type AppData = {
  children: Child[];
  selectedChildId: string;
};

export const EMOJI_LIST = [
  "🎮", "🕹️", "💻", "📱", "🎬", "📺", "🎨", "🎵",
  "⚽", "🏀", "🚴", "🛹", "🎯", "🧩", "📚", "✏️",
  "🍕", "🍦", "🧁", "🎂", "🛏️", "🧸", "🎪", "🏖️",
  "🌈", "⭐", "🎁", "🚀", "🦄", "🐶", "🐱", "🦋",
];

export const CHORE_EMOJI_LIST = [
  "🧹", "🧺", "🍽️", "🛁", "📖", "🐕", "🌱", "🗑️",
  "🛒", "✏️", "🧼", "👕", "🚿", "🪥", "🛏️", "📚",
  "🍳", "🧽", "💪", "🌟", "🎯", "✅", "🏃", "🙏",
];
