import { motion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";
import { useAppState } from "@/store/AppState";
import { PersonalPanel } from "@/components/inputs/PersonalPanel";
import { ActivityPanel } from "@/components/inputs/ActivityPanel";
import { GoalPanel } from "@/components/inputs/GoalPanel";
import { PreferencesPanel } from "@/components/inputs/PreferencesPanel";
import { MacroSummary } from "@/components/results/MacroSummary";
import { ChartsPanel } from "@/components/results/ChartsPanel";
import { MacroSliders } from "@/components/results/MacroSliders";
import { HealthDashboard } from "@/components/results/HealthDashboard";
import { IntakeProgress } from "@/components/results/IntakeProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FutureModules } from "@/components/FutureModules";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function CalculatorView() {
  const { planner, mealLog } = useAppState();
  const hasIntake = mealLog.todaysEntries.length > 0;

  return (
    <>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <motion.aside
          {...fadeUp}
          transition={{ duration: 0.4 }}
          className="space-y-5 lg:col-span-5 xl:col-span-4"
        >
          <PersonalPanel profile={planner.profile} update={planner.updateProfile} />
          <ActivityPanel profile={planner.profile} update={planner.updateProfile} />
          <GoalPanel profile={planner.profile} update={planner.updateProfile} />
          <PreferencesPanel profile={planner.profile} update={planner.updateProfile} />
        </motion.aside>

        <motion.main
          {...fadeUp}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="space-y-5 lg:col-span-7 xl:col-span-8"
        >
          <MacroSummary macros={planner.macros} />

          {hasIntake && (
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-primary" />
                  Today's intake vs targets
                </CardTitle>
                <span className="text-xs text-muted-foreground">
                  {mealLog.todaysEntries.length} meal{mealLog.todaysEntries.length > 1 ? "s" : ""} logged
                </span>
              </CardHeader>
              <CardContent>
                <IntakeProgress targets={planner.macros} consumed={mealLog.consumedToday} />
              </CardContent>
            </Card>
          )}

          <ChartsPanel macros={planner.macros} energy={planner.result.energy} />
          <MacroSliders
            macros={planner.macros}
            locks={planner.locks}
            isPristine={planner.isPristine}
            onChange={planner.setMacro}
            onToggleLock={planner.toggleLock}
            onReset={planner.resetMacros}
          />
          <HealthDashboard health={planner.health} />
        </motion.main>
      </div>

      <FutureModules />
    </>
  );
}
