import { Slider } from "@/components/ui/slider";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/utils";

interface LabeledSliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  accentVar?: string;
  hint?: string;
  onChange: (value: number) => void;
  /** Optional formatter for the trailing value badge. */
  format?: (value: number) => string;
}

/** A personal-input slider with a live, prominent value readout. */
export function LabeledSlider({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  accentVar,
  hint,
  onChange,
  format,
}: LabeledSliderProps) {
  return (
    <Field
      label={label}
      htmlFor={id}
      hint={hint}
      trailing={
        <span
          className={cn(
            "tabular rounded-lg bg-secondary/70 px-2.5 py-1 text-sm font-semibold tracking-tight",
          )}
        >
          {format ? format(value) : value}
          {unit && <span className="ml-0.5 text-xs font-medium text-muted-foreground">{unit}</span>}
        </span>
      }
    >
      <Slider
        id={id}
        value={[value]}
        min={min}
        max={max}
        step={step}
        accentVar={accentVar}
        onValueChange={(v) => onChange(v[0])}
        aria-label={label}
      />
    </Field>
  );
}
