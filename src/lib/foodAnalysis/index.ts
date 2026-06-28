/** Public surface of the food-analysis module. */
export * from "./types";
export * from "./foods";
export * from "./portion";
export * from "./confidence";
export * from "./heuristicProvider";
export * from "./providerRegistry";
export { RemoteVisionProvider, ANALYSIS_PROMPT } from "./providers/remoteVision";

import type { Nutrition } from "./types";

/** Scale a result's per-gram nutrition to an arbitrary portion (grams). */
export function nutritionForGrams(perGram: Nutrition, grams: number): Nutrition {
  return {
    calories: Math.round(perGram.calories * grams),
    protein: Math.round(perGram.protein * grams),
    carbs: Math.round(perGram.carbs * grams),
    fat: Math.round(perGram.fat * grams),
    fiber: Math.round(perGram.fiber * grams * 10) / 10,
    sugar: Math.round(perGram.sugar * grams * 10) / 10,
    sodium: Math.round(perGram.sodium * grams),
    potassium: Math.round(perGram.potassium * grams),
  };
}
