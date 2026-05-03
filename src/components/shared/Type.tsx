import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface TypeProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export function Display({ className, children, ...props }: TypeProps) {
  return (
    <h1
      className={cn(
        "font-serif text-[2.5rem] sm:text-[3rem] md:text-[3.5rem] leading-[1.05] tracking-[-0.02em] font-normal text-[var(--text-primary)]",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

export function H1({ className, children, ...props }: TypeProps) {
  return (
    <h1
      className={cn(
        "font-serif text-[1.75rem] sm:text-[2rem] md:text-[2.25rem] leading-[1.15] tracking-[-0.015em] font-normal text-[var(--text-primary)]",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

export function H2({ className, children, ...props }: TypeProps) {
  return (
    <h2
      className={cn(
        "font-serif text-[1.5rem] sm:text-[1.625rem] md:text-[1.75rem] leading-[1.2] font-normal text-[var(--text-primary)]",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export function H3({ className, children, ...props }: TypeProps) {
  return (
    <h3
      className={cn(
        "font-sans text-[1.25rem] md:text-[1.375rem] leading-[1.3] font-semibold text-[var(--text-primary)]",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function Body({ className, children, ...props }: TypeProps) {
  return (
    <p
      className={cn(
        "font-sans text-[1.0625rem] leading-[1.65] text-[var(--text-primary)]",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function BodySm({ className, children, ...props }: TypeProps) {
  return (
    <p
      className={cn(
        "font-sans text-[0.9375rem] leading-[1.55] text-[var(--text-secondary)]",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function Meta({ className, children, ...props }: TypeProps) {
  return (
    <p
      className={cn(
        "font-mono text-[0.8125rem] leading-[1.4] tracking-[0.02em] uppercase text-[var(--text-secondary)]",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function Numeric({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { children: ReactNode }) {
  return (
    <span
      className={cn("font-mono font-medium tabular-nums", className)}
      {...props}
    >
      {children}
    </span>
  );
}
