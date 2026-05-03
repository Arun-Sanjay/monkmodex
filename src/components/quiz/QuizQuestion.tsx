"use client";

import { useState, useCallback } from "react";
import { Check } from "lucide-react";
import { H1, Body, BodySm } from "@/components/shared/Type";
import { Textarea } from "@/components/shared/Input";
import type { Question } from "@/lib/quiz/schema";
import { cn } from "@/lib/cn";

interface QuizQuestionProps {
  question: Question;
  value: string | string[] | number | undefined;
  onChange: (value: string | string[] | number) => void;
  onNext: () => void;
}

export function QuizQuestion({
  question,
  value,
  onChange,
  onNext,
}: QuizQuestionProps) {
  return (
    <div className="space-y-8 md:space-y-10">
      <header className="space-y-3">
        <H1 className="max-w-2xl">{question.question}</H1>
        {question.helper ? (
          <BodySm className="max-w-xl text-[var(--text-secondary)]">
            {question.helper}
          </BodySm>
        ) : null}
      </header>

      {question.type === "single" ? (
        <SingleSelect
          question={question}
          value={
            typeof value === "string"
              ? value
              : typeof value === "number"
                ? String(value)
                : undefined
          }
          onChange={onChange}
          onNext={onNext}
        />
      ) : null}

      {question.type === "multi" ? (
        <MultiSelect
          question={question}
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
        />
      ) : null}

      {question.type === "text" ? (
        <FreeText
          question={question}
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
        />
      ) : null}
    </div>
  );
}

function SingleSelect({
  question,
  value,
  onChange,
  onNext,
}: {
  question: Extract<Question, { type: "single" }>;
  value: string | undefined;
  onChange: (v: string | number) => void;
  onNext: () => void;
}) {
  const isLikertScale = question.id.startsWith("q19") || question.id.startsWith("q20");

  return (
    <div className="space-y-3 max-w-2xl">
      {question.options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              if (isLikertScale) {
                onChange(parseInt(opt.value, 10));
              } else {
                onChange(opt.value);
              }
              // Auto-advance on single-select
              setTimeout(() => onNext(), 200);
            }}
            className={cn(
              "w-full text-left px-5 py-4 md:px-6 md:py-5 rounded-[6px] border transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)]",
              selected
                ? "bg-[var(--accent-muted)] border-[var(--accent-base)] text-[var(--text-primary)]"
                : "bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-[var(--text-primary)]"
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="font-sans text-[1.0625rem] leading-tight">
                  {opt.label}
                </div>
                {opt.sublabel ? (
                  <div className="mt-1 font-sans text-[0.875rem] text-[var(--text-secondary)] leading-snug">
                    {opt.sublabel}
                  </div>
                ) : null}
              </div>
              {selected ? (
                <Check
                  size={18}
                  strokeWidth={2}
                  className="shrink-0 text-[var(--accent-base)]"
                />
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function MultiSelect({
  question,
  value,
  onChange,
}: {
  question: Extract<Question, { type: "multi" }>;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = useCallback(
    (optValue: string) => {
      const noneValue = question.noneValue;
      let next: string[];
      if (noneValue && optValue === noneValue) {
        // Selecting "none" clears everything else
        next = value.includes(noneValue) ? [] : [noneValue];
      } else if (value.includes(optValue)) {
        next = value.filter((v) => v !== optValue);
      } else {
        // Selecting a real option clears "none"
        next = [...value.filter((v) => v !== noneValue), optValue];
      }
      onChange(next);
    },
    [value, onChange, question.noneValue]
  );

  return (
    <div className="space-y-3 max-w-2xl">
      {question.options.map((opt) => {
        const selected = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={cn(
              "w-full text-left px-5 py-4 md:px-6 md:py-5 rounded-[6px] border transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)]",
              selected
                ? "bg-[var(--accent-muted)] border-[var(--accent-base)] text-[var(--text-primary)]"
                : "bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-[var(--text-primary)]"
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="font-sans text-[1.0625rem] leading-tight">
                  {opt.label}
                </div>
                {opt.sublabel ? (
                  <div className="mt-1 font-sans text-[0.875rem] text-[var(--text-secondary)] leading-snug">
                    {opt.sublabel}
                  </div>
                ) : null}
              </div>
              <div
                className={cn(
                  "shrink-0 w-5 h-5 rounded-[4px] border flex items-center justify-center",
                  selected
                    ? "bg-[var(--accent-base)] border-[var(--accent-base)]"
                    : "border-[var(--border-default)]"
                )}
              >
                {selected ? (
                  <Check
                    size={13}
                    strokeWidth={2.5}
                    className="text-[var(--text-primary)]"
                  />
                ) : null}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function FreeText({
  question,
  value,
  onChange,
}: {
  question: Extract<Question, { type: "text" }>;
  value: string;
  onChange: (v: string) => void;
}) {
  const [localValue, setLocalValue] = useState(value);

  return (
    <div className="space-y-4 max-w-2xl">
      <Textarea
        value={localValue}
        onChange={(e) => {
          setLocalValue(e.target.value);
          onChange(e.target.value);
        }}
        maxLength={question.maxLength}
        placeholder={question.placeholder}
        rows={4}
        autoFocus
      />
      <div className="flex items-center justify-between">
        <Body className="text-[var(--text-tertiary)] text-[0.875rem]">
          {question.examples?.length ? "Examples:" : null}
        </Body>
        <span className="font-mono text-[0.8125rem] text-[var(--text-tertiary)] tabular-nums">
          {localValue.length} / {question.maxLength}
        </span>
      </div>
      {question.examples?.length ? (
        <ul className="space-y-1.5 text-[0.9375rem] text-[var(--text-tertiary)] italic">
          {question.examples.map((ex) => (
            <li key={ex}>{ex}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
