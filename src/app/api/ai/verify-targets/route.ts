import { NextRequest, NextResponse } from 'next/server';
import { FitnessGoal, DietType, ActivityLevel, Gender, TransformationPace } from '@/types';
import { getAIProvider, AIProviderType } from '@/lib/ai/factory';
import { calculateTargets, getPaceConfig } from '@/utils/nutritionCalculations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      age = 25,
      gender = 'male',
      heightCm = 172,
      currentWeightKg = 75,
      targetWeightKg = 70,
      activityLevel = 'moderate',
      goal = 'fat_loss',
      dietType = 'veg',
      pace = 'recommended',
      apiKey: clientApiKey,
      provider: clientProvider,
    } = body;

    // Baseline calculation using Mifflin-St Jeor
    const baseline = calculateTargets(
      Number(currentWeightKg) || 75,
      Number(heightCm) || 172,
      Number(age) || 25,
      gender as Gender,
      activityLevel as ActivityLevel,
      goal as FitnessGoal,
      pace as TransformationPace
    );

    const aiProvider = getAIProvider({
      preferredProvider: clientProvider as AIProviderType,
      customApiKey: clientApiKey,
    });

    if (aiProvider) {
      try {
        const systemPrompt = `You are a world-class clinical sports scientist and performance nutrition researcher.
Your task is to analyze the user's biological metrics, fitness goal, and dietary lifestyle, then calculate and verify optimal daily calories and macronutrients:
- Biological Metrics: ${gender}, ${age} yrs, ${heightCm}cm, Current: ${currentWeightKg}kg, Target: ${targetWeightKg}kg
- Activity Level: ${activityLevel}
- Fitness Goal: ${goal} (e.g. fat_loss, muscle_gain, weight_gain, maintenance)
- Diet Type: ${dietType} (e.g. veg, non_veg, eggetarian, vegan, jain)
- Transformation Pace: ${pace}

Guidelines for Protein & Macros:
1. For 'muscle_gain' (Hypertrophy / Lean Bulk):
   - Needs a caloric surplus of +200 to +400 kcal above TDEE.
   - Protein should be optimal for muscle protein synthesis (2.0 - 2.2g per kg bodyweight).
   - If vegetarian/vegan, ensure protein target accounts for plant protein leucine thresholds.
2. For 'weight_gain' (Healthy Bulking / Underweight Recovery):
   - Caloric surplus of +400 to +600 kcal above TDEE.
   - Balanced protein (1.8 - 2.0g/kg) and higher healthy fats (25-30%) for easy calorie density.
3. For 'fat_loss' (Cutting / Leaning Down):
   - Caloric deficit of -350 to -600 kcal below TDEE.
   - High protein (2.0 - 2.2g/kg) to protect lean muscle mass from catabolism.
4. For 'maintenance' (Recomposition):
   - Calories match TDEE. Protein at 1.8 - 2.0g/kg.

Return ONLY a valid JSON object matching this schema:
{
  "targetCalories": number,
  "targetProteinG": number,
  "targetCarbsG": number,
  "targetFatG": number,
  "waterTargetMl": number,
  "aiExplanation": string,
  "weeklyRateKg": number,
  "confidence": "high" | "medium"
}`;

        const parsed = await aiProvider.generateJSON<any>({
          systemPrompt,
          userPrompt: `Verify targets for: Goal=${goal}, Diet=${dietType}, Pace=${pace}, Weight=${currentWeightKg}kg, TargetWeight=${targetWeightKg}kg, BaselineTDEE=${baseline.tdee}kcal`,
          temperature: 0.2,
        });

        if (
          parsed &&
          typeof parsed.targetCalories === 'number' &&
          typeof parsed.targetProteinG === 'number'
        ) {
          return NextResponse.json({
            targetCalories: Math.round(parsed.targetCalories),
            targetProteinG: Math.round(parsed.targetProteinG),
            targetCarbsG: Math.round(parsed.targetCarbsG || baseline.targetCarbsG),
            targetFatG: Math.round(parsed.targetFatG || baseline.targetFatG),
            waterTargetMl: Math.round(parsed.waterTargetMl || baseline.waterTargetMl),
            aiExplanation: parsed.aiExplanation || `AI verified nutrition targets calibrated for ${goal.replace('_', ' ')}.`,
            weeklyRateKg: parsed.weeklyRateKg || 0.4,
            confidence: parsed.confidence || 'high',
            provider: aiProvider.name,
          });
        }
      } catch (err: any) {
        console.warn(`[AI Verify Targets] Provider ${aiProvider.name} failed:`, err?.message);
      }
    }

    // Heuristic Fallback
    const paceInfo = getPaceConfig(goal as FitnessGoal, pace as TransformationPace);
    let explanation = '';
    if (goal === 'muscle_gain') {
      explanation = `Calculated for muscle hypertrophy on a ${dietType} diet: TDEE (${baseline.tdee} kcal) + ${paceInfo.calorieDelta} kcal surplus with ${baseline.targetProteinG}g protein (2.1g/kg) to maximize muscle protein synthesis.`;
    } else if (goal === 'weight_gain') {
      explanation = `Calculated for healthy weight gain: TDEE (${baseline.tdee} kcal) + ${paceInfo.calorieDelta} kcal surplus with balanced protein and healthy fats for clean mass growth.`;
    } else if (goal === 'maintenance') {
      explanation = `Matched exactly to your daily expenditure (${baseline.tdee} kcal) for weight stability and body recomposition.`;
    } else {
      explanation = `Calibrated for sustainable fat loss: TDEE (${baseline.tdee} kcal) with a ${Math.abs(paceInfo.calorieDelta)} kcal deficit while maintaining ${baseline.targetProteinG}g protein to safeguard lean muscle.`;
    }

    return NextResponse.json({
      targetCalories: baseline.targetCalories,
      targetProteinG: baseline.targetProteinG,
      targetCarbsG: baseline.targetCarbsG,
      targetFatG: baseline.targetFatG,
      waterTargetMl: baseline.waterTargetMl,
      aiExplanation: explanation,
      weeklyRateKg: Math.abs(paceInfo.estimatedWeeklyKg),
      confidence: 'high',
      provider: 'scientific-mifflin-engine',
    });
  } catch (err: any) {
    console.error('Error in verify-targets API:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to verify targets' },
      { status: 500 }
    );
  }
}
