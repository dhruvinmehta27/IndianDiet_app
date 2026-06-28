/**
 * Core domain types for the nutrition engine.
 *
 * These types are intentionally framework-agnostic — no React, no UI concerns —
 * so the engine can be reused by future modules (meal planner, AI coach,
 * grocery planner, wearable sync, etc.) without modification.
 */

export type Gender = "male" | "female";

export type GoalId = "lose-fat" | "maintain" | "lean-bulk" | "muscle-gain";

export type ActivityId =
  | "sedentary"
  | "light"
  | "moderate"
  | "very-active"
  | "athlete";

export type EthnicityId =
  | "european"
  | "south-asian"
  | "east-asian"
  | "african"
  | "middle-eastern"
  | "hispanic"
  | "other";

export type DietId =
  | "omnivore"
  | "vegetarian"
  | "vegan"
  | "eggetarian"
  | "keto"
  | "low-carb"
  | "mediterranean";

/** Discrete weekly bodyweight-change targets, in kg/week (negative = loss). */
export type WeeklyTargetKg =
  | -1
  | -0.75
  | -0.5
  | -0.25
  | 0
  | 0.25
  | 0.5;

/** The five tracked macro/energy quantities. */
export type MacroKey = "calories" | "protein" | "fat" | "carbs" | "fiber";

/** The raw user inputs that drive the calculation engine. */
export interface UserProfile {
  age: number; // years
  gender: Gender;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  ethnicity: EthnicityId;
  activity: ActivityId;
  goal: GoalId;
  diet: DietId;
  weeklyTargetKg: WeeklyTargetKg;
}

/** A fully resolved set of macro values (grams) plus energy (kcal). */
export interface MacroValues {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
}

/** Which macros are pinned by the user so the rebalancer must not move them. */
export type MacroLocks = Record<MacroKey, boolean>;

/** Intermediate, fully-explained results from the energy engine. */
export interface EnergyBreakdown {
  bmr: number; // Mifflin-St Jeor
  tdee: number; // maintenance calories
  activityMultiplier: number;
  calorieDelta: number; // signed adjustment applied for the goal/weekly target
  goalCalories: number; // tdee + delta, floored to a safe minimum
  safetyFloorApplied: boolean;
}

/** Per-macro provenance so the UI can explain "why this number". */
export interface MacroDerivation {
  proteinPerKg: number;
  fatPerKg: number;
  fiberPer1000: number;
  proteinReferenceWeight: number; // target weight used
}

/** The complete output of a single engine pass. */
export interface NutritionResult {
  energy: EnergyBreakdown;
  macros: MacroValues;
  derivation: MacroDerivation;
}
