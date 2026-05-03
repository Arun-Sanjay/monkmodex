import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Hero } from "@/components/marketing/Hero";
import { AuthorityRow } from "@/components/marketing/AuthorityRow";
import { IntroReveal } from "@/components/marketing/IntroReveal";
import { BentoFeatures } from "@/components/marketing/BentoFeatures";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { ResearchStats } from "@/components/marketing/ResearchStats";
import { FAQ } from "@/components/marketing/FAQ";
import { FinalCTA } from "@/components/marketing/FinalCTA";

export default function HomePage() {
  return (
    <PublicLayout>
      <Hero />
      <AuthorityRow />
      <IntroReveal />
      <BentoFeatures />
      <HowItWorks />
      <ResearchStats />
      <FAQ />
      <FinalCTA />
    </PublicLayout>
  );
}
