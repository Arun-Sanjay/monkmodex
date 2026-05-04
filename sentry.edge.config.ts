/**
 * Sentry edge runtime config (middleware, edge route handlers).
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: Boolean(process.env.SENTRY_DSN),
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
