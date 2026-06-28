import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Wand2, Plus, RefreshCw, Check, Info } from "lucide-react";
import { useAppState } from "@/store/AppState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { ImageDropzone } from "@/components/scanner/ImageDropzone";
import { AnalyzeLoading } from "@/components/scanner/AnalyzeLoading";
import { NutritionGrid } from "@/components/scanner/NutritionGrid";
import { PortionAdjuster } from "@/components/scanner/PortionAdjuster";
import { IngredientBreakdown } from "@/components/scanner/IngredientBreakdown";
import { ConfidenceBadge, ConfidenceDetail } from "@/components/scanner/ConfidenceIndicator";
import { ManualCorrection, type CorrectableKey } from "@/components/scanner/ManualCorrection";
import { IntakeProgress } from "@/components/results/IntakeProgress";
import { cn } from "@/lib/utils";
import {
  PORTION_PRESETS,
  analyzeFood,
  getActiveProvider,
  nutritionForGrams,
  type FoodAnalysisInput,
  type FoodAnalysisResult,
  type Nutrition,
  type PortionPreset,
} from "@/lib/foodAnalysis";
import type { MealLogEntry } from "@/hooks/useMealLog";

const DESC_CHIPS = ["Home-made", "Less oil", "1 bowl", "Restaurant serving", "Made with ghee", "Extra cheese"];

type Step = "input" | "loading" | "result";

