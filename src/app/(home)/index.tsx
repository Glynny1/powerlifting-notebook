import { useRouter } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Loadable } from "@/components/Loadable";
import RequireLogin from "@/components/RequireLogin";
import { Card, Divider, Label, Notice, Screen, styles as ui, Txt } from "@/components/ui";
import { useOplRecord, useSettings } from "@/data/queries";
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
import { useRefresh } from "@/lib/navigation";
import { OPL_USERNAME_KEY, type OplMeet, type OplRecord } from "@/lib/opl";
import { useColors } from "@/lib/theme";

function CountdownCard({ meetDate }: { meetDate: string }) {
  const router = useRouter();
  const countdown = meetCountdown(todayIso(), meetDate);

  if (!countdown) {
    return (
      <Notice
        title="Your meet date has passed"
        action={{ label: "Set the next one", onPress: () => router.push("/settings") }}
      >
        Hope it went well! Put the next meet in Settings and the countdown
        starts again.
      </Notice>
    );
  }

  return (
    <Card>
      <Label>Next meet</Label>
      <Txt style={styles.countdown}>{formatCountdown(countdown)}</Txt>
      <Txt tone="secondary" style={ui.small}>
        {formatDate(meetDate)}
      </Txt>
    </Card>
  );
}

function AttemptPlanner({ maxes }: { maxes: Record<Lift, number | null> }) {
  const planned = LIFTS.filter((l) => maxes[l] !== null);
  if (planned.length === 0) return null;

  const total = LIFTS.every((l) => maxes[l] !== null)
    ? LIFTS.reduce((sum, l) => sum + planAttempts(maxes[l]!).third, 0)
    : null;

  return (
    <Card>
      <Label>Attempt planner</Label>
      <View style={[styles.planRow, styles.planHead]}>
        <Txt tone="muted" style={[ui.tiny, styles.planLift]}>
          Lift
        </Txt>
        {["1st", "2nd", "3rd"].map((h) => (
          <Txt key={h} tone="muted" style={[ui.tiny, styles.planCell]}>
            {h}
          </Txt>
        ))}
      </View>
      {planned.map((lift) => {
        const plan = planAttempts(maxes[lift]!);
        return (
          <View key={lift}>
            <Divider />
            <View
              style={styles.planRow}
              accessible
              accessibilityLabel={`${liftLabel(lift)}, max ${formatKg(maxes[lift])}: openers ${formatKg(plan.first)}, ${formatKg(plan.second)}, ${formatKg(plan.third)} kilos`}
            >
              <Txt style={styles.planLift}>
                <Txt style={styles.bold}>{liftLabel(lift)}</Txt>
                <Txt tone="muted" style={ui.tiny}>
                  {"  "}max {formatKg(maxes[lift])}
                </Txt>
              </Txt>
              <Txt tone="secondary" style={[styles.planCell, ui.tabular]}>
                {formatKg(plan.first)}
              </Txt>
              <Txt tone="secondary" style={[styles.planCell, ui.tabular]}>
                {formatKg(plan.second)}
              </Txt>
              <Txt style={[styles.planCell, styles.bold, ui.tabular]}>
                {formatKg(plan.third)}
              </Txt>
            </View>
          </View>
        );
      })}
      {total !== null && (
        <>
          <Divider />
          <Txt tone="secondary" style={[ui.small, styles.planTotal]}>
            All thirds in:{" "}
            <Txt style={[styles.bold, ui.tabular]}>{formatKg(total)} kg</Txt>{" "}
            total
          </Txt>
        </>
      )}
      <Txt tone="muted" style={[ui.tiny, styles.planNote]}>
        1st ≈91% · 2nd ≈97% · 3rd ≈101% of gym max, rounded to 2.5 kg.
      </Txt>
    </Card>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card style={styles.tile}>
      <Label>{label}</Label>
      <Txt style={styles.tileValue}>
        {value}
        {value !== "-" && (
          <Txt tone="muted" style={ui.small}>
            {" "}kg
          </Txt>
        )}
      </Txt>
    </Card>
  );
}

function MeetCard({ meet }: { meet: OplMeet }) {
  return (
    <Card>
      <View style={styles.meetHead}>
        <Txt style={[styles.bold, styles.grow]}>{meet.meetName}</Txt>
        {meet.place ? (
          <Txt tone="accent" style={[ui.small, styles.bold]}>
            {formatPlace(meet.place)}
          </Txt>
        ) : null}
      </View>
      <Txt tone="secondary" style={ui.small}>
        {formatDate(meet.date)} · {meet.federation}
        {meet.weightClassKg ? ` · ${meet.weightClassKg} kg class` : ""}
      </Txt>
      <Divider style={styles.meetDivider} />
      <View style={styles.meetLifts}>
        {(
          [
            ["S", meet.squat],
            ["B", meet.bench],
            ["D", meet.deadlift],
            ["Total", meet.total],
          ] as const
        ).map(([label, value]) => (
          <View key={label} style={styles.meetLift}>
            <Txt tone="muted" style={ui.tiny}>
              {label}
            </Txt>
            <Txt style={[styles.bold, ui.tabular]}>{formatKg(value)}</Txt>
          </View>
        ))}
      </View>
    </Card>
  );
}

