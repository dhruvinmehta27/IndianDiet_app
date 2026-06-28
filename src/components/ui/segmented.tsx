import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedProps<T extends string> {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  /** layoutId namespace so multiple segmented controls don't share the pill. */
  name: string;
  className?: string;
}

/**
 * An animated segmented control (Apple-style). The active pill slides between
 * options using a shared Framer Motion layout animation.
 */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  name,
  className,
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "relative grid auto-cols-fr grid-flow-col gap-1 rounded-2xl bg-secondary/70 p-1",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative z-10 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={`segmented-${name}`}
                className="absolute inset-0 -z-10 rounded-xl bg-primary shadow-lg shadow-primary/30"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            {opt.icon}
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
