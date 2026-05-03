"use client";

import { motion } from "motion/react";

/**
 * Authority row — the names behind the protocol.
 * Adapts the typical "logo wall" pattern to research authors. We don't have
 * brand endorsements; we have research citations. This is the on-brand
 * version of social proof.
 */
const AUTHORS = [
  { name: "Lembke", note: "Stanford" },
  { name: "Volkow", note: "NIDA" },
  { name: "Berridge", note: "U. Michigan" },
  { name: "Lally", note: "UCL" },
  { name: "Gollwitzer", note: "NYU" },
  { name: "Fogg", note: "Stanford" },
  { name: "Marlatt", note: "U. Washington" },
  { name: "Walker", note: "UC Berkeley" },
];

export function AuthorityRow() {
  return (
    <section className="border-y border-[var(--border-subtle)] py-12 md:py-14">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center font-mono text-[0.75rem] tracking-[0.12em] uppercase text-[var(--text-tertiary)] mb-8"
        >
          The names you&rsquo;ll see in your protocol
        </motion.p>
        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.07, delayChildren: 0.15 },
            },
          }}
          className="flex flex-wrap items-center justify-center gap-x-10 md:gap-x-14 gap-y-5"
        >
          {AUTHORS.map(({ name, note }) => (
            <motion.li
              key={name}
              variants={{
                hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
                visible: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              className="flex items-baseline gap-2"
            >
              <span className="font-serif text-[1.25rem] md:text-[1.375rem] text-[var(--text-secondary)]">
                {name}
              </span>
              <span className="font-mono text-[0.6875rem] tracking-[0.08em] uppercase text-[var(--text-tertiary)]">
                {note}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
