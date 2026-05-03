import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-6 md:p-8",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";
