import { NextRequest, NextResponse } from 'next/server';
import { FoodItem } from '@/types';
import { getAIProvider, AIProviderType } from '@/lib/ai/factory';

export async function POST(req: NextRequest) {
  try {
    const { sentence, apiKey: clientApiKey, provider: clientProvider } = await req.json();

    if (!sentence || typeof sentence !== 'string') {
      return NextResponse.json({ error: 'Sentence is required' }, { status: 400 });
    }

    const aiProvider = getAIProvider({
      preferredProvider: clientProvider as AIProviderType,
      customApiKey: clientApiKey,
    });

    if (aiProvider) {
      try {
        const systemPrompt = `You are a certified sports nutritionist and AI calorie tracker. 
Parse the user's natural language meal description into a structured JSON list of food items.
Be realistic with portion sizes, weights (in grams), calories, and macronutrients (protein, carbs, fat, fiber).
Also provide a list of assumptions made (e.g. "Assumed medium apple ~150g", "Assumed homemade dal with 1 tsp ghee").
Suggest a clarification if something is ambiguous (e.g. "Did your coffee have sugar or full cream milk?").

Return ONLY a valid JSON object matching this schema:
{
  "items": [
    {
      "name": string,
      "quantity": number,
      "unit": string,
      "portionDescription": string,
      "weightG": number,
      "calories": number,
      "proteinG": number,
      "carbsG": number,
      "fatG": number,
      "fiberG": number,
      "confidence": "high" | "medium" | "low"
    }
  ],
  "assumptions": string[],
  "clarification": string | null
}`;

        const parsed = await aiProvider.generateJSON<{
          items: any[];
          assumptions?: string[];
          clarification?: string | null;
        }>({
          systemPrompt,
          userPrompt: sentence,
          temperature: 0.2,
        });

        if (parsed && Array.isArray(parsed.items)) {
          const itemsWithIds: FoodItem[] = parsed.items.map((item: any, idx: number) => ({
            ...item,
            id: `item-${Date.now()}-${idx}`,
          }));

          return NextResponse.json({
            items: itemsWithIds,
            assumptions: parsed.assumptions || [],
            clarification: parsed.clarification || null,
            provider: aiProvider.name,
          });
        }
      } catch (err: any) {
        console.warn(`[AI Factory] Provider ${aiProvider.name} failed, falling back to smart heuristic:`, err?.message);
      }
    }

    // Smart heuristic fallback when API key is not yet configured
    const fallbackData = generateHeuristicMealParse(sentence);
    return NextResponse.json(fallbackData);
  } catch (err: any) {
    console.error('Error in parse-meal API:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to parse meal' },
      { status: 500 }
    );
  }
}

