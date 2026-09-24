// Central route to the main Clarity app. Every landing CTA/link uses this so the
// path can change in one place. Questions go to `${APP_ROUTE}?q=<encoded question>`.
export const APP_ROUTE = "/app";

export function askUrl(question: string): string {
  return `${APP_ROUTE}?q=${encodeURIComponent(question)}`;
}
