/**
 * Plain-text + HTML email templates. Calm, MMX voice. No logo image —
 * minimal HTML that survives every client (Outlook included).
 *
 * Each template returns { subject, html, text }. Compose all dynamic
 * content in TypeScript; the template is just transport.
 */

export interface OrderConfirmationInput {
  email: string;
  tier: "foundation" | "operator";
  durationDays: 30 | 90;
  amountUsd: number;
  protocolUrl: string;
  diagnosisUrl: string;
}

export function orderConfirmation(input: OrderConfirmationInput) {
  const { tier, durationDays, amountUsd, protocolUrl, diagnosisUrl } = input;
  const tierTitle = tier === "operator" ? "Operator" : "Foundation";

  const subject = `${tierTitle} unlocked — your protocol is ready`;
  const text = `Your ${tierTitle} protocol is ready.

${durationDays} days, anchored to your existing routines, with cuts + if-then plans personalized to your reward system.

Begin: ${protocolUrl}
Re-read your diagnosis: ${diagnosisUrl}

You paid $${amountUsd}. We don't charge again — no subscription, no auto-renew. Refund window is 30 days; reply to this email if it doesn't earn its place.

Days 1–14 will feel worse before they feel better. That's the substrate work, not failure.`;

  const html = wrap(`
    <p style="margin:0 0 16px"><strong>Your ${tierTitle} protocol is ready.</strong></p>
    <p style="margin:0 0 16px">${durationDays} days, anchored to your existing routines, with cuts and if-then plans personalized to your reward system.</p>
    <p style="margin:0 0 24px">
      <a href="${protocolUrl}" style="display:inline-block;padding:10px 20px;background:#7a1f24;color:#f5f4f1;text-decoration:none;border-radius:6px;font-family:ui-monospace,SFMono-Regular,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase">Begin</a>
    </p>
    <p style="margin:0 0 16px">Re-read your diagnosis any time: <a href="${diagnosisUrl}" style="color:#7a1f24">open it here</a>.</p>
    <p style="margin:0 0 16px;color:#5a4f44">You paid $${amountUsd}. No subscription. No auto-renew. Refund window is 30 days — reply to this email if it doesn't earn its place.</p>
    <p style="margin:0;color:#8a7a6a;font-style:italic">Days 1–14 will feel worse before they feel better. That's the substrate work, not failure.</p>
  `);

  return { subject, html, text };
}

export interface MilestoneEmailInput {
  email: string;
  day: 1 | 14 | 30 | 90;
  tier: "foundation" | "operator";
  todayUrl: string;
  diagnosisUrl: string;
  identityStatement: string | null;
}

export function milestoneEmail(input: MilestoneEmailInput) {
  const { day, tier, todayUrl, diagnosisUrl, identityStatement } = input;

  const config = (() => {
    switch (day) {
      case 1:
        return {
          subject: "Day 1 — you started",
          headline: "Day 1. The first 14 days will feel worse before better.",
          body:
            "Lembke calls this the pleasure-pain balance — the gremlins on the pain side rebalancing. It's the recovery, not the failure. Sleep first. Phone out of the room. Tick the easiest non-negotiable today, even if everything else slips.",
        };
      case 14:
        return {
          subject: "Day 14 — substrate phase complete",
          headline: "The floor is laid.",
          body:
            tier === "operator"
              ? "Two weeks of substrate work. From tomorrow, body reset adds on top — substrate keeps running. Body work compounds on the substrate, not in spite of it. If a workout breaks sleep, sleep wins."
              : "Two weeks of substrate work. From tomorrow, body reset adds on top — substrate keeps running. The cut should feel quieter than it did on day one.",
        };
      case 30:
        return {
          subject:
            tier === "foundation"
              ? "Day 30 — foundation complete"
              : "Day 30 — phase 1 closes",
          headline:
            tier === "foundation"
              ? "Thirty days. You finished."
              : "First third complete.",
          body:
            tier === "foundation"
              ? "The substrate that was a protocol is now a baseline you can keep running without ceremony. You can extend into Operator if the body and mind work calls — but the substrate is yours to keep, free, forever."
              : "Mind reset begins on day 43. Between now and then, body reset deepens — keep the substrate running underneath everything.",
        };
      case 90:
        return {
          subject: "Day 90 — protocol complete",
          headline: "What you keep is what you keep.",
          body: "Ninety days. The version of you that started this would not recognize the version that finished it. From here, the dashboard becomes optional — substrate is automatic, the cut is held, and the choices that fill the day are yours to write.",
        };
    }
  })();

  const identityLine = identityStatement
    ? `\n\n— "${identityStatement.replace(/^…|^\.\.\./, "").trim()}"`
    : "";

  const text = `${config.headline}

${config.body}${identityLine}

Open Today: ${todayUrl}
Re-read your diagnosis: ${diagnosisUrl}`;

  const html = wrap(`
    <p style="margin:0 0 6px;color:#7a1f24;font-family:ui-monospace,SFMono-Regular,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase">Day ${String(day).padStart(2, "0")}</p>
    <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:28px;line-height:1.15;letter-spacing:-0.018em;color:#1a1612">${config.headline}</h1>
    <p style="margin:0 0 24px;color:#5a4f44">${config.body}</p>
    ${identityStatement ? `<p style="margin:0 0 24px;color:#8a7a6a;font-style:italic;font-family:Georgia,serif">"${identityStatement.replace(/^…|^\.\.\./, "").trim()}"</p>` : ""}
    <p style="margin:0 0 8px">
      <a href="${todayUrl}" style="display:inline-block;padding:10px 20px;background:#7a1f24;color:#f5f4f1;text-decoration:none;border-radius:6px;font-family:ui-monospace,SFMono-Regular,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase">Open Today</a>
    </p>
    <p style="margin:16px 0 0;font-size:13px"><a href="${diagnosisUrl}" style="color:#7a1f24">Re-read your diagnosis</a></p>
  `);

  return { subject: config.subject, html, text };
}

/** Minimal HTML wrapper — works in every email client. */
function wrap(inner: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f3ede2;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,sans-serif;color:#1a1612;line-height:1.65">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px">
      <div style="font-family:Georgia,serif;font-size:18px;letter-spacing:-0.01em;color:#1a1612;margin-bottom:24px">Monk ModeX</div>
      <div style="background:#ffffff;border:1px solid #d6c7b8;border-radius:8px;padding:28px">
        ${inner}
      </div>
      <p style="margin:24px 0 0;font-family:ui-monospace,SFMono-Regular,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8a7a6a">monkmodex.com</p>
    </div>
  </body>
</html>`;
}
