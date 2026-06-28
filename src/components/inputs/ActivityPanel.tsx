import { AnimatePresence, motion } from "framer-motion";
import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ACTIVITY_LEVELS, type ActivityId, type UserProfile } from "@/lib/nutrition";

interface ActivityPanelProps {
  profile: UserProfile;
  update: (patch: Partial<UserProfile>) => void;
}

export function ActivityPanel({ profile, update }: ActivityPanelProps) {
  const index = ACTIVITY_LEVELS.findIndex((a) => a.id === profile.activity);
  const level = ACTIVITY_LEVELS[Math.max(0, index)];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Activity Level</CardTitle>
        <span className="tabular flex items-center gap-1.5 rounded-lg bg-secondary/70 px-2.5 py-1 text-sm font-semibold">
          <Activity className="h-3.5 w-3.5 text-primary" />
          ×{level.multiplier}
        </span>
      </CardHeader>
      <CardContent className="space-y-5">
        <Slider
          value={[Math.max(0, index)]}
          min={0}
          max={ACTIVITY_LEVELS.length - 1}
          step={1}
          aria-label="Activity level"
          onValueChange={(v) => update({ activity: ACTIVITY_LEVELS[v[0]].id as ActivityId })}
        />

        <div className="flex justify-between px-0.5">
          {ACTIVITY_LEVELS.map((a, i) => (
            <button
              key={a.id}
              type="button"
              onClick={() => update({ activity: a.id })}
              className={`h-1.5 flex-1 ${i === 0 ? "" : "ml-1"} rounded-full transition-colors ${
                i <= index ? "bg-primary/70" : "bg-secondary"
              }`}
              aria-label={a.label}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={level.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="rounded-2xl bg-secondary/50 p-4"
          >
            <div className="text-base font-semibold">{level.label}</div>
            <p className="mt-1 text-sm text-muted-foreground">{level.description}</p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-xs">
              <span className="text-muted-foreground">
                Multiplier{" "}
                <span className="font-semibold text-foreground tabular">
                  ×{level.multiplier}
                </span>
              </span>
              <span className="text-muted-foreground">
                Best for <span className="font-medium text-foreground">{level.goal}</span>
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
