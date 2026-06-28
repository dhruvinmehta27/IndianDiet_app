import { ArrowRight } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import type { EnergyBreakdown } from "@/lib/nutrition";
import { cn } from "@/lib/utils";

interface EnergyFlowProps {
  energy: EnergyBreakdown;
}

/** Transparent BMR → TDEE → goal-calorie pipeline, so the math is never hidden. */
export function EnergyFlow({ energy }: EnergyFlowProps) {
  const steps = [
    { label: "BMR", value: energy.bmr, sub: "Mifflin-St Jeor" },
    { label: "TDEE", value: energy.tdee, sub: `× ${energy.activityMultiplier} activity` },
    {
      label: "Goal",
      value: energy.goalCalories,
      sub:
        energy.calorieDelta === 0
          ? "maintenance"
          : `${energy.calorieDelta > 0 ? "+" : ""}${energy.calorieDelta} kcal`,
      highlight: true,
    },
  ];

  return (
    <div className="flex items-stretch gap-2">
      {steps.map((s, i) => (
        <div key={s.label} className="flex flex-1 items-center gap-2">
          <div
            className={cn(
              "flex-1 rounded-2xl p-3 text-center",
              s.highlight ? "bg-primary/15 ring-1 ring-primary/30" : "bg-secondary/50",
            )}
          >
            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {s.label}
            </div>
            <div
              className={cn(
                "tabular text-xl font-bold tracking-tight",
                s.highlight && "text-primary",
              )}
            >
              <AnimatedNumber value={s.value} />
            </div>
            <div className="text-[10px] text-muted-foreground">{s.sub}</div>
          </div>
          {i < steps.length - 1 && (
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
        </div>
      ))}
    </div>
  );
}
