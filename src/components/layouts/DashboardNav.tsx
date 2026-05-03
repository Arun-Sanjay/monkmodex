"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * NavLink — desktop sidebar nav item with active-state highlight.
 * Active = exact pathname match (we don't want /dashboard active when
 * the user is on /dashboard/calendar).
 */
export function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-3 px-4 py-2 rounded-[6px] font-sans text-[0.875rem] transition-colors duration-150",
        active
          ? "bg-[var(--accent-muted)] text-[var(--text-primary)] border border-[var(--accent-base)]/40"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-transparent"
      )}
    >
      <span
        className={cn(
          "shrink-0",
          active ? "text-[var(--accent-base)]" : "text-[var(--text-tertiary)]"
        )}
      >
        {icon}
      </span>
      {children}
    </Link>
  );
}

export function MobileNavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-1 px-2 py-3 flex-1 transition-colors duration-150",
        active
          ? "text-[var(--accent-base)]"
          : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
      )}
    >
      {icon}
      <span className="font-sans text-[0.6875rem]">{children}</span>
    </Link>
  );
}
