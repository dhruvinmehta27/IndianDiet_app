import { useState } from "react";
import { GlassWater, Plus, Undo2, Droplets, Minus } from "lucide-react";
import { useAppState } from "@/store/AppState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WaterRing } from "@/components/water/WaterRing";
import { clamp, cn } from "@/lib/utils";

const QUICK = [
  { ml: 250, label: "Glass", sub: "250 ml" },
  { ml: 500, label: "Bottle", sub: "500 ml" },
  { ml: 750, label: "Large", sub: "750 ml" },
];

const GLASS_ML = 250;

export function WaterView() {
  const { planner, waterLog } = useAppState();
  const [custom, setCustom] = useState("");

  const recommendedMl = Math.round(planner.health.waterLitres * 1000);
  const goalMl = waterLog.goalOverrideMl ?? recommendedMl;
  const remaining = Math.max(0, goalMl - waterLog.todayMl);
  const goalGlasses = Math.max(1, Math.round(goalMl / GLASS_ML));
  const filledGlasses = clamp(Math.round(waterLog.todayMl / GLASS_ML), 0, goalGlasses);

  function adjustGoal(deltaMl: number) {
    const base = waterLog.goalOverrideMl ?? recommendedMl;
    const next = clamp(base + deltaMl, 1000, 6000);
    waterLog.setGoalOverride(next === recommendedMl ? null : next);
  }

  function addCustom() {
    const ml = Math.round(Number(custom));
    if (ml > 0) {
      waterLog.addWater(ml);
      setCustom("");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-macro-protein/15 text-macro-protein">
          <Droplets className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold">Water intake</h2>
          <p className="text-sm text-muted-foreground">Stay hydrated — goal is set from your body weight &amp; activity.</p>
        </div>
      </div>

      <Card className="glass-strong">
        <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-center sm:justify-around">
          <WaterRing ml={waterLog.todayMl} goalMl={goalMl} />

          <div className="w-full max-w-xs space-y-4">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl bg-secondary/40 p-3">
                <div className="tabular text-2xl font-bold">{(waterLog.todayMl / 1000).toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">litres today</div>
              </div>
              <div className="rounded-2xl bg-secondary/40 p-3">
                <div className="tabular text-2xl font-bold">{(remaining / 1000).toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">litres left</div>
              </div>
            </div>

            {/* Glasses visualization */}
            <div className="flex flex-wrap justify-center gap-1.5">
              {Array.from({ length: goalGlasses }).map((_, i) => (
                <GlassWater
                  key={i}
                  className={cn("h-5 w-5 transition-colors", i < filledGlasses ? "text-macro-protein" : "text-secondary-foreground/25")}
                />
              ))}
            </div>

            {/* Goal editor */}
            <div className="flex items-center justify-between rounded-xl bg-secondary/40 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Daily goal</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Lower goal" onClick={() => adjustGoal(-250)}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="tabular w-16 text-center font-semibold">{(goalMl / 1000).toFixed(2)} L</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Raise goal" onClick={() => adjustGoal(250)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {waterLog.goalOverrideMl != null && (
              <button
                type="button"
                onClick={() => waterLog.setGoalOverride(null)}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
              >
                Reset to recommended ({(recommendedMl / 1000).toFixed(2)} L)
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick add */}
      <Card>
        <CardHeader>
          <CardTitle>Log a drink</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {QUICK.map((q) => (
              <button
                key={q.ml}
                type="button"
                onClick={() => waterLog.addWater(q.ml)}
                className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-secondary/40 p-4 transition-colors hover:border-macro-protein/50 hover:bg-macro-protein/10"
              >
                <GlassWater className="h-6 w-6 text-macro-protein" />
                <span className="text-sm font-semibold">{q.label}</span>
                <span className="text-xs text-muted-foreground">{q.sub}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustom()}
              placeholder="Custom ml"
              className="tabular h-11 w-full rounded-xl border border-input bg-secondary/40 px-3.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <Button onClick={addCustom} disabled={!(Number(custom) > 0)}>
              <Plus className="h-4 w-4" /> Add
            </Button>
            <Button
              variant="secondary"
              onClick={waterLog.undoLast}
              disabled={waterLog.todayEntries.length === 0}
              aria-label="Undo last"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </div>

          {waterLog.todayEntries.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {waterLog.todayEntries.slice(0, 12).map((e) => (
                <span key={e.id} className="tabular rounded-lg bg-secondary/50 px-2.5 py-1 text-xs text-muted-foreground">
                  +{e.ml} ml · {new Date(e.at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
