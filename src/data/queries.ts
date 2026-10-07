// React Query hooks over api.ts. Writes are optimistic: the screen updates
// straight away, and if the phone is offline the write waits and is sent
// when the connection comes back (even after an app restart).
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { LIFTS, type Lift } from "@/lib/lifts";
import { useSession } from "@/lib/auth";
import { fetchOplRecord } from "@/lib/opl";
import { supabase } from "@/lib/supabase";
import type { WarmupSection, WarmupStep } from "@/lib/warmup";
import { sectionsFromTemplate } from "@/lib/warmupTemplates";
import * as api from "./api";
import type { Cue, CueLift, DailyEntry } from "./api";

const DAY = 24 * 60 * 60 * 1000;

// Nothing to fetch until Supabase is configured and someone is signed in;
// the database returns nothing to signed-out visitors anyway
function useSignedIn() {
  const session = useSession();
  return supabase !== null && !!session;
}

export const keys = {
  warmups: (lift: Lift) => ["warmups", lift] as const,
  rehab: (lift: Lift) => ["rehab", lift] as const,
  cues: (lift: CueLift) => ["cues", lift] as const,
  weights: ["weights"] as const,
  calories: ["calories"] as const,
  settings: ["settings"] as const,
  opl: (username: string) => ["opl", username] as const,
};

export const useWarmup = (lift: Lift) =>
  useQuery({ queryKey: keys.warmups(lift), queryFn: () => api.fetchWarmup(lift), enabled: useSignedIn() });

export const useRehab = (lift: Lift) =>
  useQuery({ queryKey: keys.rehab(lift), queryFn: () => api.fetchRehab(lift), enabled: useSignedIn() });

export const useCues = (lift: CueLift) =>
  useQuery({ queryKey: keys.cues(lift), queryFn: () => api.fetchCues(lift), enabled: useSignedIn() });

export const useWeights = () =>
  useQuery({ queryKey: keys.weights, queryFn: api.fetchWeights, enabled: useSignedIn() });

export const useCalories = () =>
  useQuery({ queryKey: keys.calories, queryFn: api.fetchCalories, enabled: useSignedIn() });

export const useSettings = () =>
  useQuery({ queryKey: keys.settings, queryFn: api.fetchSettings, enabled: useSignedIn() });

export const useOplRecord = (username: string | undefined) =>
  useQuery({
    queryKey: keys.opl(username ?? ""),
    queryFn: () => fetchOplRecord(username!),
    enabled: !!username,
    staleTime: DAY,
    retry: 1,
  });

// Mutations are looked up by key, so their behaviour lives in
// registerMutations() and these hooks only carry the types
export const useSaveWarmup = () =>
  useMutation<void, Error, { lift: Lift; sections: WarmupSection[] }>({
    mutationKey: ["warmups", "save"],
  });
export const useSaveRehab = () =>
  useMutation<void, Error, { lift: Lift; steps: WarmupStep[] }>({
    mutationKey: ["rehab", "save"],
  });
export const useAddCue = () =>
  useMutation<void, Error, { lift: CueLift; text: string }>({
    mutationKey: ["cues", "add"],
  });
export const useUpdateCue = () =>
  useMutation<void, Error, { lift: CueLift; id: number; text: string }>({
    mutationKey: ["cues", "update"],
  });
export const useDeleteCue = () =>
  useMutation<void, Error, { lift: CueLift; id: number }>({
    mutationKey: ["cues", "delete"],
  });
export const useSaveWeight = () =>
  useMutation<void, Error, DailyEntry>({ mutationKey: ["weights", "save"] });
export const useDeleteWeight = () =>
  useMutation<void, Error, { date: string }>({ mutationKey: ["weights", "delete"] });
export const useSaveCalories = () =>
  useMutation<void, Error, DailyEntry>({ mutationKey: ["calories", "save"] });
export const useDeleteCalories = () =>
  useMutation<void, Error, { date: string }>({ mutationKey: ["calories", "delete"] });
export const useSaveSettings = () =>
  useMutation<void, Error, Record<string, string>>({
    mutationKey: ["settings", "save"],
  });

const upsertEntry = (entries: DailyEntry[] = [], entry: DailyEntry) =>
  [...entries.filter((e) => e.date !== entry.date), entry].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

