import type {
  ActivityId,
  DietId,
  EthnicityId,
  GoalId,
  MacroKey,
  WeeklyTargetKg,
} from "./types";

/** Atwater energy factors (kcal per gram). */
export const KCAL_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
} as const;

/** Energy density of body mass change (kcal per kg). ~7700 kcal ≈ 1 kg fat. */
export const KCAL_PER_KG = 7700;

/** Fiber recommendation: grams of fiber per 1000 kcal. */
export const FIBER_PER_1000_KCAL = 14;

/** Hard floors to keep recommendations safe. */
export const FAT_FLOOR_G = 45;
export const MIN_CALORIES_MALE = 1500;
export const MIN_CALORIES_FEMALE = 1200;

export interface ActivityLevel {
  id: ActivityId;
  label: string;
  multiplier: number;
  description: string;
  goal: string;
}

/** Activity levels with TDEE multipliers, ordered for the slider. */
export const ACTIVITY_LEVELS: ActivityLevel[] = [
  {
    id: "sedentary",
    label: "Sedentary",
    multiplier: 1.2,
    description: "Desk job, little or no exercise",
    goal: "Baseline maintenance & gentle recomposition",
  },
  {
    id: "light",
    label: "Lightly Active",
    multiplier: 1.375,
    description: "Light exercise 1–3 days / week",
    goal: "Sustainable fat loss with daily movement",
  },
  {
    id: "moderate",
    label: "Moderately Active",
    multiplier: 1.55,
    description: "Moderate exercise 3–5 days / week",
    goal: "Balanced performance & body composition",
  },
  {
    id: "very-active",
    label: "Very Active",
    multiplier: 1.725,
    description: "Hard exercise 6–7 days / week",
    goal: "Strength gains & high training volume",
  },
  {
    id: "athlete",
    label: "Athlete",
    multiplier: 1.9,
    description: "Twice-daily training or physical job",
    goal: "Maximal performance & recovery fuelling",
  },
];

export interface GoalConfig {
  id: GoalId;
  label: string;
  /** Direction hint for the UI. */
  direction: "deficit" | "neutral" | "surplus";
  /** Default protein target (g per kg of target bodyweight). */
  proteinPerKg: number;
  /** Allowed protein band, for the manual adjuster. */
  proteinRange: [number, number];
  /** Default fat target (g per kg of target bodyweight). */
  fatPerKg: number;
  fatRange: [number, number];
  /** Default weekly bodyweight change suggested for this goal. */
  defaultWeekly: WeeklyTargetKg;
  description: string;
}

/**
 * Evidence-based goal configuration.
 *
 * Protein is anchored to TARGET bodyweight per accepted sports-nutrition
 * guidance (ISSN). Fat defaults to 0.7 g/kg with a sane band. Calorie delta is
 * derived from the weekly target (see engine), not hard-coded here, so the two
 * controls stay consistent.
 */
export const GOALS: GoalConfig[] = [
  {
    id: "lose-fat",
    label: "Lose Fat",
    direction: "deficit",
    proteinPerKg: 1.9,
    proteinRange: [1.8, 2.2],
    fatPerKg: 0.7,
    fatRange: [0.6, 1.0],
    defaultWeekly: -0.5,
    description: "Preserve muscle in a deficit with high protein.",
  },
  {
    id: "maintain",
    label: "Maintain",
    direction: "neutral",
    proteinPerKg: 1.7,
    proteinRange: [1.6, 1.8],
    fatPerKg: 0.8,
    fatRange: [0.6, 1.0],
    defaultWeekly: 0,
    description: "Hold weight while supporting training and recovery.",
  },
  {
    id: "lean-bulk",
    label: "Lean Bulk",
    direction: "surplus",
    proteinPerKg: 1.8,
    proteinRange: [1.6, 2.2],
    fatPerKg: 0.8,
    fatRange: [0.6, 1.0],
    defaultWeekly: 0.25,
    description: "Slow surplus to add muscle with minimal fat gain.",
  },
  {
    id: "muscle-gain",
    label: "Muscle Gain",
    direction: "surplus",
    proteinPerKg: 2.0,
    proteinRange: [1.8, 2.2],
    fatPerKg: 0.8,
    fatRange: [0.6, 1.0],
    defaultWeekly: 0.5,
    description: "Aggressive surplus for maximal hypertrophy.",
  },
];

