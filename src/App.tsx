import { motion } from "framer-motion";
import { Sparkles, Calculator, Camera, UtensilsCrossed, Droplets } from "lucide-react";
import { AppStateProvider, useAppState } from "@/store/AppState";
import { usePersistentState } from "@/hooks/usePersistentState";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CalculatorView } from "@/views/CalculatorView";
import { ScannerView } from "@/views/ScannerView";
import { FoodLogView } from "@/views/FoodLogView";
import { WaterView } from "@/views/WaterView";
import { cn } from "@/lib/utils";

type ViewId = "calculator" | "scanner" | "foodlog" | "water";

const TABS: { id: ViewId; label: string; short: string; icon: React.ReactNode }[] = [
  { id: "calculator", label: "Calculator", short: "Macros", icon: <Calculator className="h-4 w-4" /> },
  { id: "scanner", label: "AI Scanner", short: "Scan", icon: <Camera className="h-4 w-4" /> },
  { id: "foodlog", label: "Food Log", short: "Food", icon: <UtensilsCrossed className="h-4 w-4" /> },
  { id: "water", label: "Water", short: "Water", icon: <Droplets className="h-4 w-4" /> },
];

function Shell() {
  const { theme, toggleTheme, mealLog } = useAppState();
  const [storedView, setView] = usePersistentState<ViewId>("dmc-view", "calculator");
  // Guard against a stale value (e.g. the removed "history" tab).
  const view = TABS.some((t) => t.id === storedView) ? storedView : "calculator";

  const consumed = Math.round(mealLog.consumedToday.calories);

  return (
    <div className="min-h-screen">
      <div className="ambient" aria-hidden />

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-macro-calories shadow-lg shadow-primary/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">Dynamic Macro Calculator</h1>
              <p className="text-xs text-muted-foreground sm:text-sm">Real-time, AI-assisted nutrition planning</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {consumed > 0 && (
              <span className="tabular hidden rounded-xl bg-secondary/60 px-3 py-2 text-xs font-medium text-muted-foreground sm:block">
                Today <span className="font-semibold text-foreground">{consumed}</span> kcal
              </span>
            )}
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </header>

        {/* Navigation */}
        <nav className="mb-7 grid grid-cols-4 gap-1.5 rounded-2xl bg-secondary/50 p-1.5 sm:inline-grid sm:auto-cols-max sm:grid-flow-col">
          {TABS.map((tab) => {
            const active = view === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setView(tab.id)}
                className={cn(
                  "relative z-10 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors sm:px-6",
                  active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-xl bg-primary shadow-lg shadow-primary/30"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.short}</span>
              </button>
            );
          })}
        </nav>

        {/* Active view */}
        {view === "calculator" && <CalculatorView />}
        {view === "scanner" && <ScannerView />}
        {view === "foodlog" && <FoodLogView />}
        {view === "water" && <WaterView />}

        <footer className="mt-10 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
          Built on Mifflin-St Jeor / Katch-McArdle BMR, ISSN protein guidance &amp; Atwater factors.
          AI estimates only — not medical advice.
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <Shell />
    </AppStateProvider>
  );
}
