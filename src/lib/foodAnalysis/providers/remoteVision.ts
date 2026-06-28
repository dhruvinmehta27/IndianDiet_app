/**
 * Remote vision-model adapters (OpenAI / Gemini / Claude Vision).
 *
 * These implement the SAME `FoodAnalysisProvider` contract as the offline
 * heuristic provider, so the UI never changes when you switch vendors. Each is
 * gated on an API key (read from localStorage / env); without one it reports
 * `available = false` and the registry falls back to the heuristic provider.
 *
 * The request/response wiring is intentionally isolated here behind
 * `buildRequest` / `parseModelJson`, so adding USDA, Nutritionix, Edamam, etc.
 * is a matter of adding another adapter — no UI or engine changes.
 */

import { round } from "../../utils";
import { levelFor } from "../confidence";
import { describePortion } from "../portion";
import {
  DISCLAIMER,
  EMPTY_NUTRITION,
  type ComponentRole,
  type DetectedIngredient,
  type FoodAnalysisInput,
  type FoodAnalysisProvider,
  type FoodAnalysisResult,
  type Nutrition,
} from "../types";

export type VisionVendor = "openai" | "gemini" | "claude";

/** Shape we ask every model to return — keeps parsing identical across vendors. */
export interface ModelFoodJson {
  dishName: string;
  cuisine?: string;
  cookingMethod?: string;
  portionGrams: number;
  confidence: number; // 0–100
  reasons?: string[];
  suggestions?: string[];
  ingredients: Array<{
    name: string;
    role?: ComponentRole;
    grams: number;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    potassium?: number;
  }>;
}

export const ANALYSIS_PROMPT = `You are a nutrition estimation assistant. Given a food photo and/or a short description and portion hint, estimate the dish and its nutrition. Identify components (main dish, side, sauce, rice, bread, vegetables, visible protein), the likely cooking method, and an approximate serving size in grams. Return ONLY strict JSON matching this TypeScript type:
{ dishName: string; cuisine?: string; cookingMethod?: string; portionGrams: number; confidence: number /*0-100*/; reasons: string[]; suggestions: string[]; ingredients: { name: string; role: string; grams: number; calories: number; protein: number; carbs: number; fat: number; fiber: number; sugar: number; sodium: number; potassium: number }[] }
Values are estimates. Prefer realistic Indian/global home and restaurant portions.`;

/** Where each vendor's API key lives in localStorage. */
function keyStorageName(vendor: VisionVendor): string {
  return { openai: "OPENAI_API_KEY", gemini: "GEMINI_API_KEY", claude: "ANTHROPIC_API_KEY" }[vendor];
}

function readApiKey(vendor: VisionVendor): string | undefined {
  if (typeof window === "undefined") return undefined;
  return window.localStorage.getItem(keyStorageName(vendor)) ?? undefined;
}

export class RemoteVisionProvider implements FoodAnalysisProvider {
  readonly usesVision = true;
  constructor(
    private readonly vendor: VisionVendor,
    readonly id: string,
    readonly label: string,
  ) {}

  get available(): boolean {
    return Boolean(readApiKey(this.vendor));
  }

  async analyze(input: FoodAnalysisInput): Promise<FoodAnalysisResult> {
    const key = readApiKey(this.vendor);
    if (!key) {
      throw new Error(`${this.label} is not configured — add an API key to enable it.`);
    }
    const json = await this.callModel(input, key);
    return resultFromModelJson(json, this.id);
  }

  /**
   * Vendor-specific network call. Kept thin and guarded; the exact request
   * bodies live with each vendor so the rest of the app stays vendor-neutral.
   */
  private async callModel(_input: FoodAnalysisInput, _key: string): Promise<ModelFoodJson> {
    // NOTE: live calls are intentionally not executed in this build — wiring a
    // real endpoint is a drop-in here. Throwing keeps behaviour predictable and
    // lets the registry fall back to the offline estimator until configured.
    throw new Error(
      `${this.label}: live ${this.vendor} vision calls are not wired in this environment yet.`,
    );
  }
}

/** Normalize a model's JSON into our canonical result shape. */
export function resultFromModelJson(j: ModelFoodJson, providerId: string): FoodAnalysisResult {
  const ingredients: DetectedIngredient[] = (j.ingredients ?? []).map((i) => {
    const nutrition: Nutrition = {
      calories: i.calories ?? 0,
      protein: i.protein ?? 0,
      carbs: i.carbs ?? 0,
      fat: i.fat ?? 0,
      fiber: i.fiber ?? 0,
      sugar: i.sugar ?? 0,
      sodium: i.sodium ?? 0,
      potassium: i.potassium ?? 0,
    };
    return {
      name: i.name,
      role: (i.role as ComponentRole) ?? "other",
      grams: round(i.grams ?? 0),
      calories: Math.round(i.calories ?? 0),
      nutrition,
      confidence: 0.8,
    };
  });

  const total = ingredients.reduce<Nutrition>(
    (acc, i) => ({
      calories: acc.calories + i.nutrition.calories,
      protein: acc.protein + i.nutrition.protein,
      carbs: acc.carbs + i.nutrition.carbs,
      fat: acc.fat + i.nutrition.fat,
      fiber: acc.fiber + i.nutrition.fiber,
      sugar: acc.sugar + i.nutrition.sugar,
      sodium: acc.sodium + i.nutrition.sodium,
      potassium: acc.potassium + i.nutrition.potassium,
    }),
    { ...EMPTY_NUTRITION },
  );

  const grams = Math.max(1, j.portionGrams || 0);
  const perGram: Nutrition = {
    calories: total.calories / grams,
    protein: total.protein / grams,
    carbs: total.carbs / grams,
    fat: total.fat / grams,
    fiber: total.fiber / grams,
    sugar: total.sugar / grams,
    sodium: total.sodium / grams,
    potassium: total.potassium / grams,
  };

  return {
    id: `scan_${Date.now().toString(36)}`,
    dishName: j.dishName,
    cuisine: j.cuisine,
    cookingMethod: j.cookingMethod,
    ingredients,
    portion: {
      grams: round(grams),
      display: describePortion(grams, {}),
      min: Math.max(30, Math.round(grams * 0.4)),
      max: Math.round(grams * 2.5),
    },
    perGram,
    nutrition: total,
    confidence: {
      score: Math.round(j.confidence ?? 60),
      level: levelFor(j.confidence ?? 60),
      reasons: j.reasons ?? [],
    },
    suggestions: j.suggestions ?? [],
    disclaimer: DISCLAIMER,
    provider: providerId,
  };
}

export const openaiVisionProvider = new RemoteVisionProvider("openai", "openai-vision", "OpenAI Vision (GPT-4o)");
export const geminiVisionProvider = new RemoteVisionProvider("gemini", "gemini-vision", "Google Gemini Vision");
export const claudeVisionProvider = new RemoteVisionProvider("claude", "claude-vision", "Claude Vision");
