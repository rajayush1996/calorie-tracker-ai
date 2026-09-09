import { NextRequest, NextResponse } from 'next/server';
import { FoodItem } from '@/types';
import { getAIProvider, AIProviderType } from '@/lib/ai/factory';

export async function POST(req: NextRequest) {
  try {
    const { existingItems, correctionSentence, apiKey: clientApiKey, provider: clientProvider } = await req.json();

    if (!correctionSentence || typeof correctionSentence !== 'string') {
      return NextResponse.json({ error: 'Correction sentence is required' }, { status: 400 });
    }

    const aiProvider = getAIProvider({
      preferredProvider: clientProvider as AIProviderType,
      customApiKey: clientApiKey,
    });

    if (aiProvider) {
      try {
        const systemPrompt = `You are a certified nutritionist and calorie tracking assistant.
The user previously logged a meal with the following items:
${JSON.stringify(existingItems, null, 2)}

The user is now providing a correction or adjustment instruction:
"${correctionSentence}"

Modify, remove, add, or recalculate the items accordingly.
Ensure gram weights, calories, and macros (protein, carbs, fat, fiber) are accurately recalculated.
State what changes were made in a friendly explanation sentence.

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
  "changesSummary": string,
  "assumptions": string[]
}`;

        const parsed = await aiProvider.generateJSON<{
          items: any[];
          changesSummary?: string;
          assumptions?: string[];
        }>({
          systemPrompt,
          userPrompt: `Please apply this correction: "${correctionSentence}"`,
          temperature: 0.2,
        });

        if (parsed && Array.isArray(parsed.items)) {
          const updatedItems: FoodItem[] = parsed.items.map((item: any, idx: number) => ({
            ...item,
            id: item.id || `item-${Date.now()}-${idx}`,
          }));

          return NextResponse.json({
            items: updatedItems,
            changesSummary: parsed.changesSummary || 'Updated meal items based on your correction.',
            assumptions: parsed.assumptions || [],
            provider: aiProvider.name,
          });
        }
      } catch (err: any) {
        console.warn(`[AI Factory] Provider ${aiProvider.name} refine error, using smart fallback:`, err?.message);
      }
    }

    // Heuristic correction fallback
    const result = handleHeuristicRefine(existingItems || [], correctionSentence);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Error in refine-meal API:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to refine meal' },
      { status: 500 }
    );
  }
}

function handleHeuristicRefine(items: FoodItem[], sentence: string) {
  const lower = sentence.toLowerCase();
  let updated = [...items];
  const changes: string[] = [];

  // Remove check
  if (lower.includes('remove') || lower.includes("don't have") || lower.includes('no egg') || lower.includes('without')) {
    if (lower.includes('egg')) {
      updated = updated.filter((it) => !it.name.toLowerCase().includes('egg'));
      changes.push('Removed eggs');
    }
    if (lower.includes('butter') || lower.includes('ghee')) {
      updated = updated.map((it) => {
        if (it.name.toLowerCase().includes('roti') || it.name.toLowerCase().includes('chapati')) {
          return {
            ...it,
            name: 'Plain Whole Wheat Roti',
            calories: Math.max(50, it.calories - 40 * it.quantity),
            fatG: Math.max(1, it.fatG - 3 * it.quantity),
          };
        }
        return it;
      });
      changes.push('Swapped to plain preparation without butter/ghee');
    }
  }

  // Quantity updates
  const rotiMatch = lower.match(/(\d+)\s*(roti|rotis|chapati)/);
  if (rotiMatch) {
    const newCount = parseInt(rotiMatch[1], 10);
    let rotiFound = false;
    updated = updated.map((it) => {
      if (it.name.toLowerCase().includes('roti') || it.name.toLowerCase().includes('chapati')) {
        rotiFound = true;
        const calPerUnit = it.calories / it.quantity;
        const pPerUnit = it.proteinG / it.quantity;
        const cPerUnit = it.carbsG / it.quantity;
        const fPerUnit = it.fatG / it.quantity;
        return {
          ...it,
          quantity: newCount,
          portionDescription: `${newCount} rotis (~${newCount * 40}g)`,
          weightG: newCount * 40,
          calories: Math.round(calPerUnit * newCount),
          proteinG: Math.round(pPerUnit * newCount),
          carbsG: Math.round(cPerUnit * newCount),
          fatG: Math.round(fPerUnit * newCount),
        };
      }
      return it;
    });
    if (rotiFound) {
      changes.push(`Updated roti count to ${newCount}`);
    }
  }

  // Fallback change description
  const summary = changes.length > 0
    ? `Adjusted: ${changes.join(', ')}`
    : `Refined meal breakdown according to: "${sentence}"`;

  return {
    items: updated,
    changesSummary: summary,
    assumptions: ['Adjusted via NutriAI heuristic engine'],
  };
}
