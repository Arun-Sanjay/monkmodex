"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root layout error:", error);
  }, [error]);

  // Must render its own <html>/<body> per Next.js docs.
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#0a0a0c",
          color: "#f5f4f1",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 480, width: "100%" }}>
          <div
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, monospace",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#7a1f24",
              marginBottom: 12,
            }}
          >
            Critical error
          </div>
          <h1
            style={{
              fontFamily: "ui-serif, Georgia, serif",
              fontSize: 30,
              lineHeight: 1.1,
              letterSpacing: "-0.018em",
              margin: 0,
              marginBottom: 16,
            }}
          >
            We hit a wall.
          </h1>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.65,
              color: "#9a978f",
              marginBottom: 28,
            }}
          >
            The page failed at the root. A reload usually fixes it. The error
            has been logged on our side.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              border: "none",
              padding: "10px 20px",
              borderRadius: 6,
              background: "#7a1f24",
              color: "#f5f4f1",
              fontFamily: "ui-monospace, SFMono-Regular, monospace",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
