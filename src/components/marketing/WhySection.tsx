import { Scale, Target, BookOpen } from "lucide-react";
import { H2, H3, BodySm, Meta } from "@/components/shared/Type";

const cards = [
  {
    icon: Scale,
    title: "No bro-science.",
    body: "Every claim is grounded in peer-reviewed research. We flag what's overhyped — including in our own field.",
  },
  {
    icon: Target,
    title: "Personalized, not generic.",
    body: "A 90-second diagnostic maps your specific reward-system dysregulation. The protocol that follows is built for you, not a 'typical user'.",
  },
  {
    icon: BookOpen,
    title: "Built on real addiction medicine.",
    body: "Anna Lembke (Stanford), Nora Volkow (NIDA), Kent Berridge, Phillippa Lally, Peter Gollwitzer, BJ Fogg.",
  },
];

export function WhySection() {
  return (
    <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24">
      <Meta className="mb-3">Section 1 · Why this is different</Meta>
      <H2 className="max-w-2xl mb-12 md:mb-16">
        Why this isn&rsquo;t another monk mode app.
      </H2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {cards.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-7 md:p-8"
          >
            <Icon
              size={22}
              strokeWidth={1.5}
              className="text-[var(--accent-base)] mb-5"
            />
            <H3 className="mb-3 text-[1.125rem]">{title}</H3>
            <BodySm>{body}</BodySm>
          </div>
        ))}
      </div>
    </section>
  );
}
