# Dynamic Macro Calculator

A premium, real-time nutrition planning tool. Every value — calories, protein,
fat, carbohydrates and fiber — updates **live** as you move sliders. There is no
"Calculate" button: the whole interface reacts instantly.

Built to feel like an Apple-quality nutrition app: glassmorphism cards,
animated counting numbers, smooth springy sliders, dark/light themes and a fully
responsive layout.

## Highlights

- **Live everything.** Personal inputs, activity, goal and weekly target all
  recompute the full plan in real time.
- **Correct nutrition science.** Mifflin-St Jeor BMR → activity TDEE → goal
  calorie delta derived from the weekly rate (7700 kcal/kg). Protein anchored to
  **target** bodyweight (ISSN guidance), fat with a 45 g floor, fiber at 14 g per
  1000 kcal, and **carbs always calculated last** so calories always balance.
- **Synchronized macro sliders with a lock system.** Drag any macro and the rest
  rebalance to keep `calories = 4·protein + 9·fat + 4·carbs`. Lock 🔒 any macro to
  pin it while the others move.
- **Charts.** Large donut (energy split) + grams bar chart, both animated.
- **Health dashboard.** BMI, healthy weight range, estimated body fat, lean mass,
  BMR, TDEE, deficit/surplus, protein, water, steps and sleep.

## AI Image Calorie Calculator

A specialized AI nutrition assistant (not a generic classifier) that estimates
calories & macros from a **food photo + short description + portion hint**:

- Drag-drop / upload / **camera** capture, description chips, portion presets or
  free-text ("250 g", "2 rotis").
- Animated multi-step analysis → a large nutrition card (calories, protein,
  carbs, fat, fiber, sugar, sodium, potassium) with a **confidence score**.
- **Ingredient breakdown** with per-item calorie contribution, **live portion
  slider** (everything rescales instantly), accuracy reasons, AI suggestions,
  and **manual correction** (keeps both the AI estimate and your edit).
- **Add to Today's Intake** → updates the macro dashboard immediately, with a
  **compare-vs-targets** view and a searchable **History** of past meals.

### Swappable AI providers

Business logic lives in `src/lib/foodAnalysis/`, fully separated from the UI.
Every provider implements one `FoodAnalysisProvider` contract, so vendors swap
without touching components:

- `HeuristicProvider` — the **offline default**: parses the description, matches
  a multi-cuisine food knowledge base, applies prep modifiers (less oil, ghee,
  restaurant…) and portion sizing. Works with **no API key**.
- `RemoteVisionProvider` — drop-in adapters for **OpenAI / Gemini / Claude
  Vision** (gated on an API key; the registry falls back to the heuristic).
- The same seam is ready for USDA FoodData Central, OpenFoodFacts, Nutritionix
  and Edamam.

## Tech stack

React · TypeScript · Tailwind CSS · shadcn/ui-style Radix primitives ·
Framer Motion · Recharts · Vite.

## Architecture

Business logic is fully separated from UI. The **single calculation engine**
lives in `src/lib/nutrition/` and is framework-agnostic (no React) so it can be
reused by every future module:

```
src/lib/nutrition/
  types.ts        # domain types (no UI concerns)
  constants.ts    # activity levels, goals, diets, bounds, macro metadata
  engine.ts       # BMR, TDEE, energy, the macro split  ← single source of truth
  rebalance.ts    # the synchronized slider / lock engine
  health.ts       # BMI, body-fat, lifestyle recommendations
  index.ts        # public barrel

src/hooks/
  useMacroPlanner.ts  # the one piece of app state every panel reads from
  useTheme.ts

src/components/
  ui/         # reusable shadcn-style primitives
  inputs/     # input panels (personal, activity, goal, preferences)
  results/    # summary cards, charts, macro sliders, health dashboard
```

No calculation is duplicated in the UI — components only render values produced
by the engine.

### Ready for future modules

The brief's roadmap (meal planner, AI coach, grocery planner, barcode scanner,
progress tracking, calorie cycling, fasting planner, water tracker, supplements,
recipe generator, Apple Health / Google Fit, wearable sync) can plug into the
existing `lib/nutrition` engine and `useMacroPlanner` state without refactoring
the core. Diet preference and ethnicity are already captured for that purpose.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build
npm run preview  # preview the production build
```

## Worked example (matches the engine output)

Male · 37 · 178 cm · 80 → 72 kg · Moderately Active · Lose Fat · 0.5 kg/week

| Quantity | Value |
| --- | --- |
| BMR (Mifflin-St Jeor) | 1733 kcal |
| TDEE (× 1.55) | 2685 kcal |
| Goal calories (−550) | 2135 kcal |
| Protein (1.9 × 72) | 137 g |
| Fat (0.7 × 72) | 50 g |
| Fiber (2135 × 14 / 1000) | 30 g |
| Carbs (remaining energy) | 284 g |

> Estimates only — not medical advice.
