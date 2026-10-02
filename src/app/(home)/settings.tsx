import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Keyboard, Pressable, StyleSheet, View } from "react-native";
import DateField from "@/components/DateField";
import { Loadable } from "@/components/Loadable";
import { Button, Card, Field, Screen, styles as ui, Txt } from "@/components/ui";
import { useSaveSettings, useSettings } from "@/data/queries";
import { LIFTS, liftLabel } from "@/lib/lifts";
import { MAX_KEYS, MEET_DATE_KEY, parseMaxKg } from "@/lib/meet";
import { OPL_USERNAME_KEY, oplProfileUrl, parseOplUsername } from "@/lib/opl";

function MeetPrep({ initial }: { initial: Record<string, string> }) {
  const save = useSaveSettings();
  const [meetDate, setMeetDate] = useState(initial[MEET_DATE_KEY] ?? "");
  const [maxes, setMaxes] = useState(() =>
    Object.fromEntries(LIFTS.map((l) => [l, initial[MAX_KEYS[l]] ?? ""]))
  );
  const [saved, setSaved] = useState(false);

  const submit = () => {
    const values: Record<string, string> = {
      [MEET_DATE_KEY]: /^\d{4}-\d{2}-\d{2}$/.test(meetDate) ? meetDate : "",
    };
    for (const lift of LIFTS) {
      const parsed = parseMaxKg(maxes[lift].replace(",", ".").trim());
      values[MAX_KEYS[lift]] = parsed === null ? "" : String(parsed);
    }
    save.mutate(values);
    setSaved(true);
    Keyboard.dismiss();
  };

  return (
    <Card style={styles.card}>
      <Txt style={styles.heading} accessibilityRole="header">
        Meet prep
      </Txt>
      <Txt tone="secondary" style={ui.small}>
        Your next meet date drives the home page countdown; your current gym
        maxes drive the attempt planner.
      </Txt>
      <View style={styles.field}>
        <Txt tone="secondary" style={ui.small}>
          Next meet date
        </Txt>
        <View style={styles.dateRow}>
          <DateField
            value={meetDate}
            onChange={(d) => {
              setMeetDate(d);
              setSaved(false);
            }}
            placeholder="Not set"
            accessibilityLabel="Next meet date"
          />
          {meetDate !== "" && (
            <Pressable
              onPress={() => {
                setMeetDate("");
                setSaved(false);
              }}
              accessibilityRole="button"
              hitSlop={8}
            >
              <Txt tone="secondary" style={[ui.small, styles.link]}>
                Clear
              </Txt>
            </Pressable>
          )}
        </View>
      </View>
      <View style={styles.maxes}>
        {LIFTS.map((lift) => (
          <View key={lift} style={[styles.field, styles.grow]}>
            <Txt tone="secondary" style={ui.small}>
              {liftLabel(lift)} max
            </Txt>
            <Field
              value={maxes[lift]}
              onChangeText={(v) => {
                setMaxes((prev) => ({ ...prev, [lift]: v }));
                setSaved(false);
              }}
              placeholder="kg"
              keyboardType="decimal-pad"
              accessibilityLabel={`${liftLabel(lift)} max in kilos`}
              style={ui.tabular}
            />
          </View>
        ))}
      </View>
      {saved && (
        <Txt tone="secondary" style={ui.small} accessibilityLiveRegion="polite">
          Saved — the home page is up to date.
        </Txt>
      )}
      <Button title="Save" onPress={submit} style={styles.save} />
    </Card>
  );
}

function OplProfile({ initial }: { initial: string }) {
  const save = useSaveSettings();
  const [input, setInput] = useState(initial);
  const [username, setUsername] = useState(initial);
  const [saved, setSaved] = useState(false);

  const submit = () => {
    const parsed = parseOplUsername(input);
    save.mutate({ [OPL_USERNAME_KEY]: parsed });
    setInput(parsed);
    setUsername(parsed);
    setSaved(true);
    Keyboard.dismiss();
  };

  return (
    <Card style={styles.card}>
      <Txt style={styles.heading} accessibilityRole="header">
        OpenPowerlifting profile
      </Txt>
      <Txt tone="secondary" style={ui.small}>
        Paste your profile URL or just the username — the part after
        openpowerlifting.org/u/.
      </Txt>
      <Field
        value={input}
        onChangeText={(v) => {
          setInput(v);
          setSaved(false);
        }}
        placeholder="e.g. openpowerlifting.org/u/johnhaack"
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel="OpenPowerlifting username or profile URL"
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      {saved && (
        <Txt tone="secondary" style={ui.small} accessibilityLiveRegion="polite">
          Saved — the home page now shows this lifter.
        </Txt>
      )}
      <View style={styles.dateRow}>
        <Button title="Save" onPress={submit} />
        {username !== "" && (
          <Pressable
            onPress={() => void WebBrowser.openBrowserAsync(oplProfileUrl(username))}
            accessibilityRole="link"
            hitSlop={8}
          >
            <Txt tone="secondary" style={[ui.small, styles.link]}>
              View on openpowerlifting.org
            </Txt>
          </Pressable>
        )}
      </View>
    </Card>
  );
}

export default function SettingsScreen() {
  const settings = useSettings();
  return (
    <Screen>
      <Loadable query={settings}>
        {(values) => (
          <>
            <MeetPrep initial={values} />
            <OplProfile initial={values[OPL_USERNAME_KEY] ?? ""} />
          </>
        )}
      </Loadable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  heading: { fontWeight: "600" },
  field: { gap: 4 },
  grow: { flex: 1 },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  maxes: { flexDirection: "row", gap: 8 },
  link: { textDecorationLine: "underline" },
  save: { alignSelf: "flex-start" },
});
