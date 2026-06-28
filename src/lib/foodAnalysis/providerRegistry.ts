/**
 * Provider registry — the one place that knows which AI/data providers exist
 * and which one is active. Components call `analyzeFood()` and never import a
 * concrete provider, so swapping vendors is a settings change, not a refactor.
 */

import { HeuristicProvider } from "./heuristicProvider";
import {
  claudeVisionProvider,
  geminiVisionProvider,
  openaiVisionProvider,
} from "./providers/remoteVision";
import type { FoodAnalysisInput, FoodAnalysisProvider, FoodAnalysisResult } from "./types";

const heuristic = new HeuristicProvider();

/** All known providers, in display order. Heuristic is always first/available. */
export const PROVIDERS: FoodAnalysisProvider[] = [
  heuristic,
  openaiVisionProvider,
  geminiVisionProvider,
  claudeVisionProvider,
];

const ACTIVE_KEY = "fa-active-provider";

export function getProviderById(id: string): FoodAnalysisProvider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

/** The provider the user selected, or the best available one (heuristic). */
export function getActiveProvider(): FoodAnalysisProvider {
  const stored = typeof window !== "undefined" ? window.localStorage.getItem(ACTIVE_KEY) : null;
  const chosen = stored ? getProviderById(stored) : undefined;
  if (chosen && chosen.available) return chosen;
  return PROVIDERS.find((p) => p.available) ?? heuristic;
}

export function setActiveProvider(id: string): void {
  if (typeof window !== "undefined") window.localStorage.setItem(ACTIVE_KEY, id);
}

/**
 * Analyze a meal with the active provider, transparently falling back to the
 * offline heuristic estimator if a remote provider fails or isn't configured.
 * Always stamps `createdAt` so the engine itself stays time-pure.
 */
export async function analyzeFood(input: FoodAnalysisInput): Promise<FoodAnalysisResult> {
  const active = getActiveProvider();
  try {
    const result = await active.analyze(input);
    return { ...result, createdAt: Date.now() };
  } catch (err) {
    if (active.id !== heuristic.id) {
      const result = await heuristic.analyze(input);
      return {
        ...result,
        createdAt: Date.now(),
        confidence: {
          ...result.confidence,
          reasons: [
            `${active.label} unavailable — used the offline estimator.`,
            ...result.confidence.reasons,
          ],
        },
      };
    }
    throw err;
  }
}
