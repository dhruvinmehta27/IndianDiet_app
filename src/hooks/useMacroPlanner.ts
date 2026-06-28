import { useCallback, useMemo, useState } from "react";
import {
  type MacroKey,
  type MacroLocks,
  type MacroValues,
  type NutritionResult,
  type UserProfile,
  calculateHealth,
  calculateMacros,
  getGoal,
  rebalanceMacros,
  type HealthIndicators,
} from "@/lib/nutrition";

/** Sensible starting profile — mirrors the male worked example in the brief. */
export const DEFAULT_PROFILE: UserProfile = {
  age: 37,
  gender: "male",
  heightCm: 178,
  currentWeightKg: 80,
  targetWeightKg: 72,
  ethnicity: "south-asian",
  activity: "moderate",
  goal: "lose-fat",
  diet: "omnivore",
  weeklyTargetKg: -0.5,
  bodyFatPercent: undefined,
  proteinBasis: "bodyweight",
};

const NO_LOCKS: MacroLocks = {
  calories: false,
  protein: false,
  fat: false,
  carbs: false,
  fiber: false,
};

export interface MacroPlanner {
  profile: UserProfile;
  macros: MacroValues;
  locks: MacroLocks;
  result: NutritionResult;
  health: HealthIndicators;
  /** True when the editable macros still equal the engine baseline. */
  isPristine: boolean;
  updateProfile: (patch: Partial<UserProfile>) => void;
  setMacro: (key: MacroKey, value: number) => void;
  toggleLock: (key: MacroKey) => void;
  resetMacros: () => void;
}

/**
 * Central state for the whole planner. There is exactly one of these; every
 * panel reads from it. Energy/health figures derive live from the profile,
 * while the macro split is editable (and kept balanced) on top of the
 * engine's baseline.
 */
export function useMacroPlanner(
  initial: UserProfile = DEFAULT_PROFILE,
): MacroPlanner {
  const [profile, setProfile] = useState<UserProfile>(initial);
  const [locks, setLocks] = useState<MacroLocks>(NO_LOCKS);

  // The engine baseline for the current profile (always balanced).
  const result = useMemo(() => calculateMacros(profile), [profile]);

  // Editable macro split. Seeded from the baseline; diverges on manual edits.
  const [macros, setMacros] = useState<MacroValues>(result.macros);
  // Track which baseline the editable macros were seeded from, so a profile
  // change re-seeds them without an effect/extra render.
  const [seededFrom, setSeededFrom] = useState<MacroValues>(result.macros);

  if (seededFrom !== result.macros) {
    // Profile changed → re-derive the plan. Manual edits are intentionally
    // reset to the fresh, science-based baseline; lock toggles are preserved.
    setSeededFrom(result.macros);
    setMacros(result.macros);
  }

  const health = useMemo(
    () => calculateHealth(profile, macros.protein),
    [profile, macros.protein],
  );

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setProfile((p) => {
      const next = { ...p, ...patch };
      // Selecting a goal nudges the weekly target to that goal's default,
      // unless the user is explicitly changing the weekly target itself.
      if (patch.goal && patch.weeklyTargetKg === undefined) {
        next.weeklyTargetKg = getGoal(patch.goal).defaultWeekly;
      }
      return next;
    });
  }, []);

  const setMacro = useCallback(
    (key: MacroKey, value: number) => {
      setMacros((m) => rebalanceMacros(m, locks, key, value));
    },
    [locks],
  );

  const toggleLock = useCallback((key: MacroKey) => {
    setLocks((l) => ({ ...l, [key]: !l[key] }));
  }, []);

  const resetMacros = useCallback(() => {
    setMacros(result.macros);
    setSeededFrom(result.macros);
    setLocks(NO_LOCKS);
  }, [result.macros]);

  const isPristine = useMemo(
    () =>
      (Object.keys(macros) as MacroKey[]).every(
        (k) => macros[k] === result.macros[k],
      ),
    [macros, result.macros],
  );

  return {
    profile,
    macros,
    locks,
    result,
    health,
    isPristine,
    updateProfile,
    setMacro,
    toggleLock,
    resetMacros,
  };
}
