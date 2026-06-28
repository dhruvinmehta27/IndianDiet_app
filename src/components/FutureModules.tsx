import {
  UtensilsCrossed,
  Bot,
  ShoppingCart,
  ScanBarcode,
  LineChart,
  CalendarSync,
  Timer,
  GlassWater,
  Pill,
  ChefHat,
  HeartPulse,
  Watch,
} from "lucide-react";
import { motion } from "framer-motion";

/**
 * A non-interactive showcase of the roadmap modules. The engine and state are
 * already structured (framework-agnostic `lib/nutrition`, single planner hook)
 * so each of these can plug in without refactoring the core.
 */
const MODULES = [
  { icon: UtensilsCrossed, label: "Meal Planner" },
  { icon: Bot, label: "AI Nutrition Coach" },
  { icon: ShoppingCart, label: "Grocery Planner" },
  { icon: ScanBarcode, label: "Barcode Scanner" },
  { icon: LineChart, label: "Progress Tracking" },
  { icon: CalendarSync, label: "Calorie Cycling" },
  { icon: Timer, label: "Fasting Planner" },
  { icon: GlassWater, label: "Water Tracker" },
  { icon: Pill, label: "Supplements" },
  { icon: ChefHat, label: "Recipe Generator" },
  { icon: HeartPulse, label: "Apple / Google Fit" },
  { icon: Watch, label: "Wearable Sync" },
];

export function FutureModules() {
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Roadmap — ready to plug in
        </h2>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {MODULES.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03, duration: 0.3 }}
            className="glass flex items-center gap-2.5 rounded-xl p-3 text-sm"
          >
            <m.icon className="h-4 w-4 shrink-0 text-primary/80" />
            <span className="truncate font-medium text-muted-foreground">{m.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
