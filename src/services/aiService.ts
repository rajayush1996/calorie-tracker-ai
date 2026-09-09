import { FoodItem, DietPlan, DailyLog, UserProfile, DailyAudit, DietType } from '@/types';

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
