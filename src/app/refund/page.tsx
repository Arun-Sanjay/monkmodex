import { PublicLayout } from "@/components/layouts/PublicLayout";
import { H1, Body, Meta } from "@/components/shared/Type";

export const metadata = {
  title: "Refund Policy — Monk ModeX",
};

export default function RefundPage() {
  return (
    <PublicLayout>
      <article className="max-w-2xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-16">
        <Meta className="mb-3">Refund policy</Meta>
        <H1 className="mb-8">30 days, no questions asked.</H1>
        <Body className="text-[var(--text-secondary)]">
          Placeholder. Once payments are wired, this becomes the operative
          refund agreement. The Foundation tier and Operator tier both carry
          a 30-day money-back guarantee with no required justification.
        </Body>
      </article>
    </PublicLayout>
  );
}
