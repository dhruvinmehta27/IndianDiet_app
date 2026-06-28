import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { MACRO_META, type MacroValues } from "@/lib/nutrition";
import type { Nutrition } from "@/lib/foodAnalysis";
import { clamp } from "@/lib/utils";

interface IntakeProgressProps {
  targets: MacroValues;
  consumed: Nutrition;
  /** Compact variant for tight spaces. */
  dense?: boolean;
}

const ROWS = [
  { key: "calories", unit: "kcal" },
  { key: "protein", unit: "g" },
  { key: "carbs", unit: "g" },
  { key: "fat", unit: "g" },
  { key: "fiber", unit: "g" },
] as const;

/** Today's consumed vs the macro-calculator targets, with progress bars. */
export function IntakeProgress({ targets, consumed, dense }: IntakeProgressProps) {
  return (
    <div className={dense ? "space-y-3" : "space-y-4"}>
      {ROWS.map(({ key, unit }) => {
        const meta = MACRO_META[key];
        const target = targets[key];
        const eaten = Math.round(consumed[key]);
        const remaining = Math.round(target - eaten);
        const pct = clamp((eaten / Math.max(1, target)) * 100, 0, 100);
        const over = eaten > target;
        return (
          <div key={key} className="space-y-1.5">
            <div className="flex items-baseline justify-between text-sm">
              <span className="flex items-center gap-2 font-medium">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: `hsl(var(${meta.colorVar}))` }} />
                {meta.label}
              </span>
              <span className="tabular text-muted-foreground">
                <span className="font-semibold text-foreground">
                  <AnimatedNumber value={eaten} stiffness={240} />
                </span>{" "}
                / {target} {unit}
              </span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: over ? "hsl(var(--macro-calories))" : `hsl(var(${meta.colorVar}))` }}
                initial={false}
                animate={{ width: `${pct}%` }}
                transition={{ type: "spring", stiffness: 180, damping: 26 }}
              />
            </div>
            <div className="tabular text-xs text-muted-foreground">
              {over ? (
                <span className="text-macro-calories">{Math.abs(remaining)} {unit} over target</span>
              ) : (
                <span>{remaining} {unit} remaining</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
