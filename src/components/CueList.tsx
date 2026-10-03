import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import type { Cue } from "@/data/api";
import { confirmDestructive } from "@/lib/confirm";
import { useColors } from "@/lib/theme";
import { Button, Card, Divider, Field, IconButton, Label, styles as ui, Txt } from "./ui";

function CueItem({
  cue,
  onUpdate,
  onDelete,
}: {
  cue: Cue;
  onUpdate: (text: string) => void;
  onDelete: () => void;
}) {
  const c = useColors();
  const [draft, setDraft] = useState<string | null>(null);
  // A cue added offline has no server id yet, so it can't be edited until it syncs
  const pending = cue.id < 0;

  if (draft !== null) {
    const save = () => {
      if (draft.trim()) onUpdate(draft.trim());
      setDraft(null);
    };
    return (
      <View style={styles.editRow}>
        <Field
          value={draft}
          onChangeText={setDraft}
          autoFocus
          accessibilityLabel="Edit cue"
          returnKeyType="done"
          onSubmitEditing={save}
          style={styles.grow}
        />
        <Button title="Save" onPress={save} />
        <Button title="Cancel" variant="ghost" onPress={() => setDraft(null)} />
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Txt style={styles.grow}>“{cue.text}”</Txt>
      {pending ? (
        <Ionicons
          name="cloud-upload-outline"
          size={18}
          color={c.muted}
          accessibilityLabel="Waiting to sync"
        />
      ) : (
        <>
          <IconButton
            accessibilityLabel={`Edit cue: ${cue.text}`}
            onPress={() => setDraft(cue.text)}
          >
            <Ionicons name="pencil" size={18} color={c.muted} />
          </IconButton>
          <IconButton
            accessibilityLabel={`Delete cue: ${cue.text}`}
            onPress={() =>
              confirmDestructive(`Delete “${cue.text}”?`, "Delete", onDelete)
            }
          >
            <Ionicons name="trash-outline" size={18} color={c.muted} />
          </IconButton>
        </>
      )}
    </View>
  );
}

export default function CueList({
  label,
  cues,
  placeholder,
  onAdd,
  onUpdate,
  onDelete,
}: {
  label: string;
  cues: Cue[];
  placeholder: string;
  onAdd: (text: string) => void;
  onUpdate: (id: number, text: string) => void;
  onDelete: (id: number) => void;
}) {
  const [text, setText] = useState("");
  const add = () => {
    if (!text.trim()) return;
    onAdd(text.trim());
    setText("");
  };

  return (
    <Card>
      <Label>{label} cues</Label>
      {cues.length > 0 ? (
        <View style={styles.list}>
          {cues.map((cue) => (
            <CueItem
              key={cue.id}
              cue={cue}
              onUpdate={(t) => onUpdate(cue.id, t)}
              onDelete={() => onDelete(cue.id)}
            />
          ))}
        </View>
      ) : (
        <Txt tone="muted" style={[ui.small, styles.empty]}>
          Nothing here yet. Add the words that fix your {label.toLowerCase()}.
        </Txt>
      )}
      <Divider style={styles.divider} />
      <View style={styles.editRow}>
        <Field
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          accessibilityLabel={`Add ${label} cue`}
          returnKeyType="done"
          onSubmitEditing={add}
          style={styles.grow}
        />
        <Button title="Add" variant="ghost" onPress={add} disabled={!text.trim()} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: 8 },
  empty: { marginTop: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 4, minHeight: 44 },
  editRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  grow: { flex: 1 },
  divider: { marginVertical: 12 },
});
