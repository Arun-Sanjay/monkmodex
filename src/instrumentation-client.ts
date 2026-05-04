/**
 * Sentry browser config. Loaded automatically by Next.js when this file
 * is named instrumentation-client.ts. Replaces the older
 * sentry.client.config.ts pattern.
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  tracesSampleRate: 0.1,
  // Lower replays are tasteful for a privacy-leaning product.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  environment: process.env.NODE_ENV,
});

// Required for Sentry to capture navigation timing in App Router.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
