"use client";

import { useState } from "react";
import { formatReps, formatSeconds, type WarmupStep } from "@/lib/warmup";
import type { ExerciseSection } from "./ExerciseChecklist";
import { CloseIcon } from "./icons";

const inputClass =
  "rounded-md border border-hairline bg-background px-3 py-2 text-base outline-none transition-[border-color] duration-150 ease-out focus:border-accent placeholder:text-muted";

export default function ExerciseEditor({
  sections,
  addAction,
  removeAction,
}: {
  sections: ExerciseSection[];
  addAction: (sectionId: number, formData: FormData) => Promise<WarmupStep[]>;
  removeAction: (sectionId: number, index: number) => Promise<WarmupStep[]>;
}) {
  const [stepsBySection, setStepsBySection] = useState<
    Record<number, WarmupStep[]>
  >(Object.fromEntries(sections.map((s) => [s.id, s.steps])));

  const setSection = (sectionId: number, steps: WarmupStep[]) =>
    setStepsBySection((prev) => ({ ...prev, [sectionId]: steps }));

  return (
    <ol className="flex flex-col gap-3">
      {sections.map((section) => {
        const steps = stepsBySection[section.id] ?? [];
        return (
          <li
            key={section.id}
            className="rounded-xl border border-hairline bg-surface p-4"
          >
            {section.title && (
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
                      <span className="sr-only">Phase {section.number}: </span>
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
            )}

            {steps.length > 0 && (
              <ul
                className={`flex flex-col gap-1 ${
                  section.title ? "mt-3 border-t border-hairline pt-3" : ""
                }`}
              >
                {steps.map((step, i) => (
                  <li
                    key={`${i}-${step.text}`}
                    className="flex items-center gap-2"
                  >
                    <span className="min-w-0 flex-1 px-1 py-1">
                      <span className="block text-[15px] leading-snug">
                        {step.text}
                      </span>
                      {step.note && (
                        <span className="mt-0.5 block text-xs leading-snug text-muted">
                          {step.note}
                        </span>
                      )}
                    </span>
                    {step.reps && (
                      <span className="shrink-0 rounded-full border border-hairline px-2.5 py-1 text-xs font-medium tabular-nums text-secondary">
                        {formatReps(step.reps)}
                      </span>
                    )}
                    {step.seconds !== undefined && (
                      <span className="shrink-0 rounded-full border border-hairline px-2.5 py-1 text-xs font-medium tabular-nums text-secondary">
                        {formatSeconds(step.seconds)}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (!confirm(`Remove “${step.text}”?`)) return;
                        removeAction(section.id, i).then((next) =>
                          setSection(section.id, next)
                        );
                      }}
                      aria-label={`Remove ${step.text}`}
                      className="shrink-0 rounded-md p-1.5 text-muted transition-colors duration-150 ease-out hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      <CloseIcon width={16} height={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <form
              action={async (formData: FormData) => {
                setSection(section.id, await addAction(section.id, formData));
              }}
              className={`flex flex-wrap gap-2 ${
                section.title || steps.length > 0
                  ? "mt-3 border-t border-hairline pt-3"
                  : ""
              }`}
            >
              <label htmlFor={`add-${section.id}`} className="sr-only">
                Add exercise{section.title ? ` to ${section.title}` : ""}
              </label>
              <input
                id={`add-${section.id}`}
                name="text"
                type="text"
                required
                placeholder={section.placeholder}
                className={`${inputClass} w-full`}
              />
              <label htmlFor={`note-${section.id}`} className="sr-only">
                Note (optional)
              </label>
              <input
                id={`note-${section.id}`}
                name="note"
                type="text"
                placeholder="Note — cues, setup, per side…"
                className={`${inputClass} w-full text-sm`}
              />
              <div className="flex w-full gap-2">
                <label htmlFor={`secs-${section.id}`} className="sr-only">
                  Seconds (optional, adds a timer)
                </label>
                <input
                  id={`secs-${section.id}`}
                  name="seconds"
                  type="number"
                  min={1}
                  max={3600}
                  inputMode="numeric"
                  placeholder="secs"
                  className={`${inputClass} w-20 tabular-nums`}
                />
                <label htmlFor={`reps-${section.id}`} className="sr-only">
                  Reps (optional)
                </label>
                <input
                  id={`reps-${section.id}`}
                  name="reps"
                  type="text"
                  placeholder="reps — 15, 8/side, 2×6"
                  className={`${inputClass} min-w-0 flex-1 text-sm`}
                />
                <button
                  type="submit"
                  className="rounded-md border border-hairline px-3 py-2 text-sm font-medium text-secondary transition-colors duration-150 ease-out hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
                >
                  Add
                </button>
              </div>
            </form>
          </li>
        );
      })}
    </ol>
  );
}
