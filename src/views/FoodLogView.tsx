import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Plus,
  Trash2,
  RotateCw,
  Pencil,
  UtensilsCrossed,
  Check,
} from "lucide-react";
import { useAppState } from "@/store/AppState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { Segmented } from "@/components/ui/segmented";
import { IntakeProgress } from "@/components/results/IntakeProgress";
import {
  EMPTY_NUTRITION,
  FOODS,
  nutritionFromPer100g,
  type FoodItem,
  type Nutrition,
} from "@/lib/foodAnalysis";
import type { MealLogEntry } from "@/hooks/useMealLog";

type Mode = "search" | "custom";

function newId() {
  return `meal_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function FoodLogView() {
  const { planner, mealLog } = useAppState();
  const [mode, setMode] = useState<Mode>("search");

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <UtensilsCrossed className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold">Food log</h2>
          <p className="text-sm text-muted-foreground">Add meals by search or manually — your dashboard updates instantly.</p>
        </div>
      </div>

      {/* Add food */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Add food</CardTitle>
          <Segmented<Mode>
            name="food-mode"
            value={mode}
            onChange={setMode}
            className="w-auto"
            options={[
              { value: "search", label: "Search" },
              { value: "custom", label: "Custom" },
            ]}
          />
        </CardHeader>
        <CardContent>
          {mode === "search" ? <SearchAdd onAdd={mealLog.addEntry} /> : <CustomAdd onAdd={mealLog.addEntry} />}
        </CardContent>
      </Card>

      {/* Today */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Today's intake</CardTitle>
          {mealLog.todaysEntries.length > 0 && (
            <Button variant="ghost" size="sm" onClick={mealLog.clearToday} className="text-muted-foreground">
              Clear day
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <IntakeProgress targets={planner.macros} consumed={mealLog.consumedToday} dense />
          {mealLog.todaysEntries.length === 0 ? (
            <p className="rounded-xl bg-secondary/40 px-3 py-3 text-center text-sm text-muted-foreground">
              Nothing logged yet today.
            </p>
          ) : (
            <ul className="space-y-2">
              {mealLog.todaysEntries.map((e) => (
                <EntryRow key={e.id} entry={e} onRemove={() => mealLog.removeEntry(e.id)} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <RecentMeals />
    </div>
  );
}

/* ----------------------------- search adder ------------------------------ */

function SearchAdd({ onAdd }: { onAdd: (e: MealLogEntry) => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState(0);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? FOODS.filter((f) => f.name.toLowerCase().includes(q) || f.aliases.some((a) => a.includes(q)))
      : FOODS.slice(0, 8);
    return list.slice(0, 8);
  }, [query]);

  function select(food: FoodItem) {
    setSelected(food);
    setGrams(food.servingG);
  }

  function add() {
    if (!selected) return;
    const nutrition = nutritionFromPer100g(selected.per100g, grams);
    onAdd({
      id: newId(),
      name: selected.name,
      createdAt: Date.now(),
      grams,
      nutrition,
      aiNutrition: nutrition,
      corrected: false,
      confidence: 85,
      provider: "database",
    });
    setJustAdded(selected.name);
    setSelected(null);
    setQuery("");
    setTimeout(() => setJustAdded(null), 1800);
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
          }}
          placeholder="Search foods — dal, roti, paneer, pizza…"
          className="h-11 w-full rounded-xl border border-input bg-secondary/40 pl-10 pr-3.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {justAdded && (
        <p className="flex items-center gap-2 text-xs text-macro-fiber">
          <Check className="h-3.5 w-3.5" /> Added {justAdded} to today.
        </p>
      )}

      {!selected ? (
        <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60">
          {results.map((f) => {
            const kcal = Math.round(nutritionFromPer100g(f.per100g, f.servingG).calories);
            return (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => select(f)}
                  className="flex w-full items-center justify-between gap-3 bg-secondary/20 px-3 py-2.5 text-left transition-colors hover:bg-secondary/50"
                >
                  <span>
                    <span className="text-sm font-medium">{f.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{f.cuisine ?? "Food"}</span>
                  </span>
                  <span className="tabular text-xs text-muted-foreground">
                    {kcal} kcal · {f.servingLabel ?? `${f.servingG} g`}
                  </span>
                </button>
              </li>
            );
          })}
          {results.length === 0 && (
            <li className="px-3 py-4 text-center text-sm text-muted-foreground">
              No match — switch to “Custom” to add it manually.
            </li>
          )}
        </ul>
      ) : (
        <PortionPicker food={selected} grams={grams} setGrams={setGrams} onAdd={add} onCancel={() => setSelected(null)} />
      )}
    </div>
  );
}

function PortionPicker({
  food,
  grams,
  setGrams,
  onAdd,
  onCancel,
}: {
  food: FoodItem;
  grams: number;
  setGrams: (g: number) => void;
  onAdd: () => void;
  onCancel: () => void;
}) {
  const n = nutritionFromPer100g(food.per100g, grams);
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-secondary/40 p-4">
      <div className="flex items-center justify-between">
        <span className="font-medium">{food.name}</span>
        <span className="tabular rounded-lg bg-background/60 px-2.5 py-1 text-sm font-semibold">{grams} g</span>
      </div>
      <div className="mt-3">
        <Slider
          value={[grams]}
          min={Math.max(10, Math.round(food.servingG * 0.25))}
          max={Math.round(food.servingG * 4)}
          step={5}
          accentVar="--macro-fiber"
          onValueChange={(v) => setGrams(v[0])}
          aria-label="Portion grams"
        />
      </div>
      <div className="tabular mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span><b className="text-foreground">{n.calories}</b> kcal</span>
        <span>P {n.protein}</span>
        <span>C {n.carbs}</span>
        <span>F {n.fat}</span>
        <span>Fiber {n.fiber}</span>
      </div>
      <div className="mt-4 flex gap-2">
        <Button onClick={onAdd} className="flex-1">
          <Plus className="h-4 w-4" /> Add to today
        </Button>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </motion.div>
  );
}

/* ----------------------------- custom adder ------------------------------ */

const CUSTOM_FIELDS: { key: keyof Pick<Nutrition, "calories" | "protein" | "carbs" | "fat" | "fiber">; label: string; unit: string }[] = [
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "carbs", label: "Carbs", unit: "g" },
  { key: "fat", label: "Fat", unit: "g" },
  { key: "fiber", label: "Fiber", unit: "g" },
];

function CustomAdd({ onAdd }: { onAdd: (e: MealLogEntry) => void }) {
  const [name, setName] = useState("");
  const [vals, setVals] = useState<Record<string, number>>({ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  const canAdd = name.trim().length > 0 && vals.calories > 0;

  function add() {
    const nutrition: Nutrition = {
      ...EMPTY_NUTRITION,
      calories: vals.calories,
      protein: vals.protein,
      carbs: vals.carbs,
      fat: vals.fat,
      fiber: vals.fiber,
    };
    onAdd({
      id: newId(),
      name: name.trim(),
      createdAt: Date.now(),
      grams: 0,
      nutrition,
      aiNutrition: nutrition,
      corrected: false,
      confidence: 100,
      provider: "manual",
    });
    setName("");
    setVals({ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  }

  return (
    <div className="space-y-4">
      <Field label="Food name">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Mom's veg pulao"
          className="h-11 w-full rounded-xl border border-input bg-secondary/40 px-3.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </Field>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {CUSTOM_FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="text-xs text-muted-foreground">{f.label}</span>
            <div className="mt-1 flex items-center rounded-xl border border-border bg-secondary/40 px-2.5">
              <input
                type="number"
                inputMode="decimal"
                value={vals[f.key] || ""}
                onChange={(e) => setVals((v) => ({ ...v, [f.key]: Math.max(0, Number(e.target.value) || 0) }))}
                placeholder="0"
                className="tabular w-full bg-transparent py-2 text-sm font-semibold outline-none"
              />
              <span className="text-[10px] text-muted-foreground">{f.unit}</span>
            </div>
          </label>
        ))}
      </div>
      <Button onClick={add} disabled={!canAdd} className="w-full">
        <Pencil className="h-4 w-4" /> Add custom food
      </Button>
    </div>
  );
}

/* ------------------------------ entry rows -------------------------------- */

function EntryRow({ entry, onRemove }: { entry: MealLogEntry; onRemove: () => void }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl bg-secondary/30 px-3 py-2.5">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{entry.name}</span>
          {entry.provider === "manual" && (
            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">manual</span>
          )}
        </div>
        <span className="tabular text-xs text-muted-foreground">
          {Math.round(entry.nutrition.calories)} kcal · P {Math.round(entry.nutrition.protein)} · C{" "}
          {Math.round(entry.nutrition.carbs)} · F {Math.round(entry.nutrition.fat)}
          {entry.grams ? ` · ${entry.grams} g` : ""}
        </span>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-macro-calories" aria-label="Remove" onClick={onRemove}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </li>
  );
}

/* --------------------------- recent / history ----------------------------- */

function RecentMeals() {
  const { mealLog } = useAppState();
  const [query, setQuery] = useState("");

  const recents = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? mealLog.entries.filter((e) => e.name.toLowerCase().includes(q)) : mealLog.entries;
    return list.slice(0, 12);
  }, [mealLog.entries, query]);

  if (mealLog.entries.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent meals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search past meals to re-log…"
            className="h-10 w-full rounded-xl border border-input bg-secondary/40 pl-10 pr-3.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <AnimatePresence initial={false}>
          <ul className="space-y-2">
            {recents.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-secondary/30 px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {e.thumbnail && <img src={e.thumbnail} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{e.name}</p>
                    <p className="tabular text-xs text-muted-foreground">
                      {Math.round(e.nutrition.calories)} kcal · {new Date(e.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Re-log" onClick={() => mealLog.reuseEntry(e.id)}>
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
              </li>
            ))}
          </ul>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
