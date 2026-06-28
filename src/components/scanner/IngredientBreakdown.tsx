import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/ui/animated-number";
import type { FoodAnalysisResult } from "@/lib/foodAnalysis";

interface Props {
  result: FoodAnalysisResult;
  /** currentGrams / estimatedGrams — scales each contribution with the slider. */
  ratio: number;
}

/** Detected ingredients with their estimated calorie contribution. */
export function IngredientBreakdown({ result, ratio }: Props) {
  const caloric = result.ingredients.filter((i) => i.calories > 0);
  const aromatics = result.ingredients.filter((i) => i.calories === 0);
  const maxKcal = Math.max(...caloric.map((i) => i.calories), 1);

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        {caloric.map((ing) => {
          const kcal = Math.round(ing.calories * ratio);
          return (
            <div key={ing.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-macro-fiber/20 text-macro-fiber">
                    <Check className="h-3 w-3" />
                  </span>
                  <span className="font-medium">{ing.name}</span>
                  <span className="tabular text-xs text-muted-foreground">{Math.round(ing.grams * ratio)} g</span>
                </span>
                <span className="tabular font-semibold">
                  <AnimatedNumber value={kcal} stiffness={240} /> kcal
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  className="h-full rounded-full bg-primary/70"
                  initial={false}
                  animate={{ width: `${(ing.calories / maxKcal) * 100}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 28 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {aromatics.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Also detected
          </p>
          <div className="flex flex-wrap gap-2">
            {aromatics.map((a) => (
              <span
                key={a.name}
                className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-2.5 py-1 text-xs font-medium text-muted-foreground"
              >
                <Check className="h-3 w-3 text-macro-fiber" />
                {a.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