export interface WeeklyTargetOption {
  value: WeeklyTargetKg;
  label: string;
  short: string;
}

/** Ordered weekly bodyweight-change options for the slider. */
export const WEEKLY_TARGETS: WeeklyTargetOption[] = [
  { value: -1, label: "Lose 1 kg / week", short: "−1.0" },
  { value: -0.75, label: "Lose 0.75 kg / week", short: "−0.75" },
  { value: -0.5, label: "Lose 0.5 kg / week", short: "−0.5" },
  { value: -0.25, label: "Lose 0.25 kg / week", short: "−0.25" },
  { value: 0, label: "Maintain", short: "0" },
  { value: 0.25, label: "Gain 0.25 kg / week", short: "+0.25" },
  { value: 0.5, label: "Gain 0.5 kg / week", short: "+0.5" },
];

export interface EthnicityOption {
  id: EthnicityId;
  label: string;
}

/**
 * Ethnicity does not yet alter calculations, but is captured so future
 * modules can apply population-specific BMI thresholds (e.g. lower South-Asian
 * cut-offs) and body-fat estimation tweaks without a schema change.
 */
export const ETHNICITIES: EthnicityOption[] = [
  { id: "european", label: "European" },
  { id: "south-asian", label: "South Asian" },
  { id: "east-asian", label: "East Asian" },
  { id: "african", label: "African" },
  { id: "middle-eastern", label: "Middle Eastern" },
  { id: "hispanic", label: "Hispanic" },
  { id: "other", label: "Other" },
];

export interface DietOption {
  id: DietId;
  label: string;
  hint: string;
}

/** Diet preference — reserved for the future meal planner / recipe generator. */
export const DIETS: DietOption[] = [
  { id: "omnivore", label: "Omnivore", hint: "No restrictions" },
  { id: "vegetarian", label: "Vegetarian", hint: "No meat or fish" },
  { id: "vegan", label: "Vegan", hint: "Fully plant-based" },
  { id: "eggetarian", label: "Eggetarian", hint: "Vegetarian + eggs" },
  { id: "keto", label: "Keto", hint: "Very low carb, high fat" },
  { id: "low-carb", label: "Low Carb", hint: "Reduced carbohydrate" },
  { id: "mediterranean", label: "Mediterranean", hint: "Whole foods, healthy fats" },
];

/** Input bounds for the personal sliders. */
export const INPUT_BOUNDS = {
  age: { min: 15, max: 80, step: 1 },
  height: { min: 140, max: 220, step: 1 },
  weight: { min: 40, max: 180, step: 1 },
} as const;

/** Display metadata for each macro (color token, label, unit). */
export const MACRO_META: Record<
  MacroKey,
  { label: string; unit: string; colorVar: string; tw: string }
> = {
  calories: { label: "Calories", unit: "kcal", colorVar: "--macro-calories", tw: "text-macro-calories" },
  protein: { label: "Protein", unit: "g", colorVar: "--macro-protein", tw: "text-macro-protein" },
  fat: { label: "Fat", unit: "g", colorVar: "--macro-fat", tw: "text-macro-fat" },
  carbs: { label: "Carbs", unit: "g", colorVar: "--macro-carbs", tw: "text-macro-carbs" },
  fiber: { label: "Fiber", unit: "g", colorVar: "--macro-fiber", tw: "text-macro-fiber" },
};

/** Reasonable manual-adjust bounds for each macro slider (grams / kcal). */
export const MACRO_SLIDER_BOUNDS: Record<MacroKey, { min: number; max: number; step: number }> = {
  calories: { min: 1000, max: 5000, step: 10 },
  protein: { min: 30, max: 350, step: 1 },
  fat: { min: FAT_FLOOR_G, max: 250, step: 1 },
  carbs: { min: 0, max: 700, step: 1 },
  fiber: { min: 10, max: 80, step: 1 },
};
