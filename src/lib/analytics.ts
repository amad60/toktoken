const ENDPOINT =
  "https://script.google.com/macros/s/AKfycbx6uLlRJR_a5dzKAZ9H8vB82KJjJFozwNhBuo6SyABvGHSkKGOPBlnsMyEYf39SuhK5/exec";

export function trackEvent(
  eventName: string,
  childName = "",
  activityName = "",
  metadata: Record<string, unknown> = {},
) {
  fetch(ENDPOINT, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event_name: eventName,
      child_name: childName,
      activity_name: activityName,
      metadata,
    }),
  }).catch(() => {});
}
