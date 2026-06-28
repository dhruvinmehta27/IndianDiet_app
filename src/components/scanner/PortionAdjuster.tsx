import { Scale } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import type { FoodAnalysisResult } from "@/lib/foodAnalysis";
import { describePortion } from "@/lib/foodAnalysis";

interface PortionAdjusterProps {
  result: FoodAnalysisResult;
  grams: number;
  onChange: (grams: number) => void;
}

/** Live portion slider — every nutrition value upstream recomputes instantly. */
export function PortionAdjuster({ result, grams, onChange }: PortionAdjusterProps) {
  const hasRice = result.ingredients.some((i) => i.role === "rice");
  const hasDrink = result.ingredients.some((i) => i.role === "drink");
  const hasBread = result.ingredients.some((i) => i.role === "bread");
  const display = describePortion(grams, { hasRice, hasDrink, hasBread });

  return (
    <div className="rounded-2xl bg-secondary/40 p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Scale className="h-4 w-4 text-primary" />
          Estimated serving
        </span>
        <span className="tabular rounded-lg bg-background/60 px-2.5 py-1 text-sm font-semibold">
          {grams} g
        </span>
      </div>
      <div className="mt-3">
        <Slider
          value={[grams]}
          min={result.portion.min}
          max={result.portion.max}
          step={5}
          accentVar="--macro-fiber"
          onValueChange={(v) => onChange(v[0])}
          aria-label="Adjust portion size"
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{display}</p>
    </div>
  );
}
