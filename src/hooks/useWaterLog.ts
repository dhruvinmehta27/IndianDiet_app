import { useCallback, useMemo } from "react";
import { usePersistentState } from "./usePersistentState";

export interface WaterEntry {
  id: string;
  ml: number;
  at: number; // epoch ms
}

function isToday(ms: number): boolean {
  const d = new Date(ms);
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}

export interface WaterLog {
  entries: WaterEntry[];
  todayEntries: WaterEntry[];
  todayMl: number;
  /** User goal override in ml; null → use the calculator's recommendation. */
  goalOverrideMl: number | null;
  addWater: (ml: number) => void;
  undoLast: () => void;
  clearToday: () => void;
  setGoalOverride: (ml: number | null) => void;
}

/** Per-day water-intake tracker, persisted to localStorage. */
export function useWaterLog(): WaterLog {
  const [entries, setEntries] = usePersistentState<WaterEntry[]>("dmc-water-log", []);
  const [goalOverrideMl, setGoalOverrideMl] = usePersistentState<number | null>("dmc-water-goal", null);

  const addWater = useCallback(
    (ml: number) =>
      setEntries((prev) => [
        { id: `w_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`, ml, at: Date.now() },
        ...prev,
      ]),
    [setEntries],
  );

  const undoLast = useCallback(
    () =>
      setEntries((prev) => {
        const idx = prev.findIndex((e) => isToday(e.at));
        if (idx === -1) return prev;
        const copy = [...prev];
        copy.splice(idx, 1);
        return copy;
      }),
    [setEntries],
  );

  const clearToday = useCallback(
    () => setEntries((prev) => prev.filter((e) => !isToday(e.at))),
    [setEntries],
  );

  const todayEntries = useMemo(() => entries.filter((e) => isToday(e.at)), [entries]);
  const todayMl = useMemo(() => todayEntries.reduce((s, e) => s + e.ml, 0), [todayEntries]);

  return {
    entries,
    todayEntries,
    todayMl,
    goalOverrideMl,
    addWater,
    undoLast,
    clearToday,
    setGoalOverride: setGoalOverrideMl,
  };
}
