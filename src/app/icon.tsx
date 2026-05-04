import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Dynamic favicon — 32×32 oxblood-tinted square with a serif "M".
 * Replaces the Next.js default at all browser sizes via Next's icon
 * convention. apple-icon.tsx provides the larger touch icon.
 */
export default function Icon() {
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
            "radial-gradient(circle at 50% 30%, #4a1416 0%, #0a0a0c 80%)",
          color: "#f5f4f1",
          fontFamily: "Georgia, serif",
          fontWeight: 600,
          fontSize: 22,
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