// Fallback heuristic database for common queries
export function generateHeuristicMealParse(sentence: string) {
  const lower = sentence.toLowerCase();
  const items: FoodItem[] = [];
  const assumptions: string[] = ['Estimated using NutriAI Smart Heuristics database'];
  let clarification: string | null = null;

  // Roti / Chapati
  const rotiMatch = lower.match(/(\d+)?\s*(roti|rotis|chapati|chapatis)/);
  if (rotiMatch) {
    const count = rotiMatch[1] ? parseInt(rotiMatch[1], 10) : 2;
    const hasButter = lower.includes('butter') || lower.includes('ghee');
    const calsPerRoti = hasButter ? 125 : 85;
    const fatPerRoti = hasButter ? 4.5 : 1.2;
    items.push({
      id: `item-${Date.now()}-roti`,
      name: hasButter ? 'Butter Roti / Chapati' : 'Plain Whole Wheat Roti',
      quantity: count,
      unit: 'piece',
      portionDescription: `${count} medium handmade rotis (~${count * 40}g total)`,
      weightG: count * 40,
      calories: count * calsPerRoti,
      proteinG: count * 3,
      carbsG: count * 15,
      fatG: Math.round(count * fatPerRoti),
      fiberG: count * 2,
      confidence: 'high',
    });
    assumptions.push(hasButter ? 'Included 1 tsp ghee/butter per roti' : 'Calculated as dry plain roti');
  }

  // Dal
  if (lower.includes('dal') || lower.includes('daal') || lower.includes('lentil')) {
    const isMakhani = lower.includes('makhani');
    items.push({
      id: `item-${Date.now()}-dal`,
      name: isMakhani ? 'Dal Makhani' : 'Yellow Dal Tadka',
      quantity: 1,
      unit: 'bowl',
      portionDescription: '1 medium home bowl (~180g)',
      weightG: 180,
      calories: isMakhani ? 280 : 160,
      proteinG: isMakhani ? 9 : 8,
      carbsG: isMakhani ? 26 : 20,
      fatG: isMakhani ? 16 : 5,
      fiberG: 4,
      confidence: 'high',
    });
    assumptions.push('Assumed standard home-cooked preparation with cumin-ghee tadka');
  }

  // Rice
  if (lower.includes('rice')) {
    const isFried = lower.includes('fried') || lower.includes('biryani') || lower.includes('pulao');
    items.push({
      id: `item-${Date.now()}-rice`,
      name: isFried ? 'Pulao / Fried Rice' : 'Steamed White Rice',
      quantity: 1,
      unit: 'cup',
      portionDescription: '1 standard cup (~150g cooked)',
      weightG: 150,
      calories: isFried ? 240 : 195,
      proteinG: 4,
      carbsG: 42,
      fatG: isFried ? 6 : 0.5,
      fiberG: 1,
      confidence: 'high',
    });
  }

  // Paneer
  if (lower.includes('paneer') || lower.includes('cottage cheese')) {
    items.push({
      id: `item-${Date.now()}-paneer`,
      name: 'Paneer Curry / Bhurji',
      quantity: 1,
      unit: 'bowl',
      portionDescription: '~120g portion (~60g paneer cubes)',
      weightG: 120,
      calories: 260,
      proteinG: 14,
      carbsG: 8,
      fatG: 19,
      fiberG: 2,
      confidence: 'medium',
    });
  }

  // Eggs
  const eggMatch = lower.match(/(\d+)?\s*(egg|eggs|boiled egg|omelette)/);
  if (eggMatch) {
    const count = eggMatch[1] ? parseInt(eggMatch[1], 10) : 2;
    const isOmelette = lower.includes('omelette') || lower.includes('scrambled');
    items.push({
      id: `item-${Date.now()}-egg`,
      name: isOmelette ? 'Scrambled Eggs / Omelette' : 'Boiled Eggs',
      quantity: count,
      unit: 'large',
      portionDescription: `${count} whole eggs`,
      weightG: count * 50,
      calories: count * (isOmelette ? 95 : 72),
      proteinG: count * 6,
      carbsG: count * 1,
      fatG: count * (isOmelette ? 7 : 5),
      fiberG: 0,
      confidence: 'high',
    });
  }

  // Chicken
  if (lower.includes('chicken')) {
    items.push({
      id: `item-${Date.now()}-chicken`,
      name: 'Grilled / Curry Chicken Breast',
      quantity: 1,
      unit: 'serving',
      portionDescription: '150g boneless chicken cooked',
      weightG: 150,
      calories: 240,
      proteinG: 34,
      carbsG: 2,
      fatG: 10,
      fiberG: 1,
      confidence: 'high',
    });
  }

  // Oats
  if (lower.includes('oats') || lower.includes('oatmeal')) {
    items.push({
      id: `item-${Date.now()}-oats`,
      name: 'Rolled Oats with Milk',
      quantity: 1,
      unit: 'bowl',
      portionDescription: '50g oats in 200ml milk',
      weightG: 250,
      calories: 290,
      proteinG: 13,
      carbsG: 48,
      fatG: 6,
      fiberG: 5,
      confidence: 'high',
    });
  }

  // Curd / Yogurt / Dahi
  if (lower.includes('curd') || lower.includes('dahi') || lower.includes('yogurt')) {
    items.push({
      id: `item-${Date.now()}-curd`,
      name: 'Plain Curd / Dahi',
      quantity: 1,
      unit: 'small bowl',
      portionDescription: '100g fresh homemade curd',
      weightG: 100,
      calories: 98,
      proteinG: 4,
      carbsG: 5,
      fatG: 6,
      fiberG: 0,
      confidence: 'high',
    });
  }

  // Coffee / Tea / Chai
  if (lower.includes('tea') || lower.includes('chai') || lower.includes('coffee')) {
    const hasSugar = !lower.includes('no sugar') && !lower.includes('black');
    items.push({
      id: `item-${Date.now()}-beverage`,
      name: lower.includes('coffee') ? 'Milk Coffee' : 'Masala Chai',
      quantity: 1,
      unit: 'cup',
      portionDescription: '1 cup (~150ml with milk)',
      weightG: 150,
      calories: hasSugar ? 110 : 65,
      proteinG: 3,
      carbsG: hasSugar ? 15 : 6,
      fatG: 3,
      fiberG: 0,
      confidence: 'medium',
    });
    if (hasSugar) {
      clarification = 'Did you have sugar in your drink? (Assumed 1 tsp sugar)';
    }
  }

  // If nothing matched, provide an intelligent parsed generic meal based on word extraction
  if (items.length === 0) {
    items.push({
      id: `item-${Date.now()}-generic`,
      name: sentence.trim().slice(0, 40) || 'Custom Meal',
      quantity: 1,
      unit: 'portion',
      portionDescription: 'Standard estimated serving (~200g)',
      weightG: 200,
      calories: 350,
      proteinG: 15,
      carbsG: 45,
      fatG: 12,
      fiberG: 4,
      confidence: 'medium',
    });
    assumptions.push('Add OpenAI API Key in Settings for deeper sentence comprehension');
  }

  return { items, assumptions, clarification };
}
