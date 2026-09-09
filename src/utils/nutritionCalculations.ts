import { Gender, ActivityLevel, FitnessGoal, TransformationPace } from '@/types';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (Desk job, minimal exercise)',
  light: 'Lightly Active (1-3 gym/walk sessions/week)',
  moderate: 'Moderately Active (3-5 workouts/week)',
  active: 'Very Active (6-7 days intense training)',
  very_active: 'Extremely Active (Athletic/Physical job)',
};

export const PACE_CONFIG: Record<
  TransformationPace,
  { label: string; description: string; calorieDelta: number; estimatedWeeklyKg: number; icon: string }
> = {
  sustainable: {
    label: 'Slow & Sustainable',
    description: 'Easiest to follow, preserves maximum muscle & energy',
    calorieDelta: -250,
    estimatedWeeklyKg: 0.28,
    icon: '🐢',
  },
  recommended: {
    label: 'Standard Fat Loss (Recommended)',
    description: 'The golden balance of steady fat loss and satiety',
    calorieDelta: -500,
    estimatedWeeklyKg: 0.50,
    icon: '⚖️',
  },
  aggressive: {
    label: 'Fast / Extreme Cut',
    description: 'Aggressive deficit for fast event prep or jumpstart',
    calorieDelta: -750,
    estimatedWeeklyKg: 0.82,
    icon: '⚡',
  },
  muscle_gain: {
    label: 'Lean Bulk / Muscle Building',
    description: 'Calorie surplus designed for muscle growth',
    calorieDelta: 350,
    estimatedWeeklyKg: -0.30, // weight increase
    icon: '💪',
  },
};

/**
 * Calculate BMR using the Mifflin-St Jeor Equation
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') {
    return Math.round(base + 5);
  } else if (gender === 'female') {
    return Math.round(base - 161);
  }
  return Math.round(base - 78);
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}

/**
 * Calculate recommended targets for calories and macros based on pace
 */
export function calculateTargets(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel,
  goal: FitnessGoal,
  pace: TransformationPace = 'recommended'
) {
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);

  const paceInfo = PACE_CONFIG[pace] || PACE_CONFIG.recommended;
  const minSafeFloor = gender === 'female' ? 1200 : 1500;

  let targetCalories = tdee + paceInfo.calorieDelta;
  if (paceInfo.calorieDelta < 0) {
    targetCalories = Math.max(minSafeFloor, targetCalories);
  }

  // High protein for muscle retention during fat loss
  const proteinMultiplier = pace === 'aggressive' ? 2.2 : 2.0;
  const targetProteinG = Math.round(weightKg * proteinMultiplier);
  const proteinCalories = targetProteinG * 4;

  // Fat: 25% of total calories
  const fatCalories = Math.round(targetCalories * 0.25);
  const targetFatG = Math.round(fatCalories / 9);

  // Carbs: Remaining calories
  const remainingCalories = Math.max(0, targetCalories - proteinCalories - fatCalories);
  const targetCarbsG = Math.round(remainingCalories / 4);

  // Water target: 35ml per kg bodyweight
  const waterTargetMl = Math.round(weightKg * 35);

  return {
    bmr,
    tdee,
    targetCalories,
    targetProteinG,
    targetCarbsG,
    targetFatG,
    waterTargetMl,
  };
}

/**
 * Calculate Body Mass Index (BMI)
 */
export function calculateBMI(weightKg: number, heightCm: number) {
  const heightM = heightCm / 100;
  if (heightM <= 0) return { bmi: 0, category: 'Unknown', color: 'text-gray-500' };
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  let category = 'Normal';
  let color = 'text-emerald-500';

  if (bmi < 18.5) {
    category = 'Underweight';
    color = 'text-amber-500';
  } else if (bmi >= 25 && bmi < 30) {
    category = 'Overweight';
    color = 'text-amber-500';
  } else if (bmi >= 30) {
    category = 'Obese';
    color = 'text-rose-500';
  }

  return { bmi, category, color };
}

/**
 * Calculate weight loss journey milestones and week-by-week projection based on selected pace
 */
export function calculateWeightLossJourney(
  currentWeightKg: number,
  targetWeightKg: number,
  pace: TransformationPace = 'recommended'
) {
  const paceInfo = PACE_CONFIG[pace] || PACE_CONFIG.recommended;
  const isLoss = targetWeightKg < currentWeightKg;
  const totalWeightDiffKg = Math.abs(currentWeightKg - targetWeightKg);

  const weeklyRate = Math.abs(paceInfo.estimatedWeeklyKg);

  if (totalWeightDiffKg <= 0.2 || weeklyRate <= 0) {
    return {
      weeksNeeded: 0,
      weeklyLossKg: 0,
      projectionPoints: [],
      estimatedTargetDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };
  }

  const weeksNeeded = Math.ceil(totalWeightDiffKg / weeklyRate);
  const startDate = new Date();
  const estimatedTargetDate = new Date();
  estimatedTargetDate.setDate(startDate.getDate() + weeksNeeded * 7);

  const projectionPoints: {
    week: number;
    date: string;
    projectedWeight: number;
  }[] = [];

  let currentIterWeight = currentWeightKg;
  for (let w = 0; w <= Math.min(weeksNeeded, 24); w++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + w * 7);
    projectionPoints.push({
      week: w,
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      projectedWeight: Number(currentIterWeight.toFixed(1)),
    });
    if (isLoss) {
      currentIterWeight = Math.max(targetWeightKg, currentIterWeight - weeklyRate);
    } else {
      currentIterWeight = Math.min(targetWeightKg, currentIterWeight + weeklyRate);
    }
  }

  return {
    weeksNeeded,
    weeklyLossKg: Number(weeklyRate.toFixed(2)),
    projectionPoints,
    estimatedTargetDate: estimatedTargetDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  };
}
