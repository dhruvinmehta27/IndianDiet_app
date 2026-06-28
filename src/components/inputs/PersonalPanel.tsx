import { User, UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LabeledSlider } from "./LabeledSlider";
import {
  ETHNICITIES,
  INPUT_BOUNDS,
  type EthnicityId,
  type Gender,
  type UserProfile,
} from "@/lib/nutrition";

interface PersonalPanelProps {
  profile: UserProfile;
  update: (patch: Partial<UserProfile>) => void;
}

export function PersonalPanel({ profile, update }: PersonalPanelProps) {
  const weightDelta = profile.targetWeightKg - profile.currentWeightKg;

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
