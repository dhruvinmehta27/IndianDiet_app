/**
 * Domain types for the AI Image Calorie Calculator.
 *
 * Framework-agnostic and provider-agnostic: the UI depends only on these
 * shapes, never on a concrete AI vendor. Any provider (heuristic, OpenAI /
 * Gemini / Claude Vision, USDA, Nutritionix, Edamam…) implements
 * `FoodAnalysisProvider` and returns a `FoodAnalysisResult`, so providers can
 * be swapped without touching a single component.
 */

/** Extended nutrition vector — macros plus the micros the brief asks for. */
export interface Nutrition {
  calories: number; // kcal
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  fiber: number; // g
  sugar: number; // g
  sodium: number; // mg (estimated)
  potassium: number; // mg (estimated)
}

export const EMPTY_NUTRITION: Nutrition = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0,
  potassium: 0,
};

/** Culinary role a detected component plays in the meal. */
export type ComponentRole =
  | "main"
  | "side"
  | "sauce"
  | "rice"
  | "bread"
  | "vegetable"
  | "protein"
  | "drink"
  | "dessert"
  | "snack"
  | "other";

/** A single detected ingredient / component with its estimated contribution. */
export interface DetectedIngredient {
  name: string;
  role: ComponentRole;
  grams: number;
  /** Energy contribution (kcal) for this ingredient at the estimated portion. */
  calories: number;
  /** Full macro contribution, so corrections & charts can use it. */
  nutrition: Nutrition;
  /** 0–1 how sure we are this ingredient is present. */
  confidence: number;
}

export type PortionPreset = "small" | "medium" | "large" | "xl";

export interface PortionEstimate {
  grams: number;
  /** Human label, e.g. "≈ 1.5 cups" or "≈ 1 plate". */
  display: string;
  /** Reasonable adjust range for the slider (grams). */
  min: number;
  max: number;
}

export type ConfidenceLevel = "high" | "medium" | "low";

export interface ConfidenceReport {
  score: number; // 0–100
  level: ConfidenceLevel;
  reasons: string[];
}

/** What the user feeds the analyzer. */
export interface FoodAnalysisInput {
  /** Image as a data URL (optional — text-only analysis is allowed). */
  imageDataUrl?: string;
  /** Short free-text description, e.g. "Dal Rice, home-made, less oil". */
  description: string;
  /** Coarse portion preset. */
  portionPreset?: PortionPreset;
  /** Manual portion override, e.g. "250 g", "2 rotis", "1 bowl". */
  portionText?: string;
}

/** The full, normalized analysis the UI renders. */
export interface FoodAnalysisResult {
  id: string;
  dishName: string;
  cuisine?: string;
  cookingMethod?: string;
  ingredients: DetectedIngredient[];
  portion: PortionEstimate;
  /**
   * Nutrition PER GRAM of the dish. The UI multiplies this by the (possibly
   * user-adjusted) portion grams so the portion slider updates instantly with
   * zero re-analysis.
   */
  perGram: Nutrition;
  /** Convenience: nutrition at the estimated portion (= perGram × portion.grams). */
  nutrition: Nutrition;
  confidence: ConfidenceReport;
  suggestions: string[];
  disclaimer: string;
  /** Which provider produced this (for analytics / debugging). */
  provider: string;
  /** Epoch ms — stamped by the caller (engine stays time-pure). */
  createdAt?: number;
}

/** The contract every AI/data provider implements. */
export interface FoodAnalysisProvider {
  /** Stable id, e.g. "heuristic", "openai-vision". */
  readonly id: string;
  /** Human label for the settings UI. */
  readonly label: string;
  /** Whether the provider is ready to use (e.g. API key present). */
  readonly available: boolean;
  /** Whether the provider actually looks at pixels (vs text-only). */
  readonly usesVision: boolean;
  analyze(input: FoodAnalysisInput): Promise<FoodAnalysisResult>;
}

export const DISCLAIMER =
  "Nutrition values are AI-generated estimates and may vary depending on ingredients, preparation methods, and serving sizes.";
