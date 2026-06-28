/**
 * The single nutrition calculation engine.
 *
 * Every component derives its numbers from this module — there is exactly one
 * implementation of each formula. UI code must never re-implement a calculation.
 */

import { clamp, round } from "../utils";
import {
  ACTIVITY_LEVELS,
  FAT_FLOOR_G,
  FIBER_PER_1000_KCAL,
  GOALS,
  KCAL_PER_GRAM,
  KCAL_PER_KG,
  MIN_CALORIES_FEMALE,
  MIN_CALORIES_MALE,
} from "./constants";
import type {
  ActivityId,
  EnergyBreakdown,
  GoalId,
  MacroValues,
  NutritionResult,
  UserProfile,
} from "./types";

/** Look up an activity multiplier, defaulting to moderate if unknown. */
export function activityMultiplier(id: ActivityId): number {
  return ACTIVITY_LEVELS.find((a) => a.id === id)?.multiplier ?? 1.55;
}

export function getGoal(id: GoalId) {
  return GOALS.find((g) => g.id === id) ?? GOALS[0];
}

/**
 * Step 1 — Basal Metabolic Rate via Mifflin-St Jeor (the accepted standard).
 *   Male:   10·w + 6.25·h − 5·age + 5
 *   Female: 10·w + 6.25·h − 5·age − 161
 */
export function calculateBMR(profile: UserProfile): number {
  const { gender, currentWeightKg: w, heightCm: h, age } = profile;
  const base = 10 * w + 6.25 * h - 5 * age;
  return base + (gender === "male" ? 5 : -161);
}

/** Step 2 — Total Daily Energy Expenditure (maintenance calories). */
export function calculateTDEE(profile: UserProfile): number {
  return calculateBMR(profile) * activityMultiplier(profile.activity);
}

/**
 * Step 3 — Energy balance for the chosen goal & weekly target.
 *
 * The weekly bodyweight-change target is the source of truth for the calorie
 * delta (kg/week · 7700 ÷ 7), which keeps the deficit/surplus scientifically
 * consistent with the user's stated rate. A safety floor prevents unsafely low
 * intakes. Result is the goal (target) calories.
 */
export function calculateEnergy(profile: UserProfile): EnergyBreakdown {
  const bmr = calculateBMR(profile);
  const multiplier = activityMultiplier(profile.activity);
  const tdee = bmr * multiplier;

  const delta = (profile.weeklyTargetKg * KCAL_PER_KG) / 7;

  const floor =
    profile.gender === "male" ? MIN_CALORIES_MALE : MIN_CALORIES_FEMALE;
  const raw = tdee + delta;
  const goalCalories = Math.max(raw, floor);

  return {
    bmr: round(bmr),
    tdee: round(tdee),
    activityMultiplier: multiplier,
    calorieDelta: round(delta),
    goalCalories: round(goalCalories),
    safetyFloorApplied: raw < floor,
  };
}

/**
 * Compute the macro split from energy + goal.
 *
 * Order matters and follows accepted practice:
 *   1. Protein — anchored to TARGET bodyweight (g/kg by goal).
 *   2. Fat — anchored to TARGET bodyweight, never below the 45 g floor.
 *   3. Fiber — derived from calories (14 g per 1000 kcal).
 *   4. Carbs — ALWAYS last: whatever energy remains, so calories always match.
 */
export function calculateMacros(profile: UserProfile): NutritionResult {
  const energy = calculateEnergy(profile);
  const goal = getGoal(profile.goal);
  const targetWeight = profile.targetWeightKg;

  // 1. Protein (g)
  const protein = round(goal.proteinPerKg * targetWeight);

  // 2. Fat (g), floored
  const fat = round(Math.max(goal.fatPerKg * targetWeight, FAT_FLOOR_G));

  // 3. Fiber (g) from calories
  const fiber = round((energy.goalCalories / 1000) * FIBER_PER_1000_KCAL);

  // 4. Carbs (g) — remaining energy, never negative
  const proteinKcal = protein * KCAL_PER_GRAM.protein;
  const fatKcal = fat * KCAL_PER_GRAM.fat;
  const carbsKcal = Math.max(0, energy.goalCalories - proteinKcal - fatKcal);
  const carbs = round(carbsKcal / KCAL_PER_GRAM.carbs);

  const macros: MacroValues = {
    calories: energy.goalCalories,
    protein,
    fat,
    carbs,
    fiber,
  };

  return {
    energy,
    macros,
    derivation: {
      proteinPerKg: goal.proteinPerKg,
      fatPerKg: goal.fatPerKg,
      fiberPer1000: FIBER_PER_1000_KCAL,
      proteinReferenceWeight: targetWeight,
    },
  };
}

/**
 * Energy implied by a macro split (kcal). Fiber is a subset of carbohydrate
 * and is deliberately NOT counted separately, so it never double-counts.
 */
export function caloriesFromMacros(m: Pick<MacroValues, "protein" | "fat" | "carbs">): number {
  return (
    m.protein * KCAL_PER_GRAM.protein +
    m.fat * KCAL_PER_GRAM.fat +
    m.carbs * KCAL_PER_GRAM.carbs
  );
}

/** Percentage of total energy contributed by each macro. */
export function macroEnergyShare(m: MacroValues) {
  const p = m.protein * KCAL_PER_GRAM.protein;
  const f = m.fat * KCAL_PER_GRAM.fat;
  const c = m.carbs * KCAL_PER_GRAM.carbs;
  const total = p + f + c || 1;
  return {
    protein: clamp((p / total) * 100, 0, 100),
    fat: clamp((f / total) * 100, 0, 100),
    carbs: clamp((c / total) * 100, 0, 100),
  };
}