// Registered before the cache is restored, so queued offline writes can resume
export function registerMutations(qc: QueryClient) {
  function define<TVars>(
    mutationKey: [string, string],
    mutationFn: (vars: TVars) => Promise<unknown>,
    queryKey: (vars: TVars) => QueryKey,
    optimistic: (vars: TVars) => void
  ) {
    const [area] = mutationKey;
    qc.setMutationDefaults(mutationKey, {
      mutationFn,
      // One write at a time per area, in the order they were made
      scope: { id: area },
      onMutate: async (vars: TVars) => {
        await qc.cancelQueries({ queryKey: queryKey(vars) });
        optimistic(vars);
      },
      // Once the last queued write for this area lands, reload the truth
      onSettled: (_data: unknown, _error: unknown, vars: TVars) => {
        if (qc.isMutating({ mutationKey: [area] }) <= 1) {
          void qc.invalidateQueries({ queryKey: queryKey(vars) });
        }
      },
    });
  }

  define(
    ["warmups", "save"],
    api.saveWarmup,
    (v) => keys.warmups(v.lift),
    (v) => qc.setQueryData<WarmupSection[]>(keys.warmups(v.lift), v.sections)
  );

  define(
    ["rehab", "save"],
    api.saveRehab,
    (v) => keys.rehab(v.lift),
    (v) => qc.setQueryData<WarmupStep[]>(keys.rehab(v.lift), v.steps)
  );

  define(
    ["cues", "add"],
    api.addCue,
    (v) => keys.cues(v.lift),
    (v) =>
      qc.setQueryData<Cue[]>(keys.cues(v.lift), (prev = []) => [
        ...prev,
        // Negative id marks a cue the server hasn't assigned an id to yet
        { id: -Date.now(), lift: v.lift, text: v.text, position: 0 },
      ])
  );

  define<{ lift: CueLift; id: number; text: string }>(
    ["cues", "update"],
    api.updateCue,
    (v) => keys.cues(v.lift),
    (v) =>
      qc.setQueryData<Cue[]>(keys.cues(v.lift), (prev = []) =>
        prev.map((c) => (c.id === v.id ? { ...c, text: v.text } : c))
      )
  );

  define<{ lift: CueLift; id: number }>(
    ["cues", "delete"],
    api.deleteCue,
    (v) => keys.cues(v.lift),
    (v) =>
      qc.setQueryData<Cue[]>(keys.cues(v.lift), (prev = []) =>
        prev.filter((c) => c.id !== v.id)
      )
  );

  define(
    ["weights", "save"],
    api.saveWeight,
    () => keys.weights,
    (v) => qc.setQueryData<DailyEntry[]>(keys.weights, (prev) => upsertEntry(prev, v))
  );

  define(
    ["weights", "delete"],
    api.deleteWeight,
    () => keys.weights,
    (v) =>
      qc.setQueryData<DailyEntry[]>(keys.weights, (prev = []) =>
        prev.filter((e) => e.date !== v.date)
      )
  );

  define(
    ["calories", "save"],
    api.saveCalories,
    () => keys.calories,
    (v) => qc.setQueryData<DailyEntry[]>(keys.calories, (prev) => upsertEntry(prev, v))
  );

  define(
    ["calories", "delete"],
    api.deleteCalories,
    () => keys.calories,
    (v) =>
      qc.setQueryData<DailyEntry[]>(keys.calories, (prev = []) =>
        prev.filter((e) => e.date !== v.date)
      )
  );

  define(
    ["settings", "save"],
    api.saveSettings,
    () => keys.settings,
    (v) =>
      qc.setQueryData<Record<string, string>>(keys.settings, (prev) => ({
        ...prev,
        ...v,
      }))
  );
}

// Edits to one lift's warm-up. Each change is computed from the latest cached
// sections (not a render's copy) and saved as the lift's whole warm-up.
export function useWarmupActions(lift: Lift) {
  const qc = useQueryClient();
  const save = useSaveWarmup();
  const latest = () =>
    qc.getQueryData<WarmupSection[]>(keys.warmups(lift)) ?? [];

  const update = (fn: (sections: WarmupSection[]) => WarmupSection[]) =>
    save.mutate({ lift, sections: fn(latest()) });

  // Optionally also starts any other lift that has no warm-up yet
  const applyTemplate = async (templateId: string, allLifts: boolean) => {
    save.mutate({ lift, sections: sectionsFromTemplate(templateId) });
    if (!allLifts) return;
    for (const other of LIFTS.filter((l) => l !== lift)) {
      try {
        const existing = await qc.ensureQueryData({
          queryKey: keys.warmups(other),
          queryFn: () => api.fetchWarmup(other),
        });
        if (existing.length === 0) {
          save.mutate({ lift: other, sections: sectionsFromTemplate(templateId) });
        }
      } catch {
        // Couldn't check that lift (e.g. offline); leave it to be set up later
      }
    }
  };

  return { update, applyTemplate };
}
