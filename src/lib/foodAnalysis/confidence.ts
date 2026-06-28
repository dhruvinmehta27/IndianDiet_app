/** Confidence scoring + human explanations for an analysis. */

import { clamp } from "../utils";
import type { ConfidenceLevel, ConfidenceReport } from "./types";

export function levelFor(score: number): ConfidenceLevel {
  if (score >= 90) return "high";
  if (score >= 70) return "medium";
  return "low";
}

export interface ConfidenceSignals {
  matchedCount: number;
  hasImage: boolean;
  descriptionWords: number;
  explicitPortion: boolean;
  obstructedImage?: boolean;
}

/**
 * Combine the available signals into a 0–100 confidence score with a plain
 * explanation of what helped and what hurt — exactly what the brief's accuracy
 * indicator needs to surface.
 */
export function scoreConfidence(s: ConfidenceSignals): ConfidenceReport {
  let score = 58;
  const reasons: string[] = [];

  if (s.matchedCount >= 1) {
    score += 18;
  } else {
    score -= 22;
    reasons.push("Dish wasn't confidently recognised — used a general estimate.");
  }
  if (s.matchedCount >= 2) {
    score += 8;
    reasons.push("Multiple components identified in the meal.");
  }

  if (s.hasImage) {
    score += 10;
    if (s.obstructedImage) {
      score -= 14;
      reasons.push("The image is partially obstructed.");
    } else {
      reasons.push("Photo analysed alongside the description.");
    }
  } else {
    score -= 6;
    reasons.push("No photo provided — estimated from text only.");
  }

  if (s.descriptionWords >= 2) {
    score += 10;
    reasons.push("Description improved confidence.");
  } else if (s.descriptionWords === 0) {
    score -= 8;
  }

  if (s.explicitPortion) {
    score += 12;
    reasons.push("A clear portion size was specified.");
  } else {
    reasons.push("Serving size was estimated and may vary.");
  }

  score = clamp(Math.round(score), 35, 96);
  return { score, level: levelFor(score), reasons };
}
