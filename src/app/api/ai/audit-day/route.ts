import { NextRequest, NextResponse } from 'next/server';
import { DailyAudit, DailyLog, UserProfile } from '@/types';
import { getAIProvider, AIProviderType } from '@/lib/ai/factory';

export async function POST(req: NextRequest) {
  try {
    const { dailyLog, userProfile, apiKey: clientApiKey, provider: clientProvider } = await req.json();

    if (!dailyLog || !userProfile) {
      return NextResponse.json({ error: 'Daily log and profile are required' }, { status: 400 });
    }

    const aiProvider = getAIProvider({
      preferredProvider: clientProvider as AIProviderType,
      customApiKey: clientApiKey,
    });

    // Calculate totals
    const meals = dailyLog.meals || [];
    const totalCalories = meals.reduce((sum: number, m: any) => sum + (m.totalCalories || 0), 0);
    const totalProtein = meals.reduce((sum: number, m: any) => sum + (m.totalProtein || 0), 0);
    const totalCarbs = meals.reduce((sum: number, m: any) => sum + (m.totalCarbs || 0), 0);
    const totalFat = meals.reduce((sum: number, m: any) => sum + (m.totalFat || 0), 0);

    const calDiff = userProfile.targetCalories - totalCalories;
    const proteinDiff = userProfile.targetProteinG - totalProtein;

    if (aiProvider) {
      try {
        const systemPrompt = `You are an elite, compassionate AI Nutrition Coach.
Analyze the user's completed day of eating.
Target: ${userProfile.targetCalories} kcal, ${userProfile.targetProteinG}g Protein, ${userProfile.targetCarbsG}g Carbs, ${userProfile.targetFatG}g Fat.
Actual Consumed: ${totalCalories} kcal, ${totalProtein}g Protein, ${totalCarbs}g Carbs, ${totalFat}g Fat.
Water Consumed: ${dailyLog.waterConsumedMl || 0}ml (Goal: ${userProfile.waterTargetMl}ml).
Meals logged: ${JSON.stringify(meals, null, 2)}

Provide an objective, supportive audit:
1. Score the day from 1 to 10.
2. Identify wins (celebrate consistency, hydration, good macro choices).
3. Identify mistakes or blind spots (e.g. overeating fats, under-eating protein, skipping lunch, late-night high glycemic meals).
4. Provide a 2-3 step practical action plan for tomorrow.
5. Provide a 2-sentence encouraging coach summary.

Return ONLY a valid JSON object matching this schema:
{
  "scoreOutOf10": number,
  "wins": string[],
  "mistakes": string[],
  "tomorrowActionPlan": string[],
  "coachSummary": string
}`;

        const parsed = await aiProvider.generateJSON<any>({
          systemPrompt,
          userPrompt: 'Audit my day of eating.',
          temperature: 0.3,
        });

        if (parsed) {
          const audit: DailyAudit = {
            id: `audit-${Date.now()}`,
            date: dailyLog.date,
            caloriesConsumed: totalCalories,
            calorieTarget: userProfile.targetCalories,
            calorieDifference: calDiff,
            proteinConsumed: totalProtein,
            proteinTarget: userProfile.targetProteinG,
            carbsConsumed: totalCarbs,
            carbsTarget: userProfile.targetCarbsG,
            fatConsumed: totalFat,
            fatTarget: userProfile.targetFatG,
            scoreOutOf10: parsed.scoreOutOf10 || 8,
            wins: parsed.wins || [],
            mistakes: parsed.mistakes || [],
            tomorrowActionPlan: parsed.tomorrowActionPlan || [],
            coachSummary: parsed.coachSummary || 'Great effort today. Consistency is what yields transformation!',
          };
          return NextResponse.json({ ...audit, provider: aiProvider.name });
        }
      } catch (err: any) {
        console.warn(`[AI Factory] Provider ${aiProvider.name} audit error:`, err?.message);
      }
    }

    // Heuristic Audit Fallback
    const fallbackAudit = generateHeuristicAudit(dailyLog, userProfile, totalCalories, totalProtein, totalCarbs, totalFat, calDiff, proteinDiff);
    return NextResponse.json(fallbackAudit);
  } catch (err: any) {
    console.error('Error in audit-day API:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to generate audit' },
      { status: 500 }
    );
  }
}

