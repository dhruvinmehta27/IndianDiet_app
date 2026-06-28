import { memo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { MACRO_META, type MacroKey, type MacroValues } from "@/lib/nutrition";

interface MacroBarProps {
  macros: MacroValues;
}

const KEYS: MacroKey[] = ["protein", "carbs", "fat", "fiber"];

/** Grams-per-macro bar chart (protein, carbs, fat, fiber). */
function MacroBarBase({ macros }: MacroBarProps) {
  const data = KEYS.map((k) => ({
    key: k,
    label: MACRO_META[k].label,
    grams: macros[k],
  }));

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 22, right: 8, left: 8, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <YAxis hide domain={[0, "dataMax + 40"]} />
          <Bar dataKey="grams" radius={[8, 8, 8, 8]} isAnimationActive={false}>
            {data.map((d) => (
              <Cell key={d.key} fill={`hsl(var(${MACRO_META[d.key].colorVar}))`} />
            ))}
            <LabelList
              dataKey="grams"
              position="top"
              formatter={(v: number) => `${v}g`}
              style={{ fill: "hsl(var(--foreground))", fontSize: 12, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export const MacroBar = memo(MacroBarBase);
