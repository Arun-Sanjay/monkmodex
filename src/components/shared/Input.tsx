import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[4px] px-4 py-3 text-base text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-base)] transition-colors duration-150",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[4px] px-4 py-3 text-base text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-base)] transition-colors duration-150 resize-y min-h-[120px] font-sans",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
