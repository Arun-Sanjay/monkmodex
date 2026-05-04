import Link from "next/link";
import type { ReactNode } from "react";
import { PillNav } from "@/components/marketing/PillNav";
import { APP_NAME } from "@/lib/constants";

export function PublicLayout({
  children,
  showNav = true,
}: {
  children: ReactNode;
  showNav?: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {showNav ? <PillNav /> : null}

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[var(--border-subtle)] mt-12">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 flex flex-col md:flex-row gap-6 md:gap-12 justify-between items-start md:items-center">
          <div className="font-mono text-[0.75rem] text-[var(--text-tertiary)] uppercase tracking-[0.08em]">
            {APP_NAME} · v1
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-2 font-sans text-[0.9375rem] text-[var(--text-secondary)]">
            <Link href="/research" className="hover:text-[var(--text-primary)]">
              Research
            </Link>
            <Link
              href="/medical-disclaimer"
              className="hover:text-[var(--text-primary)]"
            >
              Medical disclaimer
            </Link>
            <Link href="/terms" className="hover:text-[var(--text-primary)]">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-[var(--text-primary)]">
              Privacy
            </Link>
            <Link href="/refund" className="hover:text-[var(--text-primary)]">
              Refund
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
