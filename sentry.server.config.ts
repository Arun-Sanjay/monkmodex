/**
 * Sentry server config — env-gated. When SENTRY_DSN is absent, Sentry
 * still loads but every capture is a no-op (Sentry's documented behavior
 * for missing DSN). Code shipped without keys = silent.
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: Boolean(process.env.SENTRY_DSN),
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  ignoreErrors: [
    "NEXT_REDIRECT", // not real errors
    "NEXT_NOT_FOUND",
  ],
});
