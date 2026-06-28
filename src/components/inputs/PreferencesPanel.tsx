import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DIETS, type DietId, type UserProfile } from "@/lib/nutrition";

interface PreferencesPanelProps {
  profile: UserProfile;
  update: (patch: Partial<UserProfile>) => void;
}

export function PreferencesPanel({ profile, update }: PreferencesPanelProps) {
  const diet = DIETS.find((d) => d.id === profile.diet);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Diet Preference</CardTitle>
      </CardHeader>
      <CardContent>
        <Field
          label="Eating style"
          htmlFor="diet"
          hint={
            diet
              ? `${diet.hint}. Used by the upcoming meal planner & recipe generator.`
              : undefined
          }
        >
          <Select
            value={profile.diet}
            onValueChange={(v) => update({ diet: v as DietId })}
          >
            <SelectTrigger id="diet">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIETS.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </CardContent>
    </Card>
  );
}
