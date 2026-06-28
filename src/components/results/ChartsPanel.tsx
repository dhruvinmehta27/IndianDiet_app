import { useDeferredValue } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EnergyBreakdown, MacroValues } from "@/lib/nutrition";
import { MacroDonut } from "./MacroDonut";
import { MacroBar } from "./MacroBar";
import { EnergyFlow } from "./EnergyFlow";

interface ChartsPanelProps {
  macros: MacroValues;
  energy: EnergyBreakdown;
}

export function ChartsPanel({ macros, energy }: ChartsPanelProps) {
  // Charts are the heaviest thing on screen. Render them at a lower priority so
  // dragging a slider updates the thumb + numbers instantly while the donut and
  // bar catch up a frame later — keeps the whole UI feeling snappy.
  const deferredMacros = useDeferredValue(macros);
  return (
    <Card className="glass-strong">
      <CardHeader>
        <CardTitle>Macro breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <EnergyFlow energy={energy} />
        <div className="grid gap-6 sm:grid-cols-2 sm:items-center">
          <MacroDonut macros={deferredMacros} />
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Grams per day
            </p>
            <MacroBar macros={deferredMacros} />
          </div>
        </div>
        {energy.safetyFloorApplied && (
          <p className="rounded-xl bg-macro-fat/10 px-3 py-2 text-xs text-macro-fat">
            A safe-minimum calorie floor was applied — your selected rate would
            otherwise drop intake too low.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
