import { FoodItem, DietPlan, WorkoutPlan, MultiWeekWorkoutProgram, DailyLog, UserProfile, DailyAudit, DietType, FitnessGoal } from '@/types';

export async function parseMealSentence(
  sentence: string,
  apiKey?: string,
  provider?: string
): Promise<{ items: FoodItem[]; assumptions: string[]; clarification: string | null; provider?: string }> {
  const res = await fetch('/api/ai/parse-meal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sentence, apiKey, provider }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to parse meal');
  }

  return res.json();
}

export async function refineMealItems(
  existingItems: FoodItem[],
  correctionSentence: string,
  apiKey?: string,
  provider?: string
): Promise<{ items: FoodItem[]; changesSummary: string; assumptions: string[]; provider?: string }> {
  const res = await fetch('/api/ai/refine-meal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ existingItems, correctionSentence, apiKey, provider }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to refine meal');
  }

  return res.json();
}

export async function generateDietPlan(params: {
  dietType: DietType;
  pantryText: string;
  scheduleText: string;
  targetCalories: number;
  targetProteinG: number;
  goal?: FitnessGoal;
  apiKey?: string;
  provider?: string;
}): Promise<DietPlan & { provider?: string }> {
  const res = await fetch('/api/ai/suggest-diet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate diet plan');
  }

  return res.json();
}

export async function generateDailyAudit(params: {
  dailyLog: DailyLog;
  userProfile: UserProfile;
  apiKey?: string;
  provider?: string;
}): Promise<DailyAudit & { provider?: string }> {
  const res = await fetch('/api/ai/audit-day', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate audit');
  }

  return res.json();
}

export async function getAICravingSwap(
  cravingText: string,
  apiKey?: string,
  provider?: string
): Promise<{
  cravingName: string;
  originalEstimatedCalories: number;
  swapTitle: string;
  swapCalories: number;
  swapProteinG: number;
  caloriesSaved: number;
  prepTime: string;
  ingredients: string[];
  quickRecipe: string;
  psychologicalTip: string;
  provider?: string;
}> {
  const res = await fetch('/api/ai/rescue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'craving_swap', cravingText, apiKey, provider }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to get craving swap');
  }

  return res.json();
}

export async function getAIDamageControl(
  cheatMealText: string,
  targetCalories: number,
  apiKey?: string,
  provider?: string
): Promise<{
  estimatedCheatCalories: number;
  reassuranceMessage: string;
  tonightSteps: string[];
  tomorrowPlan: string;
  movementTip: string;
  weeklyDeficitStatus: string;
  provider?: string;
}> {
  const res = await fetch('/api/ai/rescue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'damage_control', cheatMealText, targetCalories, apiKey, provider }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to get damage control plan');
  }

  return res.json();
}

export async function verifyTargetsWithAI(params: {
  age: number;
  gender: string;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  activityLevel: string;
  goal: FitnessGoal;
  dietType?: DietType;
  pace?: string;
  apiKey?: string;
  provider?: string;
}): Promise<{
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  waterTargetMl: number;
  aiExplanation: string;
  weeklyRateKg: number;
  confidence: string;
  provider?: string;
}> {
  const res = await fetch('/api/ai/verify-targets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to verify targets with AI');
  }

  return res.json();
}

export async function parseMealImage(
  imageBase64: string,
  apiKey?: string,
  provider?: string
): Promise<{ items: FoodItem[]; assumptions: string[]; plateSummary: string; provider?: string }> {
  const res = await fetch('/api/ai/parse-meal-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, apiKey, provider }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to analyze meal photo');
  }

  return res.json();
}

export async function parseDietDocument(params: {
  fileText: string;
  fileName?: string;
  targetCalories?: number;
  targetProteinG?: number;
  apiKey?: string;
  provider?: string;
}): Promise<DietPlan> {
  const res = await fetch('/api/ai/parse-diet-doc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to parse diet document');
  }

  return res.json();
}

export async function generateWorkoutPlan(params: {
  goal?: string;
  equipment?: string;
  targetMuscle?: string;
  durationMinutes?: number;
  fitnessLevel?: string;
  customNotes?: string;
  apiKey?: string;
  provider?: string;
}): Promise<WorkoutPlan & { provider?: string }> {
  const res = await fetch('/api/ai/generate-workout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate workout plan');
  }

  return res.json();
}

export async function generateMultiWeekWorkoutProgram(params: {
  primaryGoal?: string;
  experienceLevel?: string;
  daysAvailable?: string;
  equipmentAccess?: string;
  injuries?: string;
  baselineFitness?: string;
  existingRoutineNotes?: string;
  apiKey?: string;
  provider?: string;
}): Promise<MultiWeekWorkoutProgram & { provider?: string }> {
  const res = await fetch('/api/ai/generate-workout-program', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate workout program');
  }

  return res.json();
}

export async function parseWorkoutDocument(params: {
  fileText: string;
  fileName?: string;
  experienceLevel?: string;
  equipmentAccess?: string;
  apiKey?: string;
  provider?: string;
}): Promise<MultiWeekWorkoutProgram & { provider?: string }> {
  const res = await fetch('/api/ai/parse-workout-doc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to parse workout document');
  }

  return res.json();
}
