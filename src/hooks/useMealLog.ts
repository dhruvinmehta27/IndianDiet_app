import { useCallback, useMemo } from "react";
import { usePersistentState } from "./usePersistentState";
import { EMPTY_NUTRITION, type Nutrition } from "@/lib/foodAnalysis";

/**
 * A single logged meal. Doubles as the History record and the source of the
 * daily intake totals. We keep BOTH the AI estimate and any user correction so
 * future analytics / learning can compare them (per the brief).
 */
export interface MealLogEntry {
  id: string;
  name: string;
  thumbnail?: string; // small data URL
  createdAt: number; // epoch ms
  grams: number;
  /** What counts toward intake (user-corrected values if edited). */
  nutrition: Nutrition;
  /** The original AI estimate, retained even after correction. */
  aiNutrition: Nutrition;
  corrected: boolean;
  confidence: number;
  provider: string;
}

function isSameDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function sumNutrition(entries: MealLogEntry[]): Nutrition {
  return entries.reduce<Nutrition>(
    (acc, e) => ({
      calories: acc.calories + e.nutrition.calories,
      protein: acc.protein + e.nutrition.protein,
      carbs: acc.carbs + e.nutrition.carbs,
      fat: acc.fat + e.nutrition.fat,
      fiber: acc.fiber + e.nutrition.fiber,
      sugar: acc.sugar + e.nutrition.sugar,
      sodium: acc.sodium + e.nutrition.sodium,
      potassium: acc.potassium + e.nutrition.potassium,
    }),
    { ...EMPTY_NUTRITION },
  );
}

export interface MealLog {
  entries: MealLogEntry[];
  todaysEntries: MealLogEntry[];
  consumedToday: Nutrition;
  addEntry: (entry: MealLogEntry) => void;
  removeEntry: (id: string) => void;
  /** Re-log a past meal as a new entry timestamped now. */
  reuseEntry: (id: string) => void;
  clearToday: () => void;
}

/** Central store for logged meals — shared by the scanner, dashboard & history. */
export function useMealLog(): MealLog {
  const [entries, setEntries] = usePersistentState<MealLogEntry[]>("dmc-meal-log", []);

  const addEntry = useCallback(
    (entry: MealLogEntry) => setEntries((prev) => [entry, ...prev]),
    [setEntries],
  );

  const removeEntry = useCallback(
    (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id)),
    [setEntries],
  );

  const reuseEntry = useCallback(
    (id: string) =>
      setEntries((prev) => {
        const src = prev.find((e) => e.id === id);
        if (!src) return prev;
        const copy: MealLogEntry = {
          ...src,
          id: `meal_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
          createdAt: Date.now(),
        };
        return [copy, ...prev];
      }),
    [setEntries],
  );

  const clearToday = useCallback(
    () => setEntries((prev) => prev.filter((e) => !isSameDay(e.createdAt, Date.now()))),
    [setEntries],
  );

  const todaysEntries = useMemo(
    () => entries.filter((e) => isSameDay(e.createdAt, Date.now())),
    [entries],
  );

  const consumedToday = useMemo(() => sumNutrition(todaysEntries), [todaysEntries]);

  return { entries, todaysEntries, consumedToday, addEntry, removeEntry, reuseEntry, clearToday };
}
