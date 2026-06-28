/** Portion-size helpers: presets, free-text parsing and friendly display. */

import type { PortionPreset } from "./types";

export const PORTION_PRESETS: { id: PortionPreset; label: string; mult: number }[] = [
  { id: "small", label: "Small", mult: 0.7 },
  { id: "medium", label: "Medium", mult: 1.0 },
  { id: "large", label: "Large", mult: 1.4 },
  { id: "xl", label: "Extra Large", mult: 1.8 },
];

export function presetMultiplier(preset?: PortionPreset): number {
  return PORTION_PRESETS.find((p) => p.id === preset)?.mult ?? 1;
}

export interface ParsedPortion {
  /** Explicit grams, if the text gave a weight. */
  grams?: number;
  /** A count multiplier, e.g. "2 rotis" → 2. */
  countMult?: number;
  /** Whether anything usable was parsed. */
  matched: boolean;
}

const COUNTABLE = /\b(\d+(?:\.\d+)?)\s*(bowls?|plates?|cups?|rotis?|chapatis?|pieces?|slices?|servings?|idlis?|glasses?)\b/;
const WEIGHT = /\b(\d+(?:\.\d+)?)\s*(g|grams?|kg|ml|l)\b/;

/** Parse free-text portion such as "250 g", "2 rotis", "1 bowl". */
export function parsePortionText(text?: string): ParsedPortion {
  if (!text) return { matched: false };
  const t = text.toLowerCase();

  const w = t.match(WEIGHT);
  if (w) {
    let grams = parseFloat(w[1]);
    const unit = w[2];
    if (unit === "kg") grams *= 1000;
    else if (unit === "l") grams *= 1000; // approx 1 ml ≈ 1 g for food
    return { grams: Math.round(grams), matched: true };
  }

  const c = t.match(COUNTABLE);
  if (c) {
    return { countMult: parseFloat(c[1]), matched: true };
  }

  return { matched: false };
}

/** Render a friendly serving label from grams + a hint of what the dish is. */
export function describePortion(
  grams: number,
  hint: { hasRice?: boolean; hasDrink?: boolean; hasBread?: boolean },
): string {
  const g = Math.round(grams);
  if (hint.hasDrink) {
    const cups = grams / 240;
    return `≈ ${g} g  ·  ${cups.toFixed(cups < 1.2 ? 0 : 1)} glass${cups >= 1.5 ? "es" : ""}`;
  }
  if (hint.hasRice) {
    const cups = grams / 160;
    return `≈ ${g} g  ·  ${cups.toFixed(1)} cups`;
  }
  if (hint.hasBread) {
    return `≈ ${g} g  ·  1 plate`;
  }
  const bowls = grams / 200;
  return `≈ ${g} g  ·  ${bowls.toFixed(1)} bowl${bowls >= 1.5 ? "s" : ""}`;
}
