import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Monk ModeX — The evidence-based version of monk mode";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default OpenGraph card. Used by Twitter, iMessage, Slack, etc.
 * Pure CSS-rendered (no external assets) so it works on the edge.
 */
export default function OpenGraph() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 80,
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, #6e1b20 0%, #2a0c0e 35%, #0a0a0c 70%)",
          color: "#f5f4f1",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Top kicker */}
        <div
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            fontSize: 16,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "#bd5860",
            marginBottom: 28,
          }}
        >
          Monk ModeX · v1
        </div>

        {/* Wordmark */}
        <div
          style={{
            fontSize: 96,
            lineHeight: 1,
            letterSpacing: "-0.025em",
            fontWeight: 600,
            maxWidth: 980,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>The evidence-based</span>
          <span>version of monk mode.</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: 40,
            fontSize: 28,
            lineHeight: 1.4,
            color: "#c8c2b8",
            maxWidth: 880,
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          Built on 40 years of addiction research. Personalized to you in 90
          seconds. No subscription, no streaks, no shame.
        </div>

        {/* Bottom rule */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            fontSize: 18,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#8a8378",
            paddingTop: 24,
            borderTop: "1px solid rgba(245,244,241,0.12)",
          }}
        >
          <span>monkmodex.com</span>
          <span>20 questions · 90 seconds · $19 / $39</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
