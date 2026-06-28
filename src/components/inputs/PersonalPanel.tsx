import { AnimatePresence, motion } from "framer-motion";
import { User, UserRound, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LabeledSlider } from "./LabeledSlider";
import {
  DEFAULT_BODY_FAT,
  ETHNICITIES,
  INPUT_BOUNDS,
  type EthnicityId,
  type Gender,
  type ProteinBasis,
  type UserProfile,
} from "@/lib/nutrition";

interface PersonalPanelProps {
  profile: UserProfile;
  update: (patch: Partial<UserProfile>) => void;
}

export function PersonalPanel({ profile, update }: PersonalPanelProps) {
  const weightDelta = profile.targetWeightKg - profile.currentWeightKg;
  const bodyFatOn = profile.bodyFatPercent != null;

  const toggleBodyFat = (on: boolean) =>
    update(
      on
        ? { bodyFatPercent: DEFAULT_BODY_FAT[profile.gender] }
        : { bodyFatPercent: undefined, proteinBasis: "bodyweight" },
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Field label="Gender">
          <Segmented<Gender>
            name="gender"
            value={profile.gender}
            onChange={(gender) => update({ gender })}
            options={[
              { value: "male", label: "Male", icon: <User className="h-4 w-4" /> },
              { value: "female", label: "Female", icon: <UserRound className="h-4 w-4" /> },
            ]}
          />
        </Field>

        <LabeledSlider
          id="age"
          label="Age"
          value={profile.age}
          min={INPUT_BOUNDS.age.min}
          max={INPUT_BOUNDS.age.max}
          step={INPUT_BOUNDS.age.step}
          unit="yrs"
          onChange={(age) => update({ age })}
        />

        <LabeledSlider
          id="height"
          label="Height"
          value={profile.heightCm}
          min={INPUT_BOUNDS.height.min}
          max={INPUT_BOUNDS.height.max}
          step={INPUT_BOUNDS.height.step}
          unit="cm"
          onChange={(heightCm) => update({ heightCm })}
        />

        <LabeledSlider
          id="current-weight"
          label="Current Weight"
          value={profile.currentWeightKg}
          min={INPUT_BOUNDS.weight.min}
          max={INPUT_BOUNDS.weight.max}
          step={INPUT_BOUNDS.weight.step}
          unit="kg"
          accentVar="--macro-calories"
          onChange={(currentWeightKg) => update({ currentWeightKg })}
        />

        <LabeledSlider
          id="target-weight"
          label="Target Weight"
          value={profile.targetWeightKg}
          min={INPUT_BOUNDS.weight.min}
          max={INPUT_BOUNDS.weight.max}
          step={INPUT_BOUNDS.weight.step}
          unit="kg"
          accentVar="--macro-fiber"
          hint={
            weightDelta === 0
              ? "Maintaining current weight"
              : `${weightDelta > 0 ? "Gaining" : "Losing"} ${Math.abs(weightDelta)} kg to goal`
          }
          onChange={(targetWeightKg) => update({ targetWeightKg })}
        />

        {/* Optional, advanced: measured body composition */}
        <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Body fat %
                <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Optional
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Know it from a scale, calipers or DEXA? Unlocks Katch-McArdle BMR
                &amp; exact lean mass.
              </p>
            </div>
            <Switch checked={bodyFatOn} onCheckedChange={toggleBodyFat} aria-label="Use measured body fat %" />
          </div>

          <AnimatePresence initial={false}>
            {bodyFatOn && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div className="space-y-5 pt-4">
                  <LabeledSlider
                    id="body-fat"
                    label="Measured body fat"
                    value={profile.bodyFatPercent ?? DEFAULT_BODY_FAT[profile.gender]}
                    min={INPUT_BOUNDS.bodyFat.min}
                    max={INPUT_BOUNDS.bodyFat.max}
                    step={INPUT_BOUNDS.bodyFat.step}
                    unit="%"
                    accentVar="--macro-fat"
                    format={(v) => v.toFixed(1)}
                    onChange={(bodyFatPercent) => update({ bodyFatPercent })}
                  />
                  <Field
                    label="Protein target basis"
                    hint={
                      profile.proteinBasis === "lean-mass"
                        ? "Anchored to lean body mass (g/kg LBM) — best for lean athletes."
                        : "Anchored to target bodyweight (g/kg)."
                    }
                  >
                    <Segmented<ProteinBasis>
                      name="protein-basis"
                      value={profile.proteinBasis}
                      onChange={(proteinBasis) => update({ proteinBasis })}
                      options={[
                        { value: "bodyweight", label: "Bodyweight" },
                        { value: "lean-mass", label: "Lean mass" },
                      ]}
                    />
                  </Field>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Field
          label="Ethnicity"
          htmlFor="ethnicity"
          hint="Reserved for future population-specific BMI thresholds."
        >
          <Select
            value={profile.ethnicity}
            onValueChange={(v) => update({ ethnicity: v as EthnicityId })}
          >
            <SelectTrigger id="ethnicity">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ETHNICITIES.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </CardContent>
    </Card>
  );
}
