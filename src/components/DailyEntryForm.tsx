import { todayIso } from "@/lib/format";

// Server component: date + one number, no client JS needed.
export default function DailyEntryForm({
  action,
  valueLabel,
  unit,
  step,
  min,
  max,
  placeholder,
}: {
  action: (formData: FormData) => Promise<void>;
  valueLabel: string;
  unit: string;
  step: string;
  min: number;
  max: number;
  placeholder: string;
}) {
  return (
    <form
      action={action}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-hairline bg-surface p-4"
    >
      <label className="flex flex-col gap-1 text-sm text-secondary">
        Date
        <input
          name="date"
          type="date"
          required
          defaultValue={todayIso()}
          className="rounded-md border border-hairline bg-background px-3 py-2 text-base outline-none transition-[border-color] duration-150 ease-out focus:border-accent"
        />
      </label>
      <label className="flex min-w-28 flex-1 flex-col gap-1 text-sm text-secondary">
        {valueLabel} ({unit})
        <input
          name="value"
          type="number"
          required
          inputMode="decimal"
          step={step}
          min={min}
          max={max}
          placeholder={placeholder}
          className="rounded-md border border-hairline bg-background px-3 py-2 text-base tabular-nums outline-none transition-[border-color] duration-150 ease-out focus:border-accent placeholder:text-muted"
        />
      </label>
      <button
        type="submit"
        className="rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity duration-150 ease-out hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:opacity-70"
      >
        Save
      </button>
    </form>
  );
}
