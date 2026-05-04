/**
 * GET /api/account/export
 *
 * Returns a JSON dump of every row this owner holds. Browser will
 * download as `monkmodex-export-YYYY-MM-DD.json`.
 */

import { NextResponse } from "next/server";
import { resolveOwner } from "@/services/owner";
import { exportOwnerData } from "@/services/supabase/queries";

export const runtime = "nodejs";

export async function GET() {
  const owner = await resolveOwner();
  if (!owner) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  const data = await exportOwnerData(owner);

  const filename = `monkmodex-export-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  const payload = {
    exported_at: new Date().toISOString(),
    owner_kind: owner.kind,
    counts: {
      quiz_responses: data.quiz_responses.length,
      protocols: data.protocols.length,
      checkins: data.checkins.length,
      lapses: data.lapses.length,
    },
    ...data,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
