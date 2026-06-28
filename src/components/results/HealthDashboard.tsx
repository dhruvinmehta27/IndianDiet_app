import {
  Scale,
  HeartPulse,
  Percent,
  Dumbbell,
  Flame,
  Gauge,
  TrendingDown,
  Beef,
  GlassWater,
  Footprints,
  Moon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import type { HealthIndicators } from "@/lib/nutrition";
import { cn } from "@/lib/utils";

interface HealthDashboardProps {
  health: HealthIndicators;
}

interface Tile {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  detail?: string;
  tone?: string;
}

export function HealthDashboard({ health }: HealthDashboardProps) {
  const deficit = health.calorieDelta;
  const bmiTone =
    health.bmiCategory === "Healthy"
      ? "text-macro-fiber"
      : health.bmiCategory === "Underweight"
        ? "text-macro-fat"
        : "text-macro-calories";

  const tiles: Tile[] = [
    {
      icon: <Scale className="h-4 w-4" />,
      label: "BMI",
      value: <AnimatedNumber value={health.bmi} decimals={1} />,
      detail: health.bmiCategory,
      tone: bmiTone,
    },
    {
      icon: <HeartPulse className="h-4 w-4" />,
      label: "Healthy Range",
      value: (
        <span className="tabular">
          {health.healthyWeightRange[0]}–{health.healthyWeightRange[1]}
        </span>
      ),
      detail: "kg for your height",
    },
    {
      icon: <Percent className="h-4 w-4" />,
      label: "Body Fat",
      value: (
        <>
          <AnimatedNumber value={health.bodyFatPercent} decimals={1} />%
        </>
      ),
      detail: health.bodyFatMeasured ? "measured" : "estimated",
      tone: health.bodyFatMeasured ? "text-macro-fat" : undefined,
    },
    {
      icon: <Dumbbell className="h-4 w-4" />,
      label: "Lean Mass",
      value: (
        <>
          <AnimatedNumber value={health.leanBodyMassKg} decimals={1} /> kg
        </>
      ),
      detail: "fat-free mass",
    },
    {
      icon: <Flame className="h-4 w-4" />,
      label: "BMR",
      value: <AnimatedNumber value={health.bmr} />,
      detail: "kcal at rest",
    },
    {
      icon: <Gauge className="h-4 w-4" />,
      label: "TDEE",
      value: <AnimatedNumber value={health.tdee} />,
      detail: "maintenance kcal",
    },
    {
      icon: <TrendingDown className="h-4 w-4" />,
      label: deficit <= 0 ? "Daily Deficit" : "Daily Surplus",
      value: (
        <span className={cn("tabular", deficit < 0 ? "text-macro-fiber" : deficit > 0 ? "text-macro-calories" : "")}>
          {deficit > 0 ? "+" : ""}
          <AnimatedNumber value={deficit} />
        </span>
      ),
      detail: "kcal vs maintenance",
    },
    {
      icon: <Beef className="h-4 w-4" />,
      label: "Daily Protein",
      value: (
        <>
          <AnimatedNumber value={health.proteinGramsTarget} /> g
        </>
      ),
      detail: "muscle-sparing target",
    },
    {
      icon: <GlassWater className="h-4 w-4" />,
      label: "Water",
      value: (
        <>
          <AnimatedNumber value={health.waterLitres} decimals={1} /> L
        </>
      ),
      detail: "recommended intake",
    },
    {
      icon: <Footprints className="h-4 w-4" />,
      label: "Steps",
      value: <AnimatedNumber value={health.stepsTarget} />,
      detail: "daily target",
    },
    {
      icon: <Moon className="h-4 w-4" />,
      label: "Sleep",
      value: (
        <span className="tabular">
          {health.sleepHours[0]}–{health.sleepHours[1]} h
        </span>
      ),
      detail: "for recovery",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health & lifestyle indicators</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {tiles.map((t) => (
            <div
              key={t.label}
              className="rounded-2xl bg-secondary/40 p-3.5 transition-colors hover:bg-secondary/60"
            >
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="text-primary">{t.icon}</span>
                <span className="text-xs font-medium uppercase tracking-wide">{t.label}</span>
              </div>
              <div className={cn("mt-1.5 text-2xl font-bold tracking-tight tabular", t.tone)}>
                {t.value}
              </div>
              {t.detail && <div className="text-xs text-muted-foreground">{t.detail}</div>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
