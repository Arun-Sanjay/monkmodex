// Dev-only: mint a magic-link URL via the Supabase admin API.
// Usage: node scripts/dev-magic-link.mjs <email> [next]
// Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local.

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return i === -1 ? [l, ""] : [l.slice(0, i), l.slice(i + 1)];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const email = process.argv[2];
const next = process.argv[3] ?? "/dashboard";
if (!email) {
  console.error("Usage: node scripts/dev-magic-link.mjs <email> [next]");
  process.exit(1);
}

const appUrl = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const redirectTo = `${appUrl}/auth/callback?next=${encodeURIComponent(next)}`;

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.auth.admin.generateLink({
  type: "magiclink",
  email,
  options: { redirectTo },
});

if (error) {
  console.error("admin.generateLink failed:", error.message);
  process.exit(1);
}

// The properties.action_link is a Supabase verify URL that, when visited,
// exchanges the code and redirects to redirectTo with code= attached.
console.log(data.properties?.action_link ?? "(no link)");
