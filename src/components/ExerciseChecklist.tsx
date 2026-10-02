"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useRef, useState } from "react";
import { formatReps, formatSeconds, type WarmupStep } from "@/lib/warmup";
import { PencilIcon } from "./icons";

export type ExerciseSection = {
  id: number;
  number?: number; // phase badge
  title?: string;
  blurb?: string;
  placeholder: string;
  steps: WarmupStep[];
};

const ghostButtonClass =
  "rounded-md border border-hairline px-4 py-2 text-sm font-medium text-secondary transition-colors duration-150 ease-out hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function StepRow({
  step,
  onToggle,
}: {
  step: WarmupStep;
  onToggle: (done: boolean) => void;
}) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const onToggleRef = useRef(onToggle);
  onToggleRef.current = onToggle;
  const running = remaining !== null;

  useEffect(() => {
    if (remaining === null) return;
    if (remaining <= 0) {
      setRemaining(null);
      onToggleRef.current(true);
      if (typeof navigator !== "undefined") navigator.vibrate?.(200);
      return;
    }
    const t = setTimeout(() => setRemaining(remaining - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  // Ticking a running exercise by hand stops its timer
  const toggle = (done: boolean) => {
    setRemaining(null);
    onToggle(done);
  };

  return (
    <li className="flex items-center gap-2">
      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-md px-1 py-2 transition-colors duration-150 ease-out hover:bg-background">
        <input
          type="checkbox"
          checked={step.done}
          onChange={(e) => toggle(e.target.checked)}
          className="h-5 w-5 shrink-0 accent-accent"
        />
        <span className="min-w-0">
          <span
            className={`block text-[15px] leading-snug transition-colors duration-150 ease-out ${
              step.done ? "text-muted line-through" : ""
            }`}
          >
            {step.text}
          </span>
          {step.note && (
            <span className="mt-0.5 block text-xs leading-snug text-muted">
              {step.note}
            </span>
          )}
        </span>
      </label>
      {step.reps && (
        <span className="shrink-0 rounded-full border border-hairline px-2.5 py-1 text-xs font-medium tabular-nums text-secondary">
          {formatReps(step.reps)}
        </span>
      )}
      {step.seconds !== undefined &&
        (step.done ? (
          <span className="shrink-0 text-xs tabular-nums text-muted">
            {formatSeconds(step.seconds)}
          </span>
        ) : (
          <button
            type="button"
            onClick={() =>
              running ? setRemaining(null) : setRemaining(step.seconds!)
            }
            aria-label={
              running
                ? `Cancel timer, ${formatSeconds(remaining!)} left`
                : `Start ${formatSeconds(step.seconds)} timer`
            }
            className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium tabular-nums transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-accent ${
              running
                ? "border-accent text-accent"
                : "border-hairline text-secondary hover:text-foreground"
            }`}
          >
            {running ? formatSeconds(remaining!) : formatSeconds(step.seconds)}
          </button>
        ))}
    </li>
  );
}

export default function ExerciseChecklist({
  sections,
  editHref,
  toggleAction,
  resetAction,
}: {
  sections: ExerciseSection[];
  editHref: Route;
  toggleAction: (sectionId: number, index: number, done: boolean) => Promise<void>;
  resetAction: () => Promise<void>;
}) {
  const [stepsBySection, setStepsBySection] = useState<
    Record<number, WarmupStep[]>
  >(Object.fromEntries(sections.map((s) => [s.id, s.steps])));
  const anyTicked = Object.values(stepsBySection).some((steps) =>
    steps.some((s) => s.done)
  );

  const toggle = (sectionId: number, index: number, done: boolean) => {
    setStepsBySection((prev) => ({
      ...prev,
      [sectionId]: (prev[sectionId] ?? []).map((s, i) =>
        i === index ? { ...s, done } : s
      ),
    }));
    // Fire-and-forget: the tick shows instantly, the write catches up
    void toggleAction(sectionId, index, done).catch(() => {});
  };

  const reset = () => {
    setStepsBySection((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([id, steps]) => [
          id,
          steps.map((s) => ({ ...s, done: false })),
        ])
      )
    );
    void resetAction().catch(() => {});
  };

  return (
    <div className="flex flex-col gap-3">
      <ol className="flex flex-col gap-3">
        {sections.map((section) => {
          const steps = stepsBySection[section.id] ?? [];
          const doneCount = steps.filter((s) => s.done).length;
          return (
            <li
              key={section.id}
              className="rounded-xl border border-hairline bg-surface p-4"
            >
              <div className="flex items-start justify-between gap-3">
                {section.title ? (
                  <div className="flex items-baseline gap-2.5">
                    {section.number !== undefined && (
                      <span
                        aria-hidden
                        className="text-sm font-semibold tabular-nums text-accent"
                      >
                        {section.number}
                      </span>
                    )}
                    <div>
                      <h2 className="font-medium">
                        {section.number !== undefined && (
                          <span className="sr-only">
                            Phase {section.number}:{" "}
                          </span>
                        )}
                        {section.title}
                      </h2>
                      {section.blurb && (
                        <p className="mt-0.5 text-sm text-secondary">
                          {section.blurb}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div />
                )}
                {steps.length > 0 && (
                  <span
                    className="shrink-0 text-xs tabular-nums text-muted"
                    aria-label={`${doneCount} of ${steps.length} done`}
                  >
                    {doneCount}/{steps.length}
                  </span>
                )}
              </div>
              {steps.length > 0 ? (
                <ul
                  className={`flex flex-col ${
                    section.title
                      ? "mt-3 border-t border-hairline pt-2"
                      : "-mt-4"
                  }`}
                >
                  {steps.map((step, i) => (
                    <StepRow
                      key={`${i}-${step.text}`}
                      step={step}
                      onToggle={(done) => toggle(section.id, i, done)}
                    />
                  ))}
                </ul>
              ) : (
                <p
                  className={`text-sm text-muted ${
                    section.title
                      ? "mt-3 border-t border-hairline pt-3"
                      : "-mt-2"
                  }`}
                >
                  Nothing here yet — add exercises in the editor.
                </p>
              )}
            </li>
          );
        })}
      </ol>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={reset}
          disabled={!anyTicked}
          className={`${ghostButtonClass} disabled:cursor-default disabled:opacity-45`}
        >
          Reset all ticks
        </button>
        <Link
          href={editHref}
          className={`${ghostButtonClass} flex items-center gap-1.5`}
        >
          <PencilIcon width={15} height={15} />
          Edit
        </Link>
      </div>
    </div>
  );
}
