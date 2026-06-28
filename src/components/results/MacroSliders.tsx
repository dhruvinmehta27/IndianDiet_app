import { Lock, LockOpen, RotateCcw, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { AnimatedNumber } from "@/components/ui/animated-number";
import {
  MACRO_META,
  MACRO_SLIDER_BOUNDS,
  isBalanced,
  type MacroKey,
  type MacroLocks,
  type MacroValues,
} from "@/lib/nutrition";
import { cn } from "@/lib/utils";

const ORDER: MacroKey[] = ["calories", "protein", "carbs", "fat", "fiber"];

interface MacroSlidersProps {
  macros: MacroValues;
  locks: MacroLocks;
  isPristine: boolean;
  onChange: (key: MacroKey, value: number) => void;
  onToggleLock: (key: MacroKey) => void;
  onReset: () => void;
}

export function MacroSliders({
  macros,
  locks,
  isPristine,
  onChange,
  onToggleLock,
  onReset,
}: MacroSlidersProps) {
  const balanced = isBalanced(macros);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Fine-tune macros</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag any slider — the rest rebalance live. Lock 🔒 to pin a value.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "hidden items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium sm:flex",
              balanced
                ? "bg-macro-fiber/15 text-macro-fiber"
                : "bg-macro-calories/15 text-macro-calories",
            )}
          >
            <Check className="h-3.5 w-3.5" />
            {balanced ? "Calories balanced" : "Rebalancing…"}
          </span>
          {!isPristine && (
            <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {ORDER.map((key) => {
          const meta = MACRO_META[key];
          const bounds = MACRO_SLIDER_BOUNDS[key];
          const locked = locks[key];
          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onToggleLock(key)}
                  className={cn(
                    "group flex items-center gap-2 rounded-lg px-1.5 py-1 text-sm font-medium transition-colors",
                    locked ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-pressed={locked}
                  aria-label={`${locked ? "Unlock" : "Lock"} ${meta.label}`}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
                      locked ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground group-hover:bg-secondary/70",
                    )}
                  >
                    {locked ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
                  </span>
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: `hsl(var(${meta.colorVar}))` }}
                  />
                  {meta.label}
                </button>
                <span className="tabular flex items-baseline gap-1 text-sm font-semibold">
                  <AnimatedNumber value={macros[key]} stiffness={260} />
                  <span className="text-xs font-medium text-muted-foreground">{meta.unit}</span>
                </span>
              </div>
              <div className={cn("transition-opacity", locked && "opacity-60")}>
                <Slider
                  value={[macros[key]]}
                  min={bounds.min}
                  max={bounds.max}
                  step={bounds.step}
                  accentVar={meta.colorVar}
                  disabled={locked}
                  onValueChange={(v) => onChange(key, v[0])}
                  aria-label={`Adjust ${meta.label}`}
                />
              </div>
              {locked && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-xs text-primary/80"
                >
                  Pinned — other macros move to keep calories consistent.
                </motion.p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
