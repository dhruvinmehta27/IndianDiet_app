import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { clamp } from "@/lib/utils";

interface WaterRingProps {
  ml: number;
  goalMl: number;
  size?: number;
}

/** Circular water-intake progress ring with a live litre readout. */
export function WaterRing({ ml, goalMl, size = 200 }: WaterRingProps) {
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = clamp(ml / Math.max(1, goalMl), 0, 1);
  const litres = ml / 1000;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--secondary))" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--macro-protein))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="flex items-baseline gap-1">
          <AnimatedNumber value={litres} decimals={2} className="tabular text-4xl font-bold tracking-tight" />
          <span className="text-base font-medium text-muted-foreground">L</span>
        </span>
        <span className="tabular text-xs text-muted-foreground">of {(goalMl / 1000).toFixed(2)} L goal</span>
        <span className="mt-1 tabular text-sm font-semibold text-macro-protein">{Math.round(pct * 100)}%</span>
      </div>
    </div>
  );
}
