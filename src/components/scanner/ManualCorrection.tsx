import { Pencil, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CorrectableKey = "calories" | "protein" | "carbs" | "fat" | "fiber";

const FIELDS: { key: CorrectableKey; label: string; unit: string }[] = [
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "carbs", label: "Carbs", unit: "g" },
  { key: "fat", label: "Fat", unit: "g" },
  { key: "fiber", label: "Fiber", unit: "g" },
];

interface Props {
  /** AI values at the current portion (the baseline being corrected). */
  base: Record<CorrectableKey, number>;
  /** Current effective values (base merged with any correction). */
  values: Record<CorrectableKey, number>;
  corrected: boolean;
  onChange: (key: CorrectableKey, value: number) => void;
  onReset: () => void;
}

/** Inline editor for the five tracked values; keeps the AI estimate alongside. */
export function ManualCorrection({ base, values, corrected, onChange, onReset }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Pencil className="h-4 w-4 text-primary" />
          Manual correction
        </span>
        {corrected && (
          <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
            <RotateCcw className="h-3.5 w-3.5" /> Revert to AI
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {FIELDS.map((f) => {
          const changed = Math.round(values[f.key]) !== Math.round(base[f.key]);
          return (
            <label key={f.key} className="block">
              <span className="text-xs text-muted-foreground">{f.label}</span>
              <div
                className={cn(
                  "mt-1 flex items-center rounded-xl border bg-secondary/40 px-2.5",
                  changed ? "border-primary/60" : "border-border",
                )}
              >
                <input
                  type="number"
                  inputMode="decimal"
                  value={Math.round(values[f.key])}
                  onChange={(e) => onChange(f.key, Math.max(0, Number(e.target.value) || 0))}
                  className="tabular w-full bg-transparent py-2 text-sm font-semibold outline-none"
                />
                <span className="text-[10px] text-muted-foreground">{f.unit}</span>
              </div>
            </label>
          );
        })}
      </div>
      {corrected && (
        <p className="text-xs text-muted-foreground">
          Your corrected values will be logged. The original AI estimate is kept for analytics.
        </p>
      )}
    </div>
  );
}
