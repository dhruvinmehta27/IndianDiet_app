import { motion } from "framer-motion";
import { TrendingDown, Minus, TrendingUp, Dumbbell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import {
  GOALS,
  WEEKLY_TARGETS,
  type GoalId,
  type UserProfile,
  type WeeklyTargetKg,
} from "@/lib/nutrition";
import { cn } from "@/lib/utils";

const GOAL_ICONS: Record<GoalId, React.ReactNode> = {
  "lose-fat": <TrendingDown className="h-4 w-4" />,
  maintain: <Minus className="h-4 w-4" />,
  "lean-bulk": <TrendingUp className="h-4 w-4" />,
  "muscle-gain": <Dumbbell className="h-4 w-4" />,
};

interface GoalPanelProps {
  profile: UserProfile;
  update: (patch: Partial<UserProfile>) => void;
}

export function GoalPanel({ profile, update }: GoalPanelProps) {
  const weeklyIndex = WEEKLY_TARGETS.findIndex(
    (w) => w.value === profile.weeklyTargetKg,
  );
  const weekly = WEEKLY_TARGETS[Math.max(0, weeklyIndex)];
  const activeGoal = GOALS.find((g) => g.id === profile.goal) ?? GOALS[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Goal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-2">
          {GOALS.map((g) => {
            const active = g.id === profile.goal;
            return (
              <button
                key={g.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => update({ goal: g.id })}
                className={cn(
                  "relative flex flex-col items-start gap-1 rounded-2xl border p-3.5 text-left transition-colors",
                  active
                    ? "border-primary/60 bg-accent/60"
                    : "border-border bg-secondary/40 hover:bg-secondary/70",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="goal-active"
                    className="absolute inset-0 -z-10 rounded-2xl ring-2 ring-primary/50"
                    transition={{ type: "spring", stiffness: 360, damping: 30 }}
                  />
                )}
                <span
                  className={cn(
                    "flex items-center gap-2 text-sm font-semibold",
                    active ? "text-foreground" : "text-foreground/90",
                  )}
                >
                  <span className={active ? "text-primary" : "text-muted-foreground"}>
                    {GOAL_ICONS[g.id]}
                  </span>
                  {g.label}
                </span>
                <span className="text-xs leading-snug text-muted-foreground">
                  {g.description}
                </span>
              </button>
            );
          })}
        </div>

        <Field
          label="Weekly Target"
          trailing={
            <span className="tabular rounded-lg bg-secondary/70 px-2.5 py-1 text-sm font-semibold">
              {weekly.short} kg/wk
            </span>
          }
          hint={describeWeekly(profile.weeklyTargetKg, activeGoal.direction)}
        >
          <Slider
            value={[Math.max(0, weeklyIndex)]}
            min={0}
            max={WEEKLY_TARGETS.length - 1}
            step={1}
            accentVar={profile.weeklyTargetKg < 0 ? "--macro-fiber" : profile.weeklyTargetKg > 0 ? "--macro-calories" : "--primary"}
            aria-label="Weekly weight-change target"
            onValueChange={(v) =>
              update({ weeklyTargetKg: WEEKLY_TARGETS[v[0]].value as WeeklyTargetKg })
            }
          />
          <div className="mt-1.5 flex justify-between text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            <span>Lose</span>
            <span>Maintain</span>
            <span>Gain</span>
          </div>
        </Field>
      </CardContent>
    </Card>
  );
}

function describeWeekly(value: WeeklyTargetKg, _direction: string): string {
  if (value === 0) return "Energy balanced at maintenance.";
  const kcal = Math.round((Math.abs(value) * 7700) / 7);
  return value < 0
    ? `≈ ${kcal} kcal daily deficit (${Math.abs(value)} kg/week).`
    : `≈ ${kcal} kcal daily surplus (${value} kg/week).`;
}
