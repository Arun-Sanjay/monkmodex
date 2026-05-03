import { PublicLayout } from "@/components/layouts/PublicLayout";
import { H1, Body, Meta } from "@/components/shared/Type";

export const metadata = {
  title: "Terms — Monk ModeX",
};

export default function TermsPage() {
  return (
    <PublicLayout>
      <article className="max-w-2xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-16">
        <Meta className="mb-3">Terms of Service</Meta>
        <H1 className="mb-8">Operator agreement.</H1>
        <Body className="text-[var(--text-secondary)]">
          Placeholder. The shippable version of this document covers product
          description, acceptable use, refund policy (30 days, no questions),
          intellectual property, disclaimers (this is not medical advice — see
          a clinician for clinical concerns), limitation of liability, and
          dispute resolution.
        </Body>
      </article>
    </PublicLayout>
  );
}
