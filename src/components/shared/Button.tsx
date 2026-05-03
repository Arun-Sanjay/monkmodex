import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)]",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--accent-base)] text-[var(--text-primary)] hover:bg-[var(--accent-hover)]",
        secondary:
          "bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-surface)] hover:border-[var(--border-strong)]",
        ghost:
          "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]",
        outline:
          "bg-transparent border border-[var(--border-default)] text-[var(--text-primary)] hover:border-[var(--accent-base)] hover:text-[var(--text-primary)]",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-[5px]",
        md: "h-11 px-6 text-base rounded-[6px]",
        lg: "h-13 px-8 text-base rounded-[6px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
