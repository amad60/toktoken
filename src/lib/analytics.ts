import { getAnonymousUserId } from "@/lib/userId";

const ENDPOINT =
  "https://script.google.com/macros/s/AKfycbx6uLlRJR_a5dzKAZ9H8vB82KJjJFozwNhBuo6SyABvGHSkKGOPBlnsMyEYf39SuhK5/exec";

export function trackEvent(
  eventName: string,
  _childName = "",
  activityName = "",
  metadata: Record<string, unknown> = {},
) {
  const params = new URLSearchParams({
    event_name: eventName,
    user_id: getAnonymousUserId(),
    activity_name: activityName,
    metadata: JSON.stringify(metadata),
  });
  console.log("[analytics] trackEvent params:", params.toString());
  fetch(`${ENDPOINT}?${params.toString()}`, {
    method: "GET",
    mode: "no-cors",
  }).catch(() => {});
}
