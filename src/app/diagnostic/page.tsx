import { Quiz } from "@/components/quiz/Quiz";
import { PublicLayout } from "@/components/layouts/PublicLayout";

export const metadata = {
  title: "Diagnostic — Monk ModeX",
  description:
    "20 questions across 5 sections. About 90 seconds. Produces a personalized Reward System Diagnosis.",
};

export default function DiagnosticPage() {
  return (
    <PublicLayout showNav={false}>
      <Quiz />
    </PublicLayout>
  );
}
