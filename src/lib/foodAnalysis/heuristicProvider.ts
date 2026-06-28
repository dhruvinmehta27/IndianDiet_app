/**
 * The default, offline food-analysis provider.
 *
 * It needs no API key: it parses the user's description, matches foods against
 * a local knowledge base, applies preparation modifiers and portion sizing, and
 * produces a realistic nutrition estimate with a confidence score and
 * suggestions. A real vision model (OpenAI / Gemini / Claude) can replace it
 * later behind the identical `FoodAnalysisProvider` contract.
 */

import { round } from "../utils";
import { scoreConfidence } from "./confidence";
import { FAT_ADDONS, FOODS, type FoodItem } from "./foods";
import { describePortion, parsePortionText, presetMultiplier } from "./portion";
import {
  DISCLAIMER,
  EMPTY_NUTRITION,
  type DetectedIngredient,
  type FoodAnalysisInput,
  type FoodAnalysisProvider,
  type FoodAnalysisResult,
  type Nutrition,
} from "./types";

/* ----------------------------- nutrition math ----------------------------- */

function scale(per100g: Nutrition, grams: number): Nutrition {
  const k = grams / 100;
  return {
    calories: per100g.calories * k,
    protein: per100g.protein * k,
    carbs: per100g.carbs * k,
    fat: per100g.fat * k,
    fiber: per100g.fiber * k,
    sugar: per100g.sugar * k,
    sodium: per100g.sodium * k,
    potassium: per100g.potassium * k,
  };
}

function add(a: Nutrition, b: Nutrition): Nutrition {
  return {
    calories: a.calories + b.calories,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
    fiber: a.fiber + b.fiber,
    sugar: a.sugar + b.sugar,
    sodium: a.sodium + b.sodium,
    potassium: a.potassium + b.potassium,
  };
}

function sum(list: Nutrition[]): Nutrition {
  return list.reduce(add, { ...EMPTY_NUTRITION });
}

function roundNutrition(x: Nutrition): Nutrition {
  return {
    calories: Math.round(x.calories),
    protein: round(x.protein, 1),
    carbs: round(x.carbs, 1),
    fat: round(x.fat, 1),
    fiber: round(x.fiber, 1),
    sugar: round(x.sugar, 1),
    sodium: Math.round(x.sodium),
    potassium: Math.round(x.potassium),
  };
}

/* ------------------------------- matching -------------------------------- */

const GHEE_DISHES = new Set(["dal", "dal-makhani", "khichdi", "palak-paneer"]);

interface Modifiers {
  lowOil: boolean;
  extraOil: boolean;
  restaurant: boolean;
  homemade: boolean;
  addons: (keyof typeof FAT_ADDONS)[];
}

function detectModifiers(text: string): Modifiers {
  const t = text.toLowerCase();
  const addons: (keyof typeof FAT_ADDONS)[] = [];
  for (const key of Object.keys(FAT_ADDONS) as (keyof typeof FAT_ADDONS)[]) {
    if (t.includes(key)) addons.push(key);
  }
  return {
    lowOil: /(less|low|no|without)\s*oil|oil[-\s]?free/.test(t),
    extraOil: /(extra oil|deep[-\s]?fried|fried|oily)/.test(t),
    restaurant: /(restaurant|takeaway|take[-\s]?out|hotel|outside)/.test(t),
    homemade: /(home[-\s]?made|homemade|ghar)/.test(t),
    addons,
  };
}

