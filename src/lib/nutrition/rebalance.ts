/**
 * The macro rebalancing engine.
 *
 * Invariant maintained at all times:
 *   calories = protein·4 + fat·9 + carbs·4
 *
 * (Fiber is a component of carbohydrate and does not enter the energy
 * equation, so it is balanced independently.)
 *
 * When the user drags one slider, exactly one "balancer" macro absorbs the
 * change to keep the invariant true, while every locked macro stays fixed.
 * Carbohydrate is the default balancer — matching real-world practice where
 * carbs fill the energy left after protein and fat targets are met.
 */

import { clamp, round } from "../utils";
import { KCAL_PER_GRAM } from "./constants";
import { MACRO_SLIDER_BOUNDS } from "./constants";
import type { MacroKey, MacroLocks, MacroValues } from "./types";

/**
 * Order in which a macro is chosen to absorb changes. Carbs first (the natural
 * energy sink), then calories, then fat, then protein. Fiber is never used as
 * an energy balancer.
 */
const BALANCER_PRIORITY: MacroKey[] = ["carbs", "calories", "fat", "protein"];

function bound(key: MacroKey, value: number): number {
  const b = MACRO_SLIDER_BOUNDS[key];
  return clamp(round(value), b.min, b.max);
}

/** Solve the invariant for a single target macro, given the other three. */
function solveFor(target: MacroKey, m: MacroValues): number {
  const { protein, fat, carbs, calories } = m;
  switch (target) {
    case "calories":
      return protein * KCAL_PER_GRAM.protein + fat * KCAL_PER_GRAM.fat + carbs * KCAL_PER_GRAM.carbs;
    case "carbs":
      return (calories - protein * KCAL_PER_GRAM.protein - fat * KCAL_PER_GRAM.fat) / KCAL_PER_GRAM.carbs;
    case "fat":
      return (calories - protein * KCAL_PER_GRAM.protein - carbs * KCAL_PER_GRAM.carbs) / KCAL_PER_GRAM.fat;
    case "protein":
      return (calories - fat * KCAL_PER_GRAM.fat - carbs * KCAL_PER_GRAM.carbs) / KCAL_PER_GRAM.protein;
    default:
      return m[target];
  }
}

/**
 * Apply a user edit to one macro and rebalance the rest.
 *
 * @param current  the current consistent macro set
 * @param locks    which macros are pinned and must not move
 * @param edited   the macro the user is dragging
 * @param rawValue the requested new value (will be clamped)
 */
export function rebalanceMacros(
  current: MacroValues,
  locks: MacroLocks,
  edited: MacroKey,
  rawValue: number,
): MacroValues {
  // Fiber is independent of the energy equation — just clamp & set it.
  if (edited === "fiber") {
    return { ...current, fiber: bound("fiber", rawValue) };
  }

  const next: MacroValues = { ...current, [edited]: bound(edited, rawValue) };

  // Candidate balancers: not the edited macro, not locked, never fiber.
  const balancers = BALANCER_PRIORITY.filter(
    (k) => k !== edited && !locks[k],
  );

  if (balancers.length === 0) {
    // Everything else is locked — the edit cannot satisfy the invariant on its
    // own, so re-derive calories as the only consistent readout when possible.
    if (edited !== "calories" && !locks.calories) {
      next.calories = bound("calories", solveFor("calories", next));
    }
    return next;
  }

  // Distribute the required correction down the balancer priority list,
  // clamping each and cascading any residual to the next balancer so the
  // invariant holds even when a balancer hits its slider bounds.
  for (let i = 0; i < balancers.length; i++) {
    const b = balancers[i];
    const solved = solveFor(b, next);
    const clamped = bound(b, solved);
    next[b] = clamped;

    const consistent = Math.abs(solved - clamped) < 0.5;
    if (consistent || i === balancers.length - 1) break;
    // else: clamped at a bound, loop continues so the next balancer absorbs
    // the leftover (next iteration's solveFor sees the clamped value).
  }

  // Keep fiber's recommendation sensible relative to new calories only if the
  // user has not pinned it (handled by caller's recompute on profile change);
  // here we leave fiber untouched to respect manual fiber edits.
  return next;
}

/**
 * Whether a macro set satisfies the energy invariant within a small tolerance.
 * Useful for tests and UI "calories balanced ✓" indicators.
 */
export function isBalanced(m: MacroValues, toleranceKcal = 12): boolean {
  const implied =
    m.protein * KCAL_PER_GRAM.protein +
    m.fat * KCAL_PER_GRAM.fat +
    m.carbs * KCAL_PER_GRAM.carbs;
  return Math.abs(implied - m.calories) <= toleranceKcal;
}
