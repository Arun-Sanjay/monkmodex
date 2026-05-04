import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Apple touch icon — 180×180 with deeper oxblood ambient and the "M"
 * wordmark. Used for "Add to Home Screen" on iOS.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 50% 30%, #4a1416 0%, #1a0808 50%, #0a0a0c 90%)",
          color: "#f5f4f1",
          fontFamily: "Georgia, serif",
          fontWeight: 600,
          fontSize: 120,
          lineHeight: 1,
          letterSpacing: "-0.04em",
        }}
      >
        M
      </div>
    ),
    { ...size }
  );
}