function matchFoods(text: string): FoodItem[] {
  const t = ` ${text.toLowerCase()} `;
  const matched: FoodItem[] = [];
  for (const food of FOODS) {
    // Word-boundary alias match so "rice" doesn't fire inside "licorice".
    if (food.aliases.some((a) => new RegExp(`(^|[^a-z])${escapeRe(a)}([^a-z]|$)`).test(t))) {
      matched.push(food);
    }
  }
  // De-duplicate: if both a specific dish and a generic component match (e.g.
  // "veg pasta" and "pasta"), keep the more-specific dish only.
  return dedupeOverlaps(matched, text.toLowerCase());
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function dedupeOverlaps(matched: FoodItem[], text: string): FoodItem[] {
  // Drop "pasta" if "veg pasta"/"alfredo" present; drop "rice" if "fried rice"
  // or "biryani" present; etc. We keep specific mains over generic ones.
  const ids = new Set(matched.map((m) => m.id));
  const drop = new Set<string>();
  if (ids.has("veg-pasta") || ids.has("alfredo-pasta")) drop.add("pasta");
  if (ids.has("fried-rice") || ids.has("chicken-biryani") || ids.has("veg-biryani")) {
    // only drop plain rice if the word "rice" wasn't standalone with "dal" etc.
    if (!/\bdal rice\b|\brice\b(?!.*biryani)/.test(text) || ids.has("fried-rice")) {
      // keep rice when it's clearly "dal rice"; drop when subsumed by fried rice
    }
    if (ids.has("fried-rice")) drop.add("rice");
  }
  if (ids.has("paneer-butter-masala") || ids.has("palak-paneer")) drop.add("paneer");
  // "greek yogurt" contains "yogurt", which also matches plain curd/dahi.
  if (ids.has("greek-yogurt")) drop.add("curd");
  return matched.filter((m) => !drop.has(m.id));
}

function titleCase(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/* -------------------------- suggestion generation ------------------------- */

function buildSuggestions(nutr: Nutrition, mods: Modifiers, foods: FoodItem[]): string[] {
  const out: string[] = [];
  if (mods.homemade) out.push("This meal appears home-made — typically lower in oil and salt.");
  if (mods.restaurant) out.push("Restaurant portions tend to be larger and higher in oil & salt.");

  const carbEnergy = nutr.carbs * 4;
  const proteinEnergy = nutr.protein * 4;
  const fatEnergy = nutr.fat * 9;
  const total = carbEnergy + proteinEnergy + fatEnergy || 1;

  if (nutr.calories > 250 && nutr.protein < 20) {
    const need = Math.max(8, Math.round(20 - nutr.protein));
    out.push(`Protein is a little low — adding ~100 g Greek yogurt would add about ${need > 10 ? 10 : need} g protein.`);
  } else if (nutr.protein >= 30) {
    out.push("Solid protein content for muscle support. 💪");
  }

  if (carbEnergy / total > 0.62) out.push("This meal is high in carbohydrates — pair it with a protein or fibre source.");
  if (fatEnergy / total > 0.42) out.push("Fat content is on the higher side — go easy on added oil/ghee.");
  if (nutr.fiber >= 8) out.push("Great fibre content — good for satiety and digestion.");
  if (nutr.sodium > 900) out.push("Sodium looks high — drink water and balance with fresh foods.");

  if (foods.some((f) => f.role === "dessert")) out.push("A treat — best kept to smaller portions.");
  if (foods.some((f) => f.aliases.includes("beer") || f.aliases.includes("wine"))) {
    out.push("Alcohol adds 'empty' calories with no protein — factor it into your daily total.");
  }

  return out.slice(0, 4);
}

/* ------------------------------ the provider ------------------------------ */

export class HeuristicProvider implements FoodAnalysisProvider {
  readonly id = "heuristic";
  readonly label = "Built-in estimator (offline)";
  readonly available = true;
  readonly usesVision = false;

  async analyze(input: FoodAnalysisInput): Promise<FoodAnalysisResult> {
    const description = (input.description ?? "").trim();
    const mods = detectModifiers(description);
    const matched = matchFoods(description);
    const parsedPortion = parsePortionText(input.portionText);
    const presetMult = presetMultiplier(input.portionPreset);
    const countMult = parsedPortion.countMult ?? 1;

    // Build base ingredient list (grams at the chosen preset).
    const baseIngredients: { food: FoodItem; grams: number }[] = matched.map((food) => ({
      food,
      grams: food.servingG * presetMult * countMult,
    }));

    // Implied small fat (ghee) for dishes that customarily use it.
    for (const m of matched) {
      if (GHEE_DISHES.has(m.id) && !mods.lowOil && !mods.addons.includes("ghee")) {
        mods.addons.push("ghee");
      }
    }
    // Add explicit/implied fat add-ons as their own ingredients.
    const addonIngredients = uniqueAddons(mods.addons).map((key) => {
      const grams = key === "cheese" ? 25 : key === "oil" ? 8 : 6;
      return { key, grams: grams * presetMult };
    });

    // Fallback when nothing matched: a generic mixed meal.
    let usedFallback = false;
    if (baseIngredients.length === 0) {
      usedFallback = true;
      baseIngredients.push({
        food: GENERIC_MEAL,
        grams: GENERIC_MEAL.servingG * presetMult * countMult,
      });
    }

    // Normalise to an explicit weight if the user gave one.
    const baseGrams =
      baseIngredients.reduce((s, b) => s + b.grams, 0) +
      addonIngredients.reduce((s, a) => s + a.grams, 0);
    const factor = parsedPortion.grams ? parsedPortion.grams / baseGrams : 1;
    const estimatedGrams = round(baseGrams * factor);

    // Compose detected ingredients with nutrition at the estimated portion.
    const ingredients: DetectedIngredient[] = [];
    for (const b of baseIngredients) {
      const grams = b.grams * factor;
      let nut = scale(b.food.per100g, grams);
      nut = applyModifiers(nut, mods);
      ingredients.push({
        name: b.food.name,
        role: b.food.role,
        grams: round(grams),
        calories: Math.round(nut.calories),
        nutrition: roundNutrition(nut),
        confidence: usedFallback ? 0.5 : 0.85,
      });
    }
    for (const a of addonIngredients) {
      const grams = a.grams * factor;
      const def = FAT_ADDONS[a.key];
      const nut = scale(def.per100g, grams);
      ingredients.push({
        name: def.name,
        role: "sauce",
        grams: round(grams),
        calories: Math.round(nut.calories),
        nutrition: roundNutrition(nut),
        confidence: 0.7,
      });
    }

    // Zero-calorie aromatics for display (spices the dish implies).
    const aromatics = uniqueStrings(matched.flatMap((m) => m.aromatics ?? []));
    for (const spice of aromatics) {
      ingredients.push({
        name: spice,
        role: "other",
        grams: 0,
        calories: 0,
        nutrition: { ...EMPTY_NUTRITION },
        confidence: 0.75,
      });
    }

    const totalRaw = sum(ingredients.map((i) => i.nutrition));
    const total = roundNutrition(totalRaw);
    // perGram = nutrition for 1 g of the dish, so the UI's portion slider can
    // scale every value instantly without re-analysing.
    const g = Math.max(1, estimatedGrams);
    const perGram: Nutrition = {
      calories: totalRaw.calories / g,
      protein: totalRaw.protein / g,
      carbs: totalRaw.carbs / g,
      fat: totalRaw.fat / g,
      fiber: totalRaw.fiber / g,
      sugar: totalRaw.sugar / g,
      sodium: totalRaw.sodium / g,
      potassium: totalRaw.potassium / g,
    };

    const hasRice = matched.some((m) => m.role === "rice");
    const hasDrink = matched.some((m) => m.role === "drink");
    const hasBread = matched.some((m) => m.role === "bread");

    const confidence = scoreConfidence({
      matchedCount: matched.length,
      hasImage: Boolean(input.imageDataUrl),
      descriptionWords: description ? description.split(/\s+/).filter(Boolean).length : 0,
      explicitPortion: parsedPortion.matched || Boolean(input.portionPreset),
    });

    const dishName =
      description && description.split(/\s+/).length <= 6
        ? titleCase(description)
        : matched[0]?.name ?? "Mixed Meal";

    const cuisine = matched.find((m) => m.cuisine)?.cuisine;
    const cookingMethod =
      mods.extraOil && !matched.some((m) => m.method)
        ? "deep-fried"
        : matched.find((m) => m.method)?.method;

    return {
      id: makeId(),
      dishName,
      cuisine,
      cookingMethod,
      ingredients,
      portion: {
        grams: estimatedGrams,
        display: describePortion(estimatedGrams, { hasRice, hasDrink, hasBread }),
        min: Math.max(30, Math.round(estimatedGrams * 0.4)),
        max: Math.round(estimatedGrams * 2.5),
      },
      perGram,
      nutrition: total,
      confidence,
      suggestions: buildSuggestions(total, mods, matched),
      disclaimer: DISCLAIMER,
      provider: this.id,
    };
  }
}

function applyModifiers(nut: Nutrition, mods: Modifiers): Nutrition {
  const out = { ...nut };
  if (mods.lowOil) {
    out.fat *= 0.72;
    out.calories *= 0.9;
    out.sodium *= 0.9;
  }
  if (mods.extraOil) {
    out.fat *= 1.3;
    out.calories *= 1.12;
  }
  if (mods.restaurant) {
    out.calories *= 1.18;
    out.fat *= 1.25;
    out.sodium *= 1.35;
    out.sugar *= 1.2;
  }
  if (mods.homemade) {
    out.calories *= 0.96;
    out.sodium *= 0.8;
  }
  return out;
}

function uniqueAddons(a: (keyof typeof FAT_ADDONS)[]): (keyof typeof FAT_ADDONS)[] {
  return Array.from(new Set(a));
}
function uniqueStrings(a: string[]): string[] {
  return Array.from(new Set(a));
}

const GENERIC_MEAL: FoodItem = {
  id: "generic-meal",
  name: "Mixed Meal",
  aliases: [],
  role: "main",
  per100g: { calories: 160, protein: 6, carbs: 20, fat: 6, fiber: 2.5, sugar: 4, sodium: 360, potassium: 180 },
  servingG: 300,
};

function makeId(): string {
  // Runtime-only (not used inside Workflow scripts), so Date/random are fine.
  return `scan_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
