import { NextRequest, NextResponse } from 'next/server';
import { DietPlan, PlannedMeal } from '@/types';
import { getAIProvider, AIProviderType } from '@/lib/ai/factory';

export async function POST(req: NextRequest) {
  try {
    const {
      dietType = 'veg',
      pantryText = '',
      scheduleText = '',
      targetCalories = 1800,
      targetProteinG = 140,
      apiKey: clientApiKey,
      provider: clientProvider,
    } = await req.json();

    const aiProvider = getAIProvider({
      preferredProvider: clientProvider as AIProviderType,
      customApiKey: clientApiKey,
    });

    if (aiProvider) {
      try {
        const systemPrompt = `You are an elite sports nutritionist and dietitian specializing in fat loss and muscle retention.
Design a highly practical, realistic 1-day meal plan strictly matching the user's criteria:
- Diet Preference: ${dietType}
- Available Foods / Groceries: ${pantryText || 'Standard household groceries'}
- Preferred Timings / Schedule: ${scheduleText || 'Breakfast 8:30 AM, Lunch 1:30 PM, Snack 5:00 PM, Dinner 8:30 PM'}
- Daily Calorie Target: ${targetCalories} kcal (aim to be within ±50 kcal)
- Daily Protein Target: ${targetProteinG}g

Ensure every meal lists realistic portion sizes (in grams and household measures like cups/pieces), calories, and protein. 
Use the accessible foods the user mentioned.

Return ONLY a JSON object matching this schema:
{
  "summaryNotes": string,
  "projectedWeeklyFatLossKg": number,
  "meals": [
    {
      "mealType": "breakfast" | "lunch" | "dinner" | "snack",
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

        const parsed = await aiProvider.generateJSON<any>({
          systemPrompt,
          userPrompt: `Generate a fat loss diet plan with: Diet=${dietType}, Pantry=${pantryText}, Schedule=${scheduleText}, Calories=${targetCalories}, Protein=${targetProteinG}g`,
          temperature: 0.3,
        });

        if (parsed && Array.isArray(parsed.meals)) {
          const fullPlan: DietPlan = {
            id: `plan-${Date.now()}`,
            dietType,
            pantryItems: pantryText ? pantryText.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
            scheduleDescription: scheduleText || 'Standard schedule',
            targetCalories,
            targetProteinG,
            meals: parsed.meals,
            summaryNotes: parsed.summaryNotes || 'Custom high-protein fat loss plan.',
            projectedWeeklyFatLossKg: parsed.projectedWeeklyFatLossKg || 0.5,
            createdAt: new Date().toISOString(),
          };

          return NextResponse.json({ ...fullPlan, provider: aiProvider.name });
        }
      } catch (err: any) {
        console.warn(`[AI Factory] Provider ${aiProvider.name} diet generation failed:`, err?.message);
      }
    }

    // Heuristic Diet Planner Fallback
    const fallbackPlan = generateHeuristicDietPlan(dietType, pantryText, scheduleText, targetCalories, targetProteinG);
    return NextResponse.json(fallbackPlan);
  } catch (err: any) {
    console.error('Error in suggest-diet API:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to suggest diet' },
      { status: 500 }
    );
  }
}

function generateHeuristicDietPlan(
  dietType: string,
  pantryText: string,
  scheduleText: string,
  targetCalories: number,
  targetProteinG: number
): DietPlan {
  const isNonVeg = dietType === 'non_veg';
  const isEggetarian = dietType === 'eggetarian' || isNonVeg;

  const meals: PlannedMeal[] = [
    {
      mealType: 'breakfast',
      time: '8:30 AM',
      title: isEggetarian ? 'Egg & Oat Power Breakfast' : 'High-Protein Paneer Oatmeal Bowl',
      items: isEggetarian
        ? [
            { name: 'Boiled / Scrambled Eggs', portion: '3 whole eggs', calories: 216, proteinG: 18, carbsG: 2, fatG: 15 },
            { name: 'Rolled Oats in Water/Milk', portion: '45g dry with 100ml milk', calories: 210, proteinG: 8, carbsG: 34, fatG: 4 },
            { name: 'Apple / Seasonal Fruit', portion: '1 medium fruit (120g)', calories: 65, proteinG: 0.5, carbsG: 16, fatG: 0.2 },
          ]
        : [
            { name: 'Low-Fat Paneer / Tofu', portion: '80g grated/sautéed', calories: 200, proteinG: 15, carbsG: 3, fatG: 14 },
            { name: 'Rolled Oats with Milk', portion: '50g oats in 150ml milk', calories: 260, proteinG: 11, carbsG: 40, fatG: 5 },
            { name: 'Chia Seeds / Almonds', portion: '1 tsp chia or 6 almonds', calories: 50, proteinG: 2, carbsG: 2, fatG: 4 },
          ],
      totalCalories: 491,
      proteinG: isEggetarian ? 26.5 : 28,
      tips: 'Drink 500ml of water right after waking up to activate metabolism.',
    },
    {
      mealType: 'lunch',
      time: '1:30 PM',
      title: isNonVeg ? 'Grilled Chicken Breast & Rice Bowl' : 'Sautéed Paneer, Dal & Whole Wheat Roti',
      items: isNonVeg
        ? [
            { name: 'Chicken Breast (Seasoned & Cooked)', portion: '160g cooked', calories: 265, proteinG: 48, carbsG: 0, fatG: 6 },
            { name: 'Steamed Basmati Rice', portion: '1 cup (~140g cooked)', calories: 180, proteinG: 4, carbsG: 39, fatG: 0.5 },
            { name: 'Mixed Cucumber & Tomato Salad', portion: '1 full bowl with lemon', calories: 45, proteinG: 2, carbsG: 8, fatG: 0.5 },
            { name: 'Tadka Dal', portion: '1 small bowl (100g)', calories: 110, proteinG: 6, carbsG: 15, fatG: 3 },
          ]
        : [
            { name: 'Plain Whole Wheat Roti', portion: '2 medium rotis (80g)', calories: 170, proteinG: 6, carbsG: 32, fatG: 2.5 },
            { name: 'Yellow Moong / Toor Dal', portion: '1.5 bowls (~220g)', calories: 210, proteinG: 12, carbsG: 28, fatG: 5 },
            { name: 'Low-Fat Paneer Bhurji / Cubes', portion: '100g', calories: 240, proteinG: 18, carbsG: 4, fatG: 17 },
            { name: 'Fresh Green Salad', portion: '1 large bowl with lime juice', calories: 40, proteinG: 2, carbsG: 8, fatG: 0.4 },
          ],
      totalCalories: isNonVeg ? 600 : 660,
      proteinG: isNonVeg ? 60 : 38,
      tips: 'Eat the green salad first to trigger natural satiety hormone leptin before carbs.',
    },
    {
      mealType: 'snack',
      time: '5:00 PM',
      title: 'Afternoon Energy & Protein Fuel',
      items: [
        { name: 'Roasted Chana / Greek Curd', portion: '40g roasted chana or 150g hung curd', calories: 150, proteinG: 10, carbsG: 22, fatG: 3 },
        { name: 'Black Coffee or Green Tea', portion: '1 large cup (no sugar)', calories: 5, proteinG: 0, carbsG: 1, fatG: 0 },
      ],
      totalCalories: 155,
      proteinG: 10,
      tips: 'Prevents evening energy dips and stops late-night binge eating.',
    },
    {
      mealType: 'dinner',
      time: '8:30 PM',
      title: 'Light Digestive Fat-Loss Dinner',
      items: [
        { name: 'Soya Chunks / Paneer / Tofu Stir-fry', portion: '40g soya chunks or 100g paneer with broccoli & capsicum', calories: 250, proteinG: 22, carbsG: 14, fatG: 7 },
        { name: 'Whole Wheat Roti / Quinoa', portion: '1 medium roti or 1/2 cup quinoa', calories: 95, proteinG: 3.5, carbsG: 18, fatG: 1.5 },
        { name: 'Clear Vegetable Soup / Dal', portion: '1 warm bowl', calories: 80, proteinG: 4, carbsG: 12, fatG: 1 },
      ],
      totalCalories: 425,
      proteinG: 29.5,
      tips: 'Finish dinner at least 2.5 hours before sleeping for optimal growth hormone release during sleep.',
    },
  ];

  const totalCals = meals.reduce((sum, m) => sum + m.totalCalories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.proteinG, 0);

  return {
    id: `plan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    dietType: dietType as any,
    targetCalories,
    targetProteinG,
    pantryItems: pantryText ? pantryText.split(',').map((s) => s.trim()) : ['Eggs', 'Oats', 'Paneer', 'Dal', 'Rice'],
    scheduleDescription: scheduleText || 'Standard 4-meal schedule',
    meals,
    summaryNotes: `Tailored ${dietType} fat loss plan. Delivers ~${totalCals} kcal with ~${Math.round(totalProtein)}g high-satiety protein.`,
    projectedWeeklyFatLossKg: 0.52,
  };
}
