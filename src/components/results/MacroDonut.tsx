import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { AnimatedNumber } from "@/components/ui/animated-number";
import {
  KCAL_PER_GRAM,
  MACRO_META,
  macroEnergyShare,
  type MacroValues,
} from "@/lib/nutrition";

interface MacroDonutProps {
  macros: MacroValues;
}

/** Large donut of energy split (protein/carbs/fat) with calories at the core. */
export function MacroDonut({ macros }: MacroDonutProps) {
  const share = macroEnergyShare(macros);
  const data = [
    { key: "protein", label: "Protein", value: macros.protein * KCAL_PER_GRAM.protein, pct: share.protein },
    { key: "carbs", label: "Carbs", value: macros.carbs * KCAL_PER_GRAM.carbs, pct: share.carbs },
    { key: "fat", label: "Fat", value: macros.fat * KCAL_PER_GRAM.fat, pct: share.fat },
  ];

  return (
    <div className="relative">
      <div className="mx-auto aspect-square w-full max-w-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="68%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
              cornerRadius={8}
              stroke="none"
              isAnimationActive
              animationDuration={500}
            >
              {data.map((d) => (
                <Cell key={d.key} fill={`hsl(var(${MACRO_META[d.key as keyof typeof MACRO_META].colorVar}))`} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Center readout */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Calories
        </span>
        <AnimatedNumber
          value={macros.calories}
          className="tabular text-4xl font-bold tracking-tight"
        />
        <span className="text-xs text-muted-foreground">kcal / day</span>
      </div>

      {/* Legend */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        {data.map((d) => (
          <div key={d.key} className="flex flex-col items-center gap-0.5">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: `hsl(var(${MACRO_META[d.key as keyof typeof MACRO_META].colorVar}))` }}
              />
              {d.label}
            </span>
            <span className="tabular text-sm font-semibold">
              <AnimatedNumber value={d.pct} decimals={0} />%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
