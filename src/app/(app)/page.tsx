import Notice from "@/components/Notice";
import { formatDate, formatKg, formatPlace, todayIso } from "@/lib/format";
import { LIFTS, liftLabel, type Lift } from "@/lib/lifts";
import {
  MAX_KEYS,
  MEET_DATE_KEY,
  formatCountdown,
  meetCountdown,
  parseMaxKg,
  planAttempts,
} from "@/lib/meet";
import { getOplData, type OplMeet } from "@/lib/opl";
import { getSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

function CountdownCard({ meetDate }: { meetDate: string }) {
  const countdown = meetCountdown(todayIso(), meetDate);

  if (!countdown) {
    return (
      <Notice
        title="Your meet date has passed"
        href="/settings"
        linkLabel="Set the next one"
      >
        Hope it went well — put the next meet in Settings and the countdown
        starts again.
      </Notice>
    );
  }

  return (
    <div className="rounded-xl border border-hairline bg-surface px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        Next meet
      </p>
      <p className="mt-1 text-3xl font-semibold tracking-tight">
        {formatCountdown(countdown)}
      </p>
      <p className="mt-1 text-sm text-secondary">{formatDate(meetDate)}</p>
    </div>
  );
}

function AttemptPlanner({ maxes }: { maxes: Record<Lift, number | null> }) {
  const planned = LIFTS.filter((l) => maxes[l] !== null);
  if (planned.length === 0) return null;

  const total = LIFTS.every((l) => maxes[l] !== null)
    ? LIFTS.reduce((sum, l) => sum + planAttempts(maxes[l]!).third, 0)
    : null;

  return (
    <div className="rounded-xl border border-hairline bg-surface p-4">
      <h2 className="text-xs font-medium uppercase tracking-wide text-muted">
        Attempt planner
      </h2>
      <table className="mt-3 w-full text-sm">
        <thead>
          <tr className="text-xs text-muted">
            <th scope="col" className="pb-1.5 text-left font-normal">
              Lift
            </th>
            <th scope="col" className="pb-1.5 text-right font-normal">
              1st
            </th>
            <th scope="col" className="pb-1.5 text-right font-normal">
              2nd
            </th>
            <th scope="col" className="pb-1.5 text-right font-normal">
              3rd
            </th>
          </tr>
        </thead>
        <tbody>
          {planned.map((lift) => {
            const plan = planAttempts(maxes[lift]!);
            return (
              <tr key={lift} className="border-t border-hairline">
                <th scope="row" className="py-2 text-left font-medium">
                  {liftLabel(lift)}
                  <span className="ml-1.5 text-xs font-normal text-muted">
                    max {formatKg(maxes[lift])}
                  </span>
                </th>
                <td className="py-2 text-right tabular-nums text-secondary">
                  {formatKg(plan.first)}
                </td>
                <td className="py-2 text-right tabular-nums text-secondary">
                  {formatKg(plan.second)}
                </td>
                <td className="py-2 text-right font-medium tabular-nums">
                  {formatKg(plan.third)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {total !== null && (
        <p className="mt-2 border-t border-hairline pt-2 text-sm text-secondary">
          All thirds in: <span className="font-medium tabular-nums text-foreground">{formatKg(total)} kg</span> total
        </p>
      )}
      <p className="mt-2 text-xs text-muted">
        1st ≈91% · 2nd ≈97% · 3rd ≈101% of gym max, rounded to 2.5 kg.
      </p>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-hairline bg-surface px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold">
        {value}
        {value !== "—" && (
          <span className="ml-1 text-sm font-normal text-muted">kg</span>
        )}
      </p>
    </div>
  );
}

function MeetCard({ meet }: { meet: OplMeet }) {
  return (
    <li className="rounded-xl border border-hairline bg-surface p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-medium">{meet.meetName}</p>
        {meet.place && (
          <span className="shrink-0 text-sm font-semibold text-accent">
            {formatPlace(meet.place)}
          </span>
        )}
      </div>
      <p className="mt-0.5 text-sm text-secondary">
        {formatDate(meet.date)} · {meet.federation}
        {meet.weightClassKg && ` · ${meet.weightClassKg} kg class`}
      </p>
      <dl className="mt-3 grid grid-cols-4 gap-2 border-t border-hairline pt-3 text-center">
        {(
          [
            ["S", meet.squat],
            ["B", meet.bench],
            ["D", meet.deadlift],
            ["Total", meet.total],
          ] as const
        ).map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="font-medium tabular-nums">{formatKg(value)}</dd>
          </div>
        ))}
      </dl>
    </li>
  );
}

export default async function HomePage() {
  const data = await getOplData();

  if (data.state === "no-db") {
    return (
      <Notice title="Almost there — no database yet">
        Connect the Neon database (Vercel → Storage → Neon) and set DATABASE_URL,
        then run npm run db:push.
      </Notice>
    );
  }

  const meetDate = await getSetting(MEET_DATE_KEY);
  const maxes = {} as Record<Lift, number | null>;
  for (const lift of LIFTS) {
    maxes[lift] = parseMaxKg(await getSetting(MAX_KEYS[lift]));
  }
  const meetSection =
    meetDate || LIFTS.some((l) => maxes[l] !== null) ? (
      <section aria-label="Meet prep" className="flex flex-col gap-3">
        {meetDate && <CountdownCard meetDate={meetDate} />}
        <AttemptPlanner maxes={maxes} />
      </section>
    ) : null;

  if (data.state === "unset" || data.state === "error") {
    return (
      <div className="flex flex-col gap-8">
        {meetSection}
        {data.state === "unset" ? (
          <Notice
            title="Link your OpenPowerlifting profile"
            href="/settings"
            linkLabel="Open Settings"
          >
            Add your OpenPowerlifting username in Settings and your competition
            record will show up here.
          </Notice>
        ) : (
          <Notice title="Couldn't load your OpenPowerlifting record">
            {data.message}
          </Notice>
        )}
      </div>
    );
  }

  const { stats, meets } = data;

  return (
    <div className="flex flex-col gap-8">
      {meetSection}
      <section aria-labelledby="prs">
        <h1 id="prs" className="sr-only">
          Competition personal records
        </h1>
        <div className="rounded-xl border border-hairline bg-surface px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Best total
          </p>
          <p className="mt-1 text-5xl font-semibold tracking-tight">
            {formatKg(stats.bestTotal)}
            {stats.bestTotal !== null && (
              <span className="ml-1.5 text-lg font-normal text-muted">kg</span>
            )}
          </p>
          <p className="mt-2 text-sm text-secondary">
            {stats.bestDots !== null && `${stats.bestDots.toFixed(1)} Dots · `}
            {stats.meetCount} {stats.meetCount === 1 ? "meet" : "meets"} on
            record
          </p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <StatTile label="Squat" value={formatKg(stats.bestSquat)} />
          <StatTile label="Bench" value={formatKg(stats.bestBench)} />
          <StatTile label="Deadlift" value={formatKg(stats.bestDeadlift)} />
        </div>
      </section>

      <section aria-labelledby="meets">
        <h2 id="meets" className="mb-3 text-sm font-medium uppercase tracking-wide text-muted">
          Meet history
        </h2>
        <ul className="flex flex-col gap-3">
          {meets.map((meet) => (
            <MeetCard key={`${meet.date}-${meet.meetName}`} meet={meet} />
          ))}
        </ul>
      </section>
    </div>
  );
}
