"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  GenerationLoader,
  DIAGNOSIS_STAGES,
} from "@/components/shared/GenerationLoader";
import {
  QUESTIONS,
  Q7_AUD_FOLLOWUP,
  ED_FOLLOWUP,
  type Question,
  type QuizResponses,
} from "@/lib/quiz/schema";
import {
  advance,
  previousId,
  resumeAfterGate,
  FIRST_QUESTION,
  type FlowResult,
} from "@/lib/quiz/flow";
import type { SafetyGate } from "@/lib/quiz/safety-gates";
import { QuizProgress } from "./QuizProgress";
import { QuizQuestion } from "./QuizQuestion";
import { SafetyGateScreen } from "./SafetyGateScreen";

const ALL_QUESTIONS: Record<string, Question> = Object.fromEntries(
  [...QUESTIONS, Q7_AUD_FOLLOWUP, ED_FOLLOWUP].map((q) => [q.id, q])
);

export function Quiz() {
  const router = useRouter();
  const [responses, setResponses] = useState<QuizResponses>({});
  const [currentId, setCurrentId] = useState<string>(FIRST_QUESTION);
  const [activeGate, setActiveGate] = useState<{
    gate: SafetyGate;
    afterId: string | null;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = useMemo(
    () => ALL_QUESTIONS[currentId],
    [currentId]
  );

  const currentValue = useMemo(() => {
    if (!currentQuestion) return undefined;
    return (responses as Record<string, unknown>)[currentQuestion.id] as
      | string
      | string[]
      | number
      | undefined;
  }, [currentQuestion, responses]);

  const setAnswer = useCallback(
    (id: string, value: string | string[] | number) => {
      setResponses((prev) => ({ ...prev, [id]: value }));
    },
    []
  );

  const handleSubmit = useCallback(async (final: QuizResponses) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: final }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to start diagnosis");
      }
      const { responseId } = (await res.json()) as { responseId: string };
      router.push(`/diagnostic/results/${responseId}`);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong. Please try again."
      );
      setSubmitting(false);
    }
  }, [router]);

  const applyFlow = useCallback(
    (result: FlowResult, latestResponses: QuizResponses) => {
      if (result.kind === "next") {
        setCurrentId(result.id);
        return;
      }
      if (result.kind === "gate") {
        setActiveGate({ gate: result.gate, afterId: result.afterId });
        return;
      }
      // done
      handleSubmit(latestResponses);
    },
    [handleSubmit]
  );

  const handleNext = useCallback(() => {
    if (!currentQuestion) return;
    if (!isAnswered(currentQuestion, currentValue)) return;
    const result = advance(currentQuestion.id, responses);
    applyFlow(result, responses);
  }, [currentQuestion, currentValue, responses, applyFlow]);

  const handleBack = useCallback(() => {
    if (!currentQuestion) return;
    const prev = previousId(currentQuestion.id, responses);
    if (prev) setCurrentId(prev);
  }, [currentQuestion, responses]);

  const handleGateContinue = useCallback(() => {
    if (!activeGate) return;
    const result = resumeAfterGate(activeGate.afterId);
    setActiveGate(null);
    applyFlow(result, responses);
  }, [activeGate, responses, applyFlow]);

  if (activeGate) {
    return (
      <QuizShell section={null}>
        <SafetyGateScreen
          gate={activeGate.gate}
          onContinue={handleGateContinue}
        />
      </QuizShell>
    );
  }

  if (submitting) {
    return (
      <GenerationLoader
        kicker="Building your diagnosis"
        title="Reading your reward system, paragraph by paragraph."
        stages={DIAGNOSIS_STAGES}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <QuizShell section={null}>
        <div className="text-[var(--text-secondary)]">Loading…</div>
      </QuizShell>
    );
  }

  return (
    <QuizShell section={currentQuestion.section}>
      <QuizQuestion
        question={currentQuestion}
        value={currentValue}
        onChange={(v) => setAnswer(currentQuestion.id, v)}
        onNext={handleNext}
      />

      {error ? (
        <p className="mt-6 text-[0.9375rem] text-[var(--state-danger)]">
          {error}
        </p>
      ) : null}

      <div className="mt-12 flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={previousId(currentQuestion.id, responses) === null}
          className="inline-flex items-center gap-2 px-4 py-2.5 -ml-4 rounded-[6px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!isAnswered(currentQuestion, currentValue)}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-[6px] bg-[var(--accent-base)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
        >
          Next
          <ArrowRight size={16} />
        </button>
      </div>
    </QuizShell>
  );
}

function QuizShell({
  section,
  children,
}: {
  section: 1 | 2 | 3 | 4 | 5 | null;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto px-6 md:px-10 py-12 md:py-20 min-h-[80vh]">
      <div className="mb-10 md:mb-14">
        {section ? <QuizProgress section={section} /> : null}
      </div>
      {children}
    </div>
  );
}

function isAnswered(
  question: Question,
  value: string | string[] | number | undefined
): boolean {
  if (question.type === "multi") {
    return Array.isArray(value) && value.length > 0;
  }
  if (question.type === "text") {
    return typeof value === "string" && value.trim().length > 0;
  }
  // Single-select — Likert (q19/q20) values are stored as numbers
  return value !== undefined && value !== "";
}
