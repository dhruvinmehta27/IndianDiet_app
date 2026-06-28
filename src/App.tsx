import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useMacroPlanner } from "@/hooks/useMacroPlanner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PersonalPanel } from "@/components/inputs/PersonalPanel";
import { ActivityPanel } from "@/components/inputs/ActivityPanel";
import { GoalPanel } from "@/components/inputs/GoalPanel";
import { PreferencesPanel } from "@/components/inputs/PreferencesPanel";
import { MacroSummary } from "@/components/results/MacroSummary";
import { ChartsPanel } from "@/components/results/ChartsPanel";
import { MacroSliders } from "@/components/results/MacroSliders";
import { HealthDashboard } from "@/components/results/HealthDashboard";
import { FutureModules } from "@/components/FutureModules";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const planner = useMacroPlanner();

  return (
    <div className="min-h-screen">
      <div className="ambient" aria-hidden />

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-macro-calories shadow-lg shadow-primary/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">
                Dynamic Macro Calculator
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Real-time, science-based nutrition planning
              </p>
            </div>
          </div>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </header>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Inputs */}
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

          {/* Results */}
          <motion.main
            {...fadeUp}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="space-y-5 lg:col-span-7 xl:col-span-8"
          >
            <MacroSummary macros={planner.macros} />
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

        <footer className="mt-10 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
          Built on Mifflin-St Jeor BMR, ISSN protein guidance & Atwater energy
          factors. Estimates only — not medical advice.
        </footer>
      </div>
    </div>
  );
}
