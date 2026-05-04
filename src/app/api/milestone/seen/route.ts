/**
 * POST /api/milestone/seen
 *
 * Marks a Day-N milestone as acknowledged for the given protocol so the
 * interstitial doesn't fire again on subsequent dashboard visits.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveOwner } from "@/services/owner";
import { getActiveProtocol } from "@/services/supabase/queries";
import { getServiceClient } from "@/services/supabase/server";
import { getAuthUser } from "@/services/supabase/auth-server";
import { sendEmail } from "@/services/email/resend";
import { milestoneEmail } from "@/services/email/templates";

export const runtime = "nodejs";

const RequestSchema = z.object({
  protocolId: z.string().uuid(),
  day: z.number().int().min(1).max(365),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const owner = await resolveOwner();
  if (!owner) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  const protocol = await getActiveProtocol(owner);
  if (!protocol || protocol.id !== parsed.data.protocolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const seen = new Set<number>(protocol.milestones_seen ?? []);
  if (seen.has(parsed.data.day)) {
    return NextResponse.json({ ok: true, alreadySeen: true });
  }
  seen.add(parsed.data.day);

  const supabase = getServiceClient();
  const { error } = await supabase
    .from("protocols")
    .update({ milestones_seen: Array.from(seen).sort((a, b) => a - b) })
    .eq("id", protocol.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fire matching milestone email if the user is authed and the day is
  // one of the keyed milestones. No-op when Resend isn't configured.
  const day = parsed.data.day;
  if (day === 1 || day === 14 || day === 30 || day === 90) {
    const authUser = await getAuthUser();
    if (authUser?.email) {
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const tmpl = milestoneEmail({
        email: authUser.email,
        day,
        tier: protocol.tier,
        todayUrl: `${appUrl}/dashboard`,
        diagnosisUrl: `${appUrl}/dashboard/diagnosis`,
        identityStatement: protocol.identity_statement,
      });
      void sendEmail({
        to: authUser.email,
        subject: tmpl.subject,
        html: tmpl.html,
        text: tmpl.text,
        category: `milestone_day_${day}`,
      }).catch((e) => console.error("milestone send failed:", e));
    }
  }

  return NextResponse.json({ ok: true });
}
