"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { APP_NAME } from "@/lib/constants";

const NAV_ITEMS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "/research", label: "Research" },
  { href: "#faqs", label: "FAQs" },
];

export function PillNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled ? "py-3" : "py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          aria-label={APP_NAME}
          className={cn(
            "relative inline-flex items-center justify-center h-11 px-5 rounded-full shrink-0 transition-colors duration-200",
            "bg-[var(--bg-surface)]/80 backdrop-blur-md border border-[var(--border-subtle)]",
            "text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
          )}
        >
          <Logo />
        </Link>

        {/* Desktop nav — pill, centered */}
        <nav
          className={cn(
            "hidden md:flex items-center gap-1 px-2 py-2 rounded-full",
            "bg-[var(--bg-surface)]/80 backdrop-blur-md border border-[var(--border-subtle)]",
            "transition-all duration-300"
          )}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-5 py-2 rounded-full font-sans text-[0.9375rem] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors duration-150"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right CTA — pill */}
        <div className="hidden md:block">
          <Link
            href="/diagnostic"
            className="group relative inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[var(--accent-base)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] font-medium text-[0.9375rem] transition-colors duration-150 shadow-[0_0_24px_-8px_var(--accent-base)]"
          >
            Start the diagnostic
          </Link>
        </div>

        {/* Mobile — toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-full bg-[var(--bg-surface)]/80 backdrop-blur-md border border-[var(--border-subtle)] text-[var(--text-primary)]"
          aria-label="Open menu"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mx-6 mt-3 rounded-2xl bg-[var(--bg-surface)]/95 backdrop-blur-md border border-[var(--border-subtle)] p-3"
          >
            <nav className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-xl font-sans text-[1rem] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/diagnostic"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center justify-center h-12 rounded-xl bg-[var(--accent-base)] text-[var(--text-primary)] font-medium"
              >
                Start the diagnostic
              </Link>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function Logo() {
  return (
    <span className="font-serif text-[1.375rem] tracking-[-0.02em] text-[var(--text-primary)] leading-none">
      MMX
    </span>
  );
}
