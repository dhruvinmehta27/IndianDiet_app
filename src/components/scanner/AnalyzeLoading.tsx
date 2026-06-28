import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

const STEPS = [
  "Analyzing ingredients…",
  "Estimating serving size…",
  "Calculating nutrition…",
];

/** Animated multi-step loading state shown while an analysis runs. */
export function AnalyzeLoading() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((a) => Math.min(a + 1, STEPS.length - 1)), 650);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-6 p-2">
      <div className="flex items-center gap-3">
        <span className="relative flex h-10 w-10 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/30" />
          <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </span>
        </span>
        <div>
          <p className="font-semibold">Analyzing your meal</p>
          <p className="text-sm text-muted-foreground">Combining photo, description &amp; portion…</p>
        </div>
      </div>

      <ul className="space-y-3">
        {STEPS.map((step, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <motion.li
              key={step}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: i <= active ? 1 : 0.4, x: 0 }}
              className="flex items-center gap-3 text-sm"
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  done ? "bg-macro-fiber/20 text-macro-fiber" : current ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : current ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : i + 1}
              </span>
              <span className={current ? "font-medium" : "text-muted-foreground"}>{step}</span>
            </motion.li>
          );
        })}
      </ul>

      {/* Skeleton preview */}
      <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-secondary/60" />
        ))}
      </div>
    </div>
  );
}
