"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

/**
 * AmbientBackground — fixed, pointer-events-none layer behind every page.
 *
 * Composition (back to front):
 *   1. pure black base
 *   2. saturated oxblood dome at the top
 *   3. left-anchored oxblood plume
 *   4. bottom-right oxblood return
 *   5. mouse-following spotlight (homepage only, spring-damped)
 *   6. SVG grain
 *
 * The static layers render everywhere; the interactive spotlight only
 * mounts on `/` so the diagnostic, dashboard, and other internal pages
 * stay focused and quiet.
 */
export function AmbientBackground() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* pure black base */}
      <div className="absolute inset-0 bg-black" />

      {/* oxblood dome at the top — saturated, dominates upper half */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 130% 90% at 50% -30%, rgba(174,52,58,0.95), rgba(140,40,46,0.70) 18%, rgba(122,31,36,0.45) 32%, rgba(90,24,28,0.22) 50%, rgba(40,14,16,0.08) 68%, transparent 82%)",
        }}
      />

      {/* left-anchored plume — leather/wine weight on one side */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 80% at -10% 50%, rgba(140,40,46,0.55), rgba(122,31,36,0.18) 30%, transparent 60%)",
        }}
      />

      {/* bottom-right return — closes the diagonal */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 110% 110%, rgba(140,40,46,0.50), rgba(122,31,36,0.15) 30%, transparent 60%)",
        }}
      />

      {isHome ? <MouseSpotlight /> : null}

      {/* grain to stop banding on OLED */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.95 0 0 0 0 0.92 0 0 0 0 0.88 0 0 0 0.7 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: "240px 240px",
        }}
      />
    </div>
  );
}

/**
 * MouseSpotlight — the interactive piece. Spring-damped so the spotlight
 * trails the cursor with weight rather than snapping to it. Only mounts
 * on the marketing homepage; internal pages stay calm.
 *
 * Fades out smoothly as the user scrolls past the hero — the spotlight
 * belongs to the first screen only. Past ~600px it's gone entirely so
 * the rest of the page reads as a static, focused composition.
 */
function MouseSpotlight() {
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const smoothX = useSpring(mouseX, { stiffness: 60, damping: 22, mass: 0.6 });
  const smoothY = useSpring(mouseY, { stiffness: 60, damping: 22, mass: 0.6 });

  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 220, 620], [1, 0.7, 0]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    const onLeave = () => {
      mouseX.set(-1000);
      mouseY.set(-1000);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [mouseX, mouseY]);

  const spotlight = useTransform(
    [smoothX, smoothY],
    ([x, y]) =>
      `radial-gradient(circle 600px at ${x}px ${y}px, rgba(180,55,62,0.40), rgba(140,40,46,0.18) 30%, transparent 60%)`
  );

  return (
    <motion.div
      className="absolute inset-0"
      style={{ background: spotlight, opacity }}
    />
  );
}
