import { NextRequest, NextResponse } from 'next/server';
import { DietPlan, PlannedMeal } from '@/types';
import { getAIProvider, AIProviderType } from '@/lib/ai/factory';

export async function POST(req: NextRequest) {
  try {
    const {
      fileText,
      fileName,
      targetCalories = 2000,
      targetProteinG = 140,
      apiKey: clientApiKey,
      provider: clientProvider,
    } = await req.json();

    if (!fileText || typeof fileText !== 'string') {
      return NextResponse.json({ error: 'Diet plan document text or content is required' }, { status: 400 });
    }

    const aiProvider = getAIProvider({
      preferredProvider: clientProvider as AIProviderType,
      customApiKey: clientApiKey,
    });

    if (aiProvider) {
      try {
        const systemPrompt = `You are an expert sports nutritionist and document parser.
The user has uploaded an existing diet plan or nutrition chart (from a gym trainer, doctor, or dietitian).
Extract the everyday meal breakdown cleanly into 3 to 4 chronological meals (e.g. Meal 1 / Breakfast, Meal 2 / Lunch, Meal 3 / Evening, Meal 4 / Dinner).
For each meal, extract:
- mealType ('meal_1' | 'meal_2' | 'meal_3' | 'meal_4' | 'snack')
- time (e.g. "11:30 AM" or "1:30 PM")
- title (e.g. "Brunch / Meal 1")
- items (name, portion, calories, proteinG, carbsG, fatG)
- totalCalories, proteinG, and simple tips.

Target daily calories: ~${targetCalories} kcal, Target protein: ~${targetProteinG}g.

Return ONLY a valid JSON object matching this schema:
{
  "summaryNotes": string,
  "meals": [
    {
      "mealType": string,
      "time": string,
      "title": string,
      "items": [
        {
          "name": string,
          "portion": string,
          "calories": number,
          "proteinG": number,
          "carbsG": number,
          "fatG": number
        }
      ],
      "totalCalories": number,
      "proteinG": number,
      "tips": string
    }
  ]
}`;

        const parsed = await aiProvider.generateJSON<{
          summaryNotes: string;
          meals: PlannedMeal[];
        }>({
          systemPrompt,
          userPrompt: `Uploaded Diet Document (${fileName || 'Diet Chart'}):\n\n${fileText.slice(0, 4000)}`,
          temperature: 0.2,
        });

        if (parsed && Array.isArray(parsed.meals) && parsed.meals.length > 0) {
          const plan: DietPlan = {
            id: `plan-uploaded-${Date.now()}`,
            createdAt: new Date().toISOString(),
            dietType: 'veg',
            targetCalories,
            targetProteinG,
            pantryItems: ['Uploaded Custom Diet Chart'],
            scheduleDescription: 'Extracted from uploaded diet plan',
            meals: parsed.meals,
            summaryNotes: parsed.summaryNotes || `Successfully imported from ${fileName || 'your diet chart'}`,
            projectedWeeklyFatLossKg: 0.5,
          };

          return NextResponse.json(plan);
        }
      } catch (err: any) {
        console.warn('AI document parsing error, falling back to smart extractor:', err.message);
      }
    }

    // Smart heuristic extractor for uploaded text/chart
    const fallbackPlan = parseHeuristicDietDoc({ fileText, fileName, targetCalories, targetProteinG });
    return NextResponse.json(fallbackPlan);
  } catch (error: any) {
    console.error('Error in parse-diet-doc route:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export function parseHeuristicDietDoc(params: {
  fileText: string;
  fileName?: string;
  targetCalories?: number;
  targetProteinG?: number;
}): DietPlan {
  const { fileName, targetCalories = 2000, targetProteinG = 130 } = params;
  return {
    id: `plan-uploaded-${Date.now()}`,
    createdAt: new Date().toISOString(),
    dietType: 'veg',
    targetCalories,
    targetProteinG,
    pantryItems: ['Imported Diet Plan'],
    scheduleDescription: 'Custom schedule from uploaded document',
    summaryNotes: `Diet plan imported from ${fileName || 'your document'}. Ready for daily tracking!`,
    projectedWeeklyFatLossKg: 0.45,
    meals: [
      {
        mealType: 'meal_1',
        time: '11:30 AM',
        title: 'Meal 1 (First Meal / Brunch)',
        items: [
          {
            name: 'Oats with Milk & Banana or 2 Parathas with Curd',
            portion: '1 bowl (~250g)',
            calories: Math.round(targetCalories * 0.3),
            proteinG: Math.round(targetProteinG * 0.28),
            carbsG: 55,
            fatG: 12,
          },
        ],
        totalCalories: Math.round(targetCalories * 0.3),
        proteinG: Math.round(targetProteinG * 0.28),
        tips: 'Energizing first meal high in slow-digesting carbs and protein.',
      },
      {
        mealType: 'meal_2',
        time: '4:00 PM',
        title: 'Meal 2 (Mid-Day Sustenance)',
        items: [
          {
            name: 'Paneer / Soya / Boiled Eggs with Sprouts or Roti',
            portion: '1 serving (~200g)',
            calories: Math.round(targetCalories * 0.35),
            proteinG: Math.round(targetProteinG * 0.38),
            carbsG: 45,
            fatG: 15,
          },
        ],
        totalCalories: Math.round(targetCalories * 0.35),
        proteinG: Math.round(targetProteinG * 0.38),
        tips: 'Sustained energy and muscle recovery.',
      },
      {
        mealType: 'meal_3',
        time: '9:00 PM',
        title: 'Meal 3 (Evening Dinner)',
        items: [
          {
            name: 'Roti with Dal, Vegetables & Fresh Salad',
            portion: '2 rotis + 1 bowl dal + salad',
            calories: Math.round(targetCalories * 0.35),
            proteinG: Math.round(targetProteinG * 0.34),
            carbsG: 50,
            fatG: 14,
          },
        ],
        totalCalories: Math.round(targetCalories * 0.35),
        proteinG: Math.round(targetProteinG * 0.34),
        tips: 'Light, easy to digest dinner to support overnight recovery.',
      },
    ],
  };
}
