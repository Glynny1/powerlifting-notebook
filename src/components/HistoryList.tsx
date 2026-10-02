import { formatDate } from "@/lib/format";
import { TrashIcon } from "./icons";

export type HistoryRow = { date: string; display: string };

export default function HistoryList({
  rows,
  deleteAction,
}: {
  rows: HistoryRow[];
  deleteAction: (date: string) => Promise<void>;
}) {
  if (rows.length === 0) return null;

  return (
    <ul className="divide-y divide-hairline rounded-xl border border-hairline bg-surface">
      {rows.map((row) => (
        <li
          key={row.date}
          className="flex items-center justify-between gap-3 px-4 py-2.5"
        >
          <span className="text-sm text-secondary">{formatDate(row.date)}</span>
          <span className="ml-auto font-medium tabular-nums">{row.display}</span>
          <form action={deleteAction.bind(null, row.date)}>
            <button
              type="submit"
              aria-label={`Delete entry for ${formatDate(row.date)}`}
              className="rounded-md p-1.5 text-muted transition-colors duration-150 ease-out hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
            >
              <TrashIcon />
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}
