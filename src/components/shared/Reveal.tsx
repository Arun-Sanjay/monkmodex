"use client";

import { motion, type HTMLMotionProps, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { Children, isValidElement } from "react";

const EASE_OUT_QUINT = [0.16, 1, 0.3, 1] as const;

interface RevealProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  delay?: number;
  /** Distance to translate up from. Default: 18 (px). */
  distance?: number;
  /** Duration in seconds. Default: 0.75 */
  duration?: number;
  /** Once-true viewport amount. Default: 0.3 — fires when section is mid-view. */
  amount?: number;
  /** Add a subtle blur fade-in. Default: false. */
  blur?: boolean;
}

/**
 * Reveal — fades + translates up when scrolled into view, once.
 * Uses a long ease-out so motion settles instead of snapping. Default amount
 * of 0.3 means content waits until it's actually entering the reading area
 * before animating, not the moment its top edge clips the viewport.
 */
export function Reveal({
  children,
  delay = 0,
  distance = 18,
  duration = 0.75,
  amount = 0.3,
  blur = false,
  ...rest
}: RevealProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: distance,
        ...(blur ? { filter: "blur(8px)" } : {}),
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        ...(blur ? { filter: "blur(0px)" } : {}),
      }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: EASE_OUT_QUINT }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * RevealStagger — staggers a list of children. Each child should be wrapped
 * in `<RevealItem />` (or a motion element using `revealItemVariants`).
 */
export function RevealStagger({
  children,
  stagger = 0.09,
  amount = 0.25,
  delay = 0,
  ...rest
}: {
  children: ReactNode;
  stagger?: number;
  amount?: number;
  delay?: number;
} & Omit<HTMLMotionProps<"div">, "children">) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export const revealItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE_OUT_QUINT },
  },
};

export function RevealItem({
  children,
  ...rest
}: { children: ReactNode } & Omit<HTMLMotionProps<"div">, "children">) {
  return (
    <motion.div variants={revealItemVariants} {...rest}>
      {children}
    </motion.div>
  );
}

/**
 * RevealHeading — splits a heading into lines (one per child or one per <br/>
 * separated chunk) and reveals each with a stagger. Each line lifts +
 * unblurs sequentially so big serif headlines settle in like type setting,
 * not popping in all at once.
 *
 * Pass either an array of ReactNodes (one per line) or a single string with
 * newlines / explicit `<br />`s — the component will normalize.
 */
export function RevealHeading({
  lines,
  className,
  stagger = 0.12,
  delay = 0,
  amount = 0.4,
  as: Tag = "h2",
}: {
  lines: ReactNode[];
  className?: string;
  stagger?: number;
  delay?: number;
  amount?: number;
  as?: "h1" | "h2" | "h3";
}) {
  const MotionTag = motion[Tag];
  return (
    <MotionTag
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
      className={className}
    >
      {lines.map((line, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 22, filter: "blur(8px)" },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 0.85, ease: EASE_OUT_QUINT },
            },
          }}
          className="block"
        >
          {line}
        </motion.span>
      ))}
    </MotionTag>
  );
}

/**
 * splitHeadingChildren — convenience for passing JSX children to
 * RevealHeading. Splits on top-level <br /> elements so authors can write
 * `Three steps. <br /> Roughly two minutes to start.` and get two lines.
 */
export function splitHeadingChildren(node: ReactNode): ReactNode[] {
  const result: ReactNode[] = [];
  let buffer: ReactNode[] = [];

  Children.forEach(node, (child) => {
    if (isValidElement(child) && child.type === "br") {
      result.push(buffer.length === 1 ? buffer[0] : <>{buffer}</>);
      buffer = [];
    } else {
      buffer.push(child);
    }
  });
  if (buffer.length) {
    result.push(buffer.length === 1 ? buffer[0] : <>{buffer}</>);
  }
  return result;
}