function Record({ record }: { record: OplRecord }) {
  const { stats, meets } = record;
  return (
    <>
      <Card>
        <Label>Best total</Label>
        <Txt style={styles.bestTotal}>
          {formatKg(stats.bestTotal)}
          {stats.bestTotal !== null && (
            <Txt tone="muted" style={styles.bestTotalUnit}>
              {" "}kg
            </Txt>
          )}
        </Txt>
        <Txt tone="secondary" style={ui.small}>
          {stats.bestDots !== null && `${stats.bestDots.toFixed(1)} Dots · `}
          {stats.meetCount} {stats.meetCount === 1 ? "meet" : "meets"} on record
        </Txt>
      </Card>
      <View style={styles.tiles}>
        <StatTile label="Squat" value={formatKg(stats.bestSquat)} />
        <StatTile label="Bench" value={formatKg(stats.bestBench)} />
        <StatTile label="Deadlift" value={formatKg(stats.bestDeadlift)} />
      </View>
      <Label style={styles.sectionLabel}>Meet history</Label>
      {meets.map((meet, i) => (
        // OpenPowerlifting can list one meet twice (e.g. two divisions)
        <MeetCard key={`${meet.date}-${meet.meetName}-${i}`} meet={meet} />
      ))}
    </>
  );
}

function OplSection({ username }: { username: string | undefined }) {
  const router = useRouter();
  const c = useColors();
  const opl = useOplRecord(username);

  if (!username) {
    return (
      <Notice
        title="Link your OpenPowerlifting profile"
        action={{ label: "Open Settings", onPress: () => router.push("/settings") }}
      >
        Add your OpenPowerlifting username in Settings and your competition
        record will show up here.
      </Notice>
    );
  }
  if (opl.data) return <Record record={opl.data} />;
  if (opl.isError) {
    return (
      <Notice title="Couldn't load your OpenPowerlifting record">
        {opl.error.message}
      </Notice>
    );
  }
  if (opl.isPaused) {
    return (
      <Notice title="You're offline">
        Your competition record will load once you&apos;re back online.
      </Notice>
    );
  }
  return <ActivityIndicator color={c.muted} />;
}

export default function HomeScreen() {
  const settings = useSettings();
  const username = settings.data?.[OPL_USERNAME_KEY] || undefined;
  const opl = useOplRecord(username);
  const { refreshing, onRefresh } = useRefresh(settings.refetch, opl.refetch);

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <RequireLogin
        title="Welcome to Powerlifting Notebook"
        message="Log in or create an account to start your notebook. Your meet prep, warm-ups, cues, rehab and bodyweight log will all live here."
      >
        <Loadable query={settings}>
          {(values) => {
            const meetDate = values[MEET_DATE_KEY] || null;
            const maxes = Object.fromEntries(
              LIFTS.map((l) => [l, parseMaxKg(values[MAX_KEYS[l]] ?? null)])
            ) as Record<Lift, number | null>;
            return (
              <>
                {meetDate && <CountdownCard meetDate={meetDate} />}
                <AttemptPlanner maxes={maxes} />
                <OplSection username={username} />
              </>
            );
          }}
        </Loadable>
      </RequireLogin>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bold: { fontWeight: "600" },
  grow: { flex: 1 },
  countdown: { fontSize: 30, lineHeight: 36, fontWeight: "600", marginTop: 4 },
  planHead: { marginTop: 10, paddingBottom: 6 },
  planRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  planLift: { flex: 1 },
  planCell: { width: 56, textAlign: "right" },
  planTotal: { marginTop: 8 },
  planNote: { marginTop: 8 },
  tiles: { flexDirection: "row", gap: 12 },
  tile: { flex: 1, paddingHorizontal: 12, paddingVertical: 12 },
  tileValue: { fontSize: 22, lineHeight: 28, fontWeight: "600", marginTop: 4 },
  bestTotal: { fontSize: 44, lineHeight: 52, fontWeight: "600", marginTop: 4 },
  bestTotalUnit: { fontSize: 18 },
  sectionLabel: { marginTop: 8 },
  meetHead: { flexDirection: "row", alignItems: "baseline", gap: 12 },
  meetDivider: { marginVertical: 12 },
  meetLifts: { flexDirection: "row" },
  meetLift: { flex: 1, alignItems: "center", gap: 2 },
});
