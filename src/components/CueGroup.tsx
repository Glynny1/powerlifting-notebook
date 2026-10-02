"use client";

import { useState } from "react";
import { createCue, deleteCue, updateCue } from "@/app/(app)/cues.actions";
import type { Cue } from "@/lib/db/schema";
import type { Lift } from "@/lib/lifts";
import { PencilIcon, TrashIcon } from "./icons";

const inputClass =
  "min-w-0 flex-1 rounded-md border border-hairline bg-background px-3 py-2 text-base outline-none transition-[border-color] duration-150 ease-out focus:border-accent placeholder:text-muted";

function CueItem({ cue, lift }: { cue: Cue; lift: Lift }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li>
        <form
          action={async (formData: FormData) => {
            await updateCue(lift, cue.id, formData);
            setEditing(false);
          }}
          className="flex gap-2"
        >
          <label htmlFor={`cue-${cue.id}`} className="sr-only">
            Edit cue
          </label>
          <input
            id={`cue-${cue.id}`}
            name="text"
            type="text"
            required
            defaultValue={cue.text}
            autoFocus
            className={inputClass}
          />
          <button
            type="submit"
            className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background transition-opacity duration-150 ease-out hover:opacity-85"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-md border border-hairline px-3 py-2 text-sm text-secondary transition-colors duration-150 ease-out hover:text-foreground"
          >
            Cancel
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-2">
      <p className="text-[15px] leading-relaxed">“{cue.text}”</p>
      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={`Edit cue: ${cue.text}`}
          className="rounded-md p-1.5 text-muted transition-colors duration-150 ease-out hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
        >
          <PencilIcon />
        </button>
        <form action={deleteCue.bind(null, lift, cue.id)}>
          <button
            type="submit"
            aria-label={`Delete cue: ${cue.text}`}
            className="rounded-md p-1.5 text-muted transition-colors duration-150 ease-out hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
          >
            <TrashIcon />
          </button>
        </form>
      </div>
    </li>
  );
}

export default function CueGroup({
  lift,
  label,
  cues,
  placeholder,
}: {
  lift: Lift;
  label: string;
  cues: Cue[];
  placeholder: string;
}) {
  return (
    <section
      aria-label={`${label} cues`}
      className="rounded-xl border border-hairline bg-surface p-4"
    >
      <h2 className="text-xs font-medium uppercase tracking-wide text-muted">
        {label} cues
      </h2>
      {cues.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-2.5">
          {cues.map((cue) => (
            <CueItem key={cue.id} cue={cue} lift={lift} />
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted">
          Nothing here yet — add the words that fix your {label.toLowerCase()}.
        </p>
      )}
      <form
        action={createCue.bind(null, lift)}
        className="mt-3 flex gap-2 border-t border-hairline pt-3"
      >
        <label htmlFor={`add-${lift}`} className="sr-only">
          Add {label} cue
        </label>
        <input
          id={`add-${lift}`}
          name="text"
          type="text"
          required
          placeholder={placeholder}
          className={inputClass}
        />
        <button
          type="submit"
          className="rounded-md border border-hairline px-3 py-2 text-sm font-medium text-secondary transition-colors duration-150 ease-out hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
        >
          Add
        </button>
      </form>
    </section>
  );
}
