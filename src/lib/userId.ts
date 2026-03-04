const KEY = "toktok-anon-id";

export function getAnonymousUserId(): string {
  const existing = localStorage.getItem(KEY);
  if (existing) return existing;

  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  localStorage.setItem(KEY, id);
  return id;
}
