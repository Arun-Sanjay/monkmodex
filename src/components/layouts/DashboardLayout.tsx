import Link from "next/link";
import type { ReactNode } from "react";
import {
  Home,
  FileText,
  Scissors,
  Compass,
  CalendarDays,
  Notebook,
  Settings,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { NavLink, MobileNavLink } from "./DashboardNav";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Daily",
    items: [
      { href: "/dashboard", label: "Today", icon: Home },
      { href: "/dashboard/overview", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
      { href: "/dashboard/journal", label: "Journal", icon: Notebook },
    ],
  },
  {
    label: "Reference",
    items: [
      { href: "/dashboard/cuts", label: "Cuts", icon: Scissors },
      { href: "/dashboard/foundation", label: "Foundation", icon: Compass },
      { href: "/dashboard/diagnosis", label: "Diagnosis", icon: FileText },
    ],
  },
  {
    label: "Account",
    items: [{ href: "/dashboard/settings", label: "Settings", icon: Settings }],
  },
];

const FLAT_NAV = NAV_GROUPS.flatMap((g) => g.items);

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
        <div className="px-7 pt-8 pb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-baseline gap-2 group"
          >
            <span className="font-serif text-[1.5rem] tracking-[-0.02em] text-[var(--text-primary)]">
              {APP_NAME}
            </span>
            <span className="font-mono text-[0.625rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)]">
              v1
            </span>
          </Link>
        </div>
        <nav className="px-3 flex-1 space-y-7 pb-8">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-4 mb-2 font-mono text-[0.625rem] tracking-[0.22em] uppercase text-[var(--text-tertiary)]">
                {group.label}
              </div>
              {group.items.map(({ href, label, icon: Icon }) => (
                <NavLink key={href} href={href} icon={<Icon size={15} strokeWidth={1.5} />}>
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-[6px] focus:bg-[var(--accent-base)] focus:text-[var(--text-primary)] focus:font-mono focus:text-[0.6875rem] focus:tracking-[0.18em] focus:uppercase"
      >
        Skip to content
      </a>
      <main id="main" className="flex-1 pb-24 md:pb-12">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-canvas)]/95 backdrop-blur-md border-t border-[var(--border-subtle)] flex items-center justify-around z-50 px-1">
        {FLAT_NAV.slice(0, 5).map(({ href, label, icon: Icon }) => (
          <MobileNavLink
            key={href}
            href={href}
            icon={<Icon size={18} strokeWidth={1.5} />}
          >
            {label}
          </MobileNavLink>
        ))}
      </nav>
    </div>
  );
}

/**
 * DashboardSection — page-level chrome for legacy pages. New pages should
 * use the shared `Section` primitive directly.
 */
export function DashboardSection({
  title,
  meta,
  children,
}: {
  title?: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="max-w-3xl mx-auto px-6 md:px-12 py-10 md:py-14">
      {meta ? (
        <p className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)] mb-3">
          {meta}
        </p>
      ) : null}
      {title ? (
        <h1 className="font-serif text-[1.75rem] md:text-[2.125rem] leading-[1.15] tracking-[-0.02em] text-[var(--text-primary)] mb-10">
          {title}
        </h1>
      ) : null}
      {children}
    </section>
  );
}

/**
 * DashboardPage — wraps page content. Wider than DashboardSection so the
 * new dashboard layouts (grids, multi-column today page) can breathe.
 */
export function DashboardPage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        className ??
        "max-w-6xl mx-auto px-5 md:px-10 py-10 md:py-14 space-y-12 md:space-y-16"
      }
    >
      {children}
    </div>
  );
}
