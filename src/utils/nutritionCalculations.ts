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

export interface GoalPaceOption {
  label: string;
  description: string;
  calorieDelta: number;
  estimatedWeeklyKg: number;
  icon: string;
}

export const GOAL_PACES: Record<
  FitnessGoal,
  Record<'sustainable' | 'recommended' | 'aggressive', GoalPaceOption>
> = {
  fat_loss: {
    sustainable: {
      label: 'Slow & Sustainable Fat Loss',
      description: 'Easiest to follow, preserves maximum muscle & energy',
      calorieDelta: -250,
      estimatedWeeklyKg: 0.28,
      icon: '🐢',
    },
    recommended: {
      label: 'Standard Fat Loss (Recommended)',
      description: 'The golden balance of steady fat burn and satiety',
      calorieDelta: -500,
      estimatedWeeklyKg: 0.50,
      icon: '⚖️',
    },
    aggressive: {
      label: 'Fast / Aggressive Cut',
      description: 'Deep deficit for rapid fat drop or event jumpstart',
      calorieDelta: -750,
      estimatedWeeklyKg: 0.82,
      icon: '⚡',
    },
  },
  muscle_gain: {
    sustainable: {
      label: 'Lean Hypertrophy',
      description: 'Slight surplus: build lean muscle with minimal fat gain',
      calorieDelta: 200,
      estimatedWeeklyKg: 0.20,
      icon: '🌱',
    },
    recommended: {
      label: 'Optimal Muscle Growth (Recommended)',
      description: 'The sweet spot for building muscle size and strength',
      calorieDelta: 350,
      estimatedWeeklyKg: 0.35,
      icon: '💪',
    },
    aggressive: {
      label: 'Power Bulk',
      description: 'Higher surplus for serious strength & heavy lifting',
      calorieDelta: 500,
      estimatedWeeklyKg: 0.50,
      icon: '🏋️',
    },
  },
  weight_gain: {
    sustainable: {
      label: 'Steady Weight Gain',
      description: 'Gradual, easy digestion and sustainable weight increase',
      calorieDelta: 300,
      estimatedWeeklyKg: 0.30,
      icon: '📈',
    },
    recommended: {
      label: 'Healthy Weight Bulking (Recommended)',
      description: 'Solid surplus for underweight recovery & mass building',
      calorieDelta: 500,
      estimatedWeeklyKg: 0.50,
      icon: '🚀',
    },
    aggressive: {
      label: 'Accelerated Mass Gain',
      description: 'Maximum calorie surplus for hardgainers & high metabolisms',
      calorieDelta: 750,
      estimatedWeeklyKg: 0.75,
      icon: '🔥',
    },
  },
  maintenance: {
    sustainable: {
      label: 'Body Recomposition',
      description: 'Maintain exact weight while toning physique & fitness',
      calorieDelta: 0,
      estimatedWeeklyKg: 0.0,
      icon: '⚖️',
    },
    recommended: {
      label: 'True Maintenance (Recommended)',
      description: 'Match TDEE exactly for energy balance and vitality',
      calorieDelta: 0,
      estimatedWeeklyKg: 0.0,
      icon: '🎯',
    },
    aggressive: {
      label: 'Performance Maintenance',
      description: 'High activity maintenance for athletic performance',
      calorieDelta: 0,
      estimatedWeeklyKg: 0.0,
      icon: '⚡',
    },
  },
};

export const PACE_CONFIG: Record<
  TransformationPace,
  { label: string; description: string; calorieDelta: number; estimatedWeeklyKg: number; icon: string }
> = {
  sustainable: GOAL_PACES.fat_loss.sustainable,
  recommended: GOAL_PACES.fat_loss.recommended,
  aggressive: GOAL_PACES.fat_loss.aggressive,
  muscle_gain: GOAL_PACES.muscle_gain.recommended,
};

export function getPaceConfig(
  goal: FitnessGoal = 'fat_loss',
  pace: TransformationPace = 'recommended'
): GoalPaceOption {
  const goalGroup = GOAL_PACES[goal] || GOAL_PACES.fat_loss;
  const normalizedPace =
    pace === 'muscle_gain' ? 'recommended' : (pace as 'sustainable' | 'recommended' | 'aggressive');
  return goalGroup[normalizedPace] || goalGroup.recommended;
}

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
 * Calculate recommended targets for calories and macros based on goal and pace
 */
export function calculateTargets(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel,
  goal: FitnessGoal = 'fat_loss',
  pace: TransformationPace = 'recommended'
) {
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);

  const paceInfo = getPaceConfig(goal, pace);
  const minSafeFloor = gender === 'female' ? 1200 : 1500;

  let targetCalories = tdee + paceInfo.calorieDelta;
  if (paceInfo.calorieDelta < 0) {
    targetCalories = Math.max(minSafeFloor, targetCalories);
  }

  // Protein and fat ratios tailored by fitness goal:
  // - Fat loss: High protein (2.0 - 2.2g/kg) to preserve lean muscle during deficit
  // - Muscle gain: High protein (2.0 - 2.2g/kg) for hypertrophy + carbs for training intensity
  // - Weight gain: Balanced protein (1.8g/kg) + higher healthy fats (28%) for calorie density
  // - Maintenance: 1.8g/kg protein for overall wellness
  let proteinMultiplier = 2.0;
  let fatCalorieRatio = 0.25;

  if (goal === 'fat_loss') {
    proteinMultiplier = pace === 'aggressive' ? 2.2 : 2.0;
    fatCalorieRatio = 0.25;
  } else if (goal === 'muscle_gain') {
    proteinMultiplier = pace === 'aggressive' ? 2.2 : 2.1;
    fatCalorieRatio = 0.25;
  } else if (goal === 'weight_gain') {
    proteinMultiplier = 1.8;
    fatCalorieRatio = 0.28;
  } else {
    // maintenance
    proteinMultiplier = 1.8;
    fatCalorieRatio = 0.25;
  }

  const targetProteinG = Math.round(weightKg * proteinMultiplier);
  const proteinCalories = targetProteinG * 4;

  // Fat calories
  const fatCalories = Math.round(targetCalories * fatCalorieRatio);
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
 * Calculate weight journey milestones and week-by-week projection based on goal and pace
 */
export function calculateWeightLossJourney(
  currentWeightKg: number,
  targetWeightKg: number,
  pace: TransformationPace = 'recommended',
  goal?: FitnessGoal
) {
  const isLoss = targetWeightKg < currentWeightKg;
  const effectiveGoal: FitnessGoal =
    goal || (targetWeightKg > currentWeightKg ? 'weight_gain' : isLoss ? 'fat_loss' : 'maintenance');

  const paceInfo = getPaceConfig(effectiveGoal, pace);
  const totalWeightDiffKg = Math.abs(currentWeightKg - targetWeightKg);

  const weeklyRate = Math.abs(paceInfo.estimatedWeeklyKg) || (effectiveGoal === 'maintenance' ? 0 : 0.4);

  if (totalWeightDiffKg <= 0.2 || weeklyRate <= 0) {
    return {
      weeksNeeded: 0,
      weeklyLossKg: 0,
      weeklyRateKg: 0,
      projectionPoints: [
        {
          week: 0,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          projectedWeight: Number(currentWeightKg.toFixed(1)),
        },
      ],
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
    weeklyRateKg: Number(weeklyRate.toFixed(2)),
    projectionPoints,
    estimatedTargetDate: estimatedTargetDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  };
}

export const calculateWeightJourney = calculateWeightLossJourney;
