/**
 * Next.js instrumentation hook. Loads server- and edge-side Sentry.
 * No-op when SENTRY_DSN isn't set (config files handle that gracefully).
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export { captureRequestError as onRequestError } from "@sentry/nextjs";
