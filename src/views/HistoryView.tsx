import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, RotateCw, Trash2, History, ImageOff } from "lucide-react";
import { useAppState } from "@/store/AppState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "@/components/scanner/ConfidenceIndicator";
import { levelFor } from "@/lib/foodAnalysis";

function formatDate(ms: number): string {
  const d = new Date(ms);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86400000);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (sameDay(d, today)) return `Today, ${time}`;
  if (sameDay(d, yesterday)) return `Yesterday, ${time}`;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" }) + `, ${time}`;
}

export function HistoryView() {
  const { mealLog } = useAppState();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? mealLog.entries.filter((e) => e.name.toLowerCase().includes(q)) : mealLog.entries;
  }, [mealLog.entries, query]);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <History className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold">Meal history</h2>
          <p className="text-sm text-muted-foreground">
            {mealLog.entries.length} logged meal{mealLog.entries.length === 1 ? "" : "s"} · search and re-use any of them
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search meals…"
          className="h-11 w-full rounded-xl border border-input bg-secondary/40 pl-10 pr-3.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-14 text-center">
            <ImageOff className="h-8 w-8 text-muted-foreground/60" />
            <p className="font-medium">{mealLog.entries.length === 0 ? "No meals logged yet" : "No matches"}</p>
            <p className="text-sm text-muted-foreground">
              {mealLog.entries.length === 0
                ? "Analyze a food photo and tap “Add to Today's Intake”."
                : "Try a different search term."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
            >
              <Card>
                <CardContent className="flex items-center gap-3 p-3">
                  {e.thumbnail ? (
                    <img src={e.thumbnail} alt={e.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                      <ImageOff className="h-5 w-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold">{e.name}</p>
                      {e.corrected && (
                        <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          edited
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(e.createdAt)}</p>
                    <p className="tabular mt-1 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{Math.round(e.nutrition.calories)}</span> kcal · P{" "}
                      {Math.round(e.nutrition.protein)} · C {Math.round(e.nutrition.carbs)} · F {Math.round(e.nutrition.fat)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <ConfidenceBadge
                      report={{ score: e.confidence, level: levelFor(e.confidence), reasons: [] }}
                    />
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Re-log this meal"
                        onClick={() => mealLog.reuseEntry(e.id)}
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-macro-calories"
                        aria-label="Delete"
                        onClick={() => mealLog.removeEntry(e.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
