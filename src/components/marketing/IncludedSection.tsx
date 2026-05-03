import { Check } from "lucide-react";
import { H2, BodySm, Meta } from "@/components/shared/Type";

const foundationItems = [
  "Personalized Reward System Diagnosis",
  "30-day Foundation Protocol",
  "Custom cuts + self-binding strategies",
  "Daily non-negotiables anchored to your routines",
  "If-then plans for high-risk moments",
  "Daily check-in dashboard",
];

const operatorItems = [
  "Everything in Foundation",
  "Full 90-day program (Phases 1–4)",
  "Body Reset (weeks 3–6)",
  "Mind Reset (weeks 5–8)",
  "Exercise + meditation prescriptions",
  "Deep work + reading frameworks",
];

export function IncludedSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24">
      <Meta className="mb-3">Section 3 · What&rsquo;s included</Meta>
      <H2 className="max-w-2xl mb-12 md:mb-16">Two tiers. No subscription.</H2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <TierCard tier="Foundation" duration="30 days" items={foundationItems} />
        <TierCard
          tier="Operator"
          duration="90 days"
          items={operatorItems}
          highlight
        />
      </div>
    </section>
  );
}

function TierCard({
  tier,
  duration,
  items,
  highlight,
}: {
  tier: string;
  duration: string;
  items: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-7 md:p-8 ${
        highlight
          ? "bg-[var(--bg-elevated)] border-[var(--accent-muted)]"
          : "bg-[var(--bg-surface)] border-[var(--border-subtle)]"
      }`}
    >
      <div className="flex items-baseline justify-between mb-6 pb-6 border-b border-[var(--border-subtle)]">
        <span className="font-serif text-[1.5rem] text-[var(--text-primary)]">
          {tier}
        </span>
        <span className="font-mono text-[0.8125rem] uppercase tracking-[0.02em] text-[var(--text-secondary)]">
          {duration}
        </span>
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 items-start">
            <Check
              size={16}
              strokeWidth={2}
              className={`mt-1 shrink-0 ${
                highlight
                  ? "text-[var(--accent-base)]"
                  : "text-[var(--text-secondary)]"
              }`}
            />
            <BodySm className="text-[var(--text-primary)]">{item}</BodySm>
          </li>
        ))}
      </ul>
    </div>
  );
}
