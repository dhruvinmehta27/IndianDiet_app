import { Flame, Beef, Wheat, Droplet, Leaf, Candy, Salad, Zap } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import type { Nutrition } from "@/lib/foodAnalysis";

const ITEMS: {
  key: keyof Nutrition;
  label: string;
  unit: string;
  colorVar: string;
  icon: React.ReactNode;
  decimals?: number;
}[] = [
  { key: "protein", label: "Protein", unit: "g", colorVar: "--macro-protein", icon: <Beef className="h-4 w-4" /> },
  { key: "carbs", label: "Carbs", unit: "g", colorVar: "--macro-carbs", icon: <Wheat className="h-4 w-4" /> },
  { key: "fat", label: "Fat", unit: "g", colorVar: "--macro-fat", icon: <Droplet className="h-4 w-4" /> },
  { key: "fiber", label: "Fiber", unit: "g", colorVar: "--macro-fiber", icon: <Leaf className="h-4 w-4" /> },
  { key: "sugar", label: "Sugar", unit: "g", colorVar: "--macro-carbs", icon: <Candy className="h-4 w-4" /> },
  { key: "sodium", label: "Sodium", unit: "mg", colorVar: "--macro-calories", icon: <Salad className="h-4 w-4" /> },
  { key: "potassium", label: "Potassium", unit: "mg", colorVar: "--macro-fiber", icon: <Zap className="h-4 w-4" /> },
];

/** The large nutrition card body: big calories + a grid of macros/micros. */
export function NutritionGrid({ nutrition }: { nutrition: Nutrition }) {
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 to-macro-calories/10 p-5">
        <Flame className="absolute -right-3 -top-3 h-20 w-20 text-primary/10" />
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Calories</div>
        <div className="flex items-baseline gap-1.5">
          <AnimatedNumber value={nutrition.calories} className="tabular text-5xl font-bold tracking-tight" />
          <span className="text-lg font-medium text-muted-foreground">kcal</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ITEMS.map((it) => (
          <div key={it.key} className="rounded-2xl bg-secondary/40 p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <span style={{ color: `hsl(var(${it.colorVar}))` }}>{it.icon}</span>
              {it.label}
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <AnimatedNumber
                value={nutrition[it.key]}
                decimals={it.decimals ?? 0}
                className="tabular text-xl font-bold"
              />
              <span className="text-xs text-muted-foreground">{it.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
