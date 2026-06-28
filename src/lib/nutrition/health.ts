/**
 * Health indicator calculations — BMI, body composition estimates and daily
 * lifestyle recommendations. All derived from the same UserProfile so the
 * dashboard never disagrees with the macro engine.
 */

import { clamp, round } from "../utils";
import { calculateBMR, calculateEnergy } from "./engine";
import type { UserProfile } from "./types";

export interface HealthIndicators {
  bmi: number;
  bmiCategory: string;
  healthyWeightRange: [number, number]; // kg, for current height
  bodyFatPercent: number; // estimated (Deurenberg)
  leanBodyMassKg: number;
  bmr: number;
  tdee: number;
  calorieDelta: number; // signed; negative = deficit
  proteinGramsTarget: number; // convenience echo from goal
  waterLitres: number;
  stepsTarget: number;
  sleepHours: [number, number];
}

const BMI_NORMAL_LOW = 18.5;
const BMI_NORMAL_HIGH = 24.9;

function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

/**
 * Deurenberg body-fat estimate from BMI, age and sex:
 *   BF% = 1.20·BMI + 0.23·age − 10.8·sex − 5.4   (sex: male=1, female=0)
 */
function estimateBodyFat(bmi: number, age: number, isMale: boolean): number {
  const bf = 1.2 * bmi + 0.23 * age - 10.8 * (isMale ? 1 : 0) - 5.4;
  return clamp(bf, 3, 60);
}

export function calculateHealth(
  profile: UserProfile,
  proteinGramsTarget: number,
): HealthIndicators {
  const heightM = profile.heightCm / 100;
  const bmi = profile.currentWeightKg / (heightM * heightM);

  const healthyLow = round(BMI_NORMAL_LOW * heightM * heightM, 1);
  const healthyHigh = round(BMI_NORMAL_HIGH * heightM * heightM, 1);

  const isMale = profile.gender === "male";
  const bodyFat = estimateBodyFat(bmi, profile.age, isMale);
  const leanMass = profile.currentWeightKg * (1 - bodyFat / 100);

  const energy = calculateEnergy(profile);

  // Water: ~35 ml per kg bodyweight, nudged up for higher activity.
  const activityWaterBonus =
    energy.activityMultiplier >= 1.725 ? 0.6 : energy.activityMultiplier >= 1.55 ? 0.3 : 0;
  const water = (profile.currentWeightKg * 0.035) + activityWaterBonus;

  // Steps: scale with activity multiplier.
  const stepsByActivity: Record<number, number> = {
    1.2: 6000,
    1.375: 8000,
    1.55: 10000,
    1.725: 12000,
    1.9: 14000,
  };
  const steps = stepsByActivity[energy.activityMultiplier] ?? 8000;

  return {
    bmi: round(bmi, 1),
    bmiCategory: bmiCategory(bmi),
    healthyWeightRange: [healthyLow, healthyHigh],
    bodyFatPercent: round(bodyFat, 1),
    leanBodyMassKg: round(leanMass, 1),
    bmr: round(calculateBMR(profile)),
    tdee: energy.tdee,
    calorieDelta: energy.calorieDelta,
    proteinGramsTarget: round(proteinGramsTarget),
    waterLitres: round(water, 1),
    stepsTarget: steps,
    sleepHours: profile.age < 18 ? [8, 10] : [7, 9],
  };
}
