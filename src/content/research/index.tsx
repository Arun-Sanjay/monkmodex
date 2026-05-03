/**
 * Bullshit Detector — research articles.
 *
 * Each article is a TS module with metadata + body. Body is a React
 * fragment so we can embed citation components, callouts, etc. without
 * a separate MDX pipeline.
 *
 * To add a new article: create a new entry below and add the slug to the
 * RESEARCH_SLUGS array. The /research/[slug] route picks it up automatically.
 */

import type { ReactNode } from "react";

export interface ResearchArticle {
  slug: string;
  /** Headline displayed on the index card and at the top of the article. */
  headline: string;
  /** One-sentence summary for the index. */
  summary: string;
  /** Body. Use simple <p>, <ul>, etc. — no client-only components. */
  body: ReactNode;
  /** Source citations used in the article. */
  sources: string[];
  /** Last meaningful update — drives sort order and "updated" stamp. */
  updated: string;
}

import { dopamineDetox } from "./dopamine-detox";
import { twentyOneDayMyth } from "./21-day-myth";
import { coldExposureTruth } from "./cold-exposure-truth";
import { nofapSuperpowers } from "./nofap-superpowers";
import { gritVsConscientiousness } from "./grit-vs-conscientiousness";
import { whyMonkModeFails } from "./why-monk-mode-fails";
import { lembkePleasurePainBalance } from "./lembke-pleasure-pain-balance";

export const ARTICLES: ResearchArticle[] = [
  dopamineDetox,
  twentyOneDayMyth,
  coldExposureTruth,
  nofapSuperpowers,
  gritVsConscientiousness,
  whyMonkModeFails,
  lembkePleasurePainBalance,
];

export function getArticle(slug: string): ResearchArticle | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