export function ScannerView() {
  const { planner, mealLog } = useAppState();

  const [step, setStep] = useState<Step>("input");
  const [image, setImage] = useState<string | undefined>();
  const [description, setDescription] = useState("");
  const [preset, setPreset] = useState<PortionPreset | undefined>("medium");
  const [portionText, setPortionText] = useState("");

  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [grams, setGrams] = useState(0);
  const [correction, setCorrection] = useState<Partial<Record<CorrectableKey, number>>>({});
  const [logged, setLogged] = useState(false);

  const provider = getActiveProvider();

  const baseNutrition: Nutrition | null = useMemo(
    () => (result ? nutritionForGrams(result.perGram, grams) : null),
    [result, grams],
  );
  const corrected = Object.keys(correction).length > 0;
  const effective: Nutrition | null = baseNutrition ? { ...baseNutrition, ...correction } : null;
  const ratio = result ? grams / Math.max(1, result.portion.grams) : 1;

  async function runAnalysis() {
    setStep("loading");
    setLogged(false);
    setCorrection({});
    const input: FoodAnalysisInput = {
      imageDataUrl: image,
      description,
      portionPreset: preset,
      portionText: portionText || undefined,
    };
    // Run the (async) analysis and a minimum animation window together.
    const [res] = await Promise.all([
      analyzeFood(input),
      new Promise((r) => setTimeout(r, 1700)),
    ]);
    setResult(res);
    setGrams(res.portion.grams);
    setStep("result");
  }

  function addToLog() {
    if (!result || !effective || !baseNutrition) return;
    const entry: MealLogEntry = {
      id: `meal_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      name: result.dishName,
      thumbnail: image,
      createdAt: Date.now(),
      grams,
      nutrition: effective,
      aiNutrition: baseNutrition,
      corrected,
      confidence: result.confidence.score,
      provider: result.provider,
    };
    mealLog.addEntry(entry);
    setLogged(true);
  }

  function reset() {
    setStep("input");
    setResult(null);
    setImage(undefined);
    setDescription("");
    setPortionText("");
    setPreset("medium");
    setCorrection({});
    setLogged(false);
  }

  const canAnalyze = Boolean(image) || description.trim().length > 1;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Intro */}
      <Card className="glass-strong">
        <CardContent className="flex items-start gap-3 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-macro-calories">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold">AI Image Calorie Calculator</h2>
            <p className="text-sm text-muted-foreground">
              Snap or upload a meal, add a short description, and get an instant nutrition
              estimate you can fine-tune and log. Engine:{" "}
              <span className="font-medium text-foreground">{provider.label}</span>.
            </p>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {/* ---------------- INPUT ---------------- */}
        {step === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-5"
          >
            <Card>
              <CardHeader>
                <CardTitle>1 · Add a photo</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageDropzone value={image} onChange={setImage} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2 · Describe it</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='e.g. "Dal Rice, home-made, less oil" or "Paneer Butter Masala with 2 rotis"'
                  rows={2}
                  className="w-full resize-none rounded-xl border border-input bg-secondary/40 p-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring"
                />
                <div className="flex flex-wrap gap-2">
                  {DESC_CHIPS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() =>
                        setDescription((d) => (d.toLowerCase().includes(c.toLowerCase()) ? d : `${d}${d.trim() ? ", " : ""}${c}`))
                      }
                      className="rounded-full bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      + {c}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3 · Portion (optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {PORTION_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPreset((cur) => (cur === p.id ? undefined : p.id))}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                        preset === p.id
                          ? "border-primary/60 bg-accent/60 text-foreground"
                          : "border-border bg-secondary/40 text-muted-foreground hover:bg-secondary/70",
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <Field label="Or enter exactly" hint='e.g. "250 g", "2 rotis", "1 plate"'>
                  <input
                    value={portionText}
                    onChange={(e) => setPortionText(e.target.value)}
                    placeholder="250 g"
                    className="h-11 w-full rounded-xl border border-input bg-secondary/40 px-3.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </Field>
              </CardContent>
            </Card>

            <Button onClick={runAnalysis} disabled={!canAnalyze} size="lg" className="w-full">
              <Wand2 className="h-4 w-4" /> Analyze Food
            </Button>
            {!canAnalyze && (
              <p className="text-center text-xs text-muted-foreground">
                Add a photo or a description to begin.
              </p>
            )}
          </motion.div>
        )}

        {/* ---------------- LOADING ---------------- */}
        {step === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card>
              <CardContent className="p-5">
                <AnalyzeLoading />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ---------------- RESULT ---------------- */}
        {step === "result" && result && effective && baseNutrition && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-5"
          >
            <Card className="glass-strong">
              <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                <div className="flex items-center gap-3">
                  {image && (
                    <img src={image} alt={result.dishName} className="h-14 w-14 rounded-xl object-cover" />
                  )}
                  <div>
                    <CardTitle className="text-lg">{result.dishName}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {[result.cuisine, result.cookingMethod].filter(Boolean).join(" · ") || "Estimated meal"}
                    </p>
                  </div>
                </div>
                <ConfidenceBadge report={result.confidence} />
              </CardHeader>
              <CardContent className="space-y-4">
                <NutritionGrid nutrition={effective} />
                {corrected ? (
                  <p className="flex items-center gap-2 rounded-xl bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
                    <Info className="h-3.5 w-3.5" /> Showing your corrected values — revert to AI to adjust the portion.
                  </p>
                ) : (
                  <PortionAdjuster result={result} grams={grams} onChange={setGrams} />
                )}

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button onClick={addToLog} className="flex-1" disabled={logged}>
                    {logged ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {logged ? "Added to Today" : "Add to Today's Intake"}
                  </Button>
                  <Button variant="secondary" onClick={reset} className="flex-1">
                    <RefreshCw className="h-4 w-4" /> Analyze another
                  </Button>
                </div>
                {logged && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-xs text-macro-fiber"
                  >
                    Logged — your dashboard &amp; today's totals updated instantly.
                  </motion.p>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-5 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Ingredient breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <IngredientBreakdown result={result} ratio={ratio} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Accuracy</CardTitle>
                </CardHeader>
                <CardContent>
                  <ConfidenceDetail report={result.confidence} />
                </CardContent>
              </Card>
            </div>

            {result.suggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" /> AI suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="text-primary">→</span>
                        <span className="text-muted-foreground">{s}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-5">
                <ManualCorrection
                  base={pick(baseNutrition)}
                  values={pick(effective)}
                  corrected={corrected}
                  onChange={(k, v) => setCorrection((c) => ({ ...c, [k]: v }))}
                  onReset={() => setCorrection({})}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compare with today's targets</CardTitle>
              </CardHeader>
              <CardContent>
                <IntakeProgress targets={planner.macros} consumed={mealLog.consumedToday} />
              </CardContent>
            </Card>

            <p className="px-2 text-center text-xs text-muted-foreground">{result.disclaimer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Extract the five correctable values from a full nutrition vector. */
function pick(n: Nutrition): Record<CorrectableKey, number> {
  return { calories: n.calories, protein: n.protein, carbs: n.carbs, fat: n.fat, fiber: n.fiber };
}