function generateHeuristicAudit(
  dailyLog: DailyLog,
  userProfile: UserProfile,
  cals: number,
  protein: number,
  carbs: number,
  fat: number,
  calDiff: number,
  proteinDiff: number
): DailyAudit {
  const wins: string[] = [];
  const mistakes: string[] = [];
  const actionPlan: string[] = [];
  let score = 8.5;

  // Calorie analysis
  if (Math.abs(calDiff) <= 150) {
    wins.push(`Exceptional calorie control! Finished within ±${Math.abs(calDiff)} kcal of your ${userProfile.targetCalories} kcal budget.`);
  } else if (calDiff > 350) {
    mistakes.push(`Under-ate by ${calDiff} kcal. While in a fat-loss phase, an excessive deficit slows metabolism and triggers muscle breakdown.`);
    actionPlan.push(`Ensure you eat your planned dinner and snacks to hit at least ${userProfile.targetCalories - 200} kcal.`);
    score -= 1.0;
  } else if (calDiff < -200) {
    mistakes.push(`Exceeded your calorie limit by ${Math.abs(calDiff)} kcal, reducing your daily fat-loss deficit.`);
    actionPlan.push('Trim extra cooking oil or sugary drinks from your dinner tomorrow to stay within budget.');
    score -= 1.5;
  }

  // Protein analysis
  if (protein >= userProfile.targetProteinG * 0.9) {
    wins.push(`Hit your protein benchmark (${protein}g logged vs ${userProfile.targetProteinG}g target) — optimal for muscle retention and satiety!`);
  } else {
    mistakes.push(`Protein was ${proteinDiff}g below target (${protein}g vs ${userProfile.targetProteinG}g). Low protein leads to hunger pangs and sweet cravings.`);
    actionPlan.push('Incorporate 1 extra high-protein element into breakfast (e.g. 2 eggs, 50g paneer, or greek yogurt).');
    score -= 1.0;
  }

  // Water analysis
  if (dailyLog.waterConsumedMl >= userProfile.waterTargetMl * 0.8) {
    wins.push(`Great hydration! Logged ${dailyLog.waterConsumedMl}ml water.`);
  } else {
    mistakes.push(`Water intake fell short (${dailyLog.waterConsumedMl}ml vs ${userProfile.waterTargetMl}ml target). Dehydration is often mistaken by the brain as hunger.`);
    actionPlan.push('Keep a 1L water bottle at your desk and finish 2 full bottles before 3:00 PM.');
    score -= 0.5;
  }

  score = Math.max(4, Math.min(10, Math.round(score * 10) / 10));

  return {
    id: `audit-${Date.now()}`,
    date: dailyLog.date,
    caloriesConsumed: cals,
    calorieTarget: userProfile.targetCalories,
    calorieDifference: calDiff,
    proteinConsumed: protein,
    proteinTarget: userProfile.targetProteinG,
    carbsConsumed: carbs,
    carbsTarget: userProfile.targetCarbsG,
    fatConsumed: fat,
    fatTarget: userProfile.targetFatG,
    scoreOutOf10: score,
    wins: wins.length ? wins : ['Logged meals consistently throughout the day'],
    mistakes: mistakes.length ? mistakes : ['No major mistakes! You stayed strictly on track.'],
    tomorrowActionPlan: actionPlan.length ? actionPlan : ['Maintain the exact same routine tomorrow!'],
    coachSummary: `You earned a solid ${score}/10 today! Consistent days like this are how fat loss transformations happen.`,
  };
}
