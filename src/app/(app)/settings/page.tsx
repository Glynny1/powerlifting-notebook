import Link from "next/link";
import Notice from "@/components/Notice";
import { getDb } from "@/lib/db";
import { LIFTS, liftLabel } from "@/lib/lifts";
import { MAX_KEYS, MEET_DATE_KEY } from "@/lib/meet";
import { OPL_USERNAME_KEY } from "@/lib/opl";
import { getSetting } from "@/lib/settings";
import { saveMeetPrep, saveOplUsername } from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const hasDb = getDb() !== null;
  const username = hasDb ? await getSetting(OPL_USERNAME_KEY) : null;
  const meetDate = hasDb ? await getSetting(MEET_DATE_KEY) : null;
  const maxes: Record<string, string | null> = {};
  if (hasDb) {
    for (const lift of LIFTS) maxes[lift] = await getSetting(MAX_KEYS[lift]);
  }

  const inputClass =
    "rounded-md border border-hairline bg-background px-3 py-2 text-base outline-none transition-[border-color] duration-150 ease-out focus:border-accent placeholder:text-muted";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Settings</h1>

      {hasDb && (
        <section className="rounded-xl border border-hairline bg-surface p-5">
          <h2 className="font-medium">Meet prep</h2>
          <p className="mt-1 text-sm text-secondary">
            Your next meet date drives the home page countdown; your current
            gym maxes drive the attempt planner.
          </p>
          <form action={saveMeetPrep} className="mt-4 flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm text-secondary">
              Next meet date
              <input
                name="meetDate"
                type="date"
                defaultValue={meetDate ?? ""}
                className={inputClass}
              />
            </label>
            <div className="grid grid-cols-3 gap-2">
              {LIFTS.map((lift) => (
                <label
                  key={lift}
                  className="flex flex-col gap-1 text-sm text-secondary"
                >
                  {liftLabel(lift)} max (kg)
                  <input
                    name={`max-${lift}`}
                    type="number"
                    step="0.5"
                    min={20}
                    max={600}
                    inputMode="decimal"
                    defaultValue={maxes[lift] ?? ""}
                    placeholder="kg"
                    className={`${inputClass} tabular-nums`}
                  />
                </label>
              ))}
            </div>
            {saved === "meet" && (
              <p role="status" className="text-sm text-secondary">
                Saved — the home page is up to date.
              </p>
            )}
            <button
              type="submit"
              className="self-start rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity duration-150 ease-out hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:opacity-70"
            >
              Save
            </button>
          </form>
        </section>
      )}

      {hasDb ? (
        <section className="rounded-xl border border-hairline bg-surface p-5">
          <h2 className="font-medium">OpenPowerlifting profile</h2>
          <p className="mt-1 text-sm text-secondary">
            Paste your profile URL or just the username — the part after
            openpowerlifting.org/u/.
          </p>
          <form action={saveOplUsername} className="mt-4 flex flex-col gap-3">
            <label htmlFor="username" className="sr-only">
              OpenPowerlifting username or profile URL
            </label>
            <input
              id="username"
              name="username"
              type="text"
              defaultValue={username ?? ""}
              placeholder="e.g. openpowerlifting.org/u/johnhaack"
              autoCapitalize="none"
              autoCorrect="off"
              className="rounded-md border border-hairline bg-background px-3 py-2.5 text-base outline-none transition-[border-color] duration-150 ease-out focus:border-accent placeholder:text-muted"
            />
            {saved === "1" && (
              <p role="status" className="text-sm text-secondary">
                Saved — the home page now shows this lifter.
              </p>
            )}
            <button
              type="submit"
              className="self-start rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity duration-150 ease-out hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:opacity-70"
            >
              Save
            </button>
          </form>
          {username && (
            <a
              href={`https://www.openpowerlifting.org/u/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm text-secondary underline underline-offset-2 transition-colors duration-150 ease-out hover:text-foreground"
            >
              View profile on openpowerlifting.org
            </a>
          )}
        </section>
      ) : (
        <Notice title="Database not connected">
          Settings are stored in the database. Connect Supabase and set
          DATABASE_URL, then run npm run db:push.
        </Notice>
      )}

      <section className="rounded-xl border border-hairline bg-surface p-5">
        <h2 className="font-medium">Warm-ups</h2>
        <p className="mt-1 text-sm text-secondary">
          Add, remove and tweak the exercises in your six-phase warm-up. The
          warm-up pages themselves stay clean — just the tickable version.
        </p>
        <Link
          href="/settings/warmups"
          className="mt-4 inline-block rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity duration-150 ease-out hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Edit warm-ups
        </Link>
      </section>

      <section className="rounded-xl border border-hairline bg-surface p-5">
        <h2 className="font-medium">Rehab</h2>
        <p className="mt-1 text-sm text-secondary">
          Add, remove and tweak your rehab work per lift. The rehab pages stay
          clean — just the tickable version.
        </p>
        <Link
          href="/settings/rehab"
          className="mt-4 inline-block rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity duration-150 ease-out hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Edit rehab
        </Link>
      </section>
    </div>
  );
}
