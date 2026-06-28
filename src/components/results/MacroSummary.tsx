import { motion } from "framer-motion";
import { Flame, Beef, Droplet, Wheat, Leaf } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import {
  KCAL_PER_GRAM,
  MACRO_META,
  macroEnergyShare,
  type MacroKey,
  type MacroValues,
} from "@/lib/nutrition";
import { cn } from "@/lib/utils";

const ICONS: Record<MacroKey, React.ReactNode> = {
  calories: <Flame className="h-5 w-5" />,
  protein: <Beef className="h-5 w-5" />,
  fat: <Droplet className="h-5 w-5" />,
  carbs: <Wheat className="h-5 w-5" />,
  fiber: <Leaf className="h-5 w-5" />,
};

interface MacroSummaryProps {
  macros: MacroValues;
}

export function MacroSummary({ macros }: MacroSummaryProps) {
  const share = macroEnergyShare(macros);

  const cards: {
    key: MacroKey;
    value: number;
    sub: string;
  }[] = [
    { key: "calories", value: macros.calories, sub: "per day" },
    { key: "protein", value: macros.protein, sub: `${Math.round(share.protein)}% • ${macros.protein * KCAL_PER_GRAM.protein} kcal` },
    { key: "carbs", value: macros.carbs, sub: `${Math.round(share.carbs)}% • ${macros.carbs * KCAL_PER_GRAM.carbs} kcal` },
    { key: "fat", value: macros.fat, sub: `${Math.round(share.fat)}% • ${macros.fat * KCAL_PER_GRAM.fat} kcal` },
    { key: "fiber", value: macros.fiber, sub: "target intake" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((c, i) => {
        const meta = MACRO_META[c.key];
        return (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className={cn(
              "glass relative overflow-hidden rounded-2xl p-4",
              c.key === "calories" && "col-span-2 sm:col-span-1",
            )}
          >
            <div
              className="absolute -right-5 -top-5 h-20 w-20 rounded-full opacity-20 blur-2xl"
              style={{ background: `hsl(var(${meta.colorVar}))` }}
            />
            <div className="flex items-center gap-2">
              <span style={{ color: `hsl(var(${meta.colorVar}))` }}>{ICONS[c.key]}</span>
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {meta.label}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <AnimatedNumber
                value={c.value}
                className="tabular text-3xl font-bold tracking-tight"
              />
              <span className="text-sm font-medium text-muted-foreground">{meta.unit}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground tabular">{c.sub}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
