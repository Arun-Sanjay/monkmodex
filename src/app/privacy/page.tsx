import { PublicLayout } from "@/components/layouts/PublicLayout";
import { H1, Body, Meta } from "@/components/shared/Type";

export const metadata = {
  title: "Privacy — Monk ModeX",
};

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <article className="max-w-2xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-16">
        <Meta className="mb-3">Privacy</Meta>
        <H1 className="mb-8">What we collect, why, and for how long.</H1>
        <Body className="text-[var(--text-secondary)]">
          Placeholder. The shippable version covers GDPR + CCPA: what data is
          collected (quiz responses, generated diagnosis + protocol, daily
          check-ins), the legal basis for processing, retention windows, third
          parties (Anthropic, Supabase, Lemon Squeezy, Resend), the right to
          access / delete / port your data, and how to exercise it.
        </Body>
      </article>
    </PublicLayout>
  );
}
