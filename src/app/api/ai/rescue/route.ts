import { NextRequest, NextResponse } from 'next/server';
import { getAIProvider, AIProviderType } from '@/lib/ai/factory';

export async function POST(req: NextRequest) {
  try {
    const {
      action,
      cravingText,
      cheatMealText,
      targetCalories = 1850,
      apiKey: clientApiKey,
      provider: clientProvider,
    } = await req.json();

    const aiProvider = getAIProvider({
      preferredProvider: clientProvider as AIProviderType,
      customApiKey: clientApiKey,
    });

    // 1. ACTION: CRAVING SWAPPER
    if (action === 'craving_swap') {
      if (!cravingText) {
        return NextResponse.json({ error: 'Craving text is required' }, { status: 400 });
      }

      if (aiProvider) {
        try {
          const prompt = `You are an empathetic sports nutritionist.
The user is having a strong craving right now: "${cravingText}".
Suggest an ultra-satisfying, fast 2-minute alternative using standard kitchen items (curd, fruits, oats, cocoa, peanut butter, chana, makhana, eggs, etc.) that crushes the craving for under 150 kcal while packing protein and satiety.

Return ONLY a valid JSON object:
{
  "cravingName": string,
  "originalEstimatedCalories": number,
  "swapTitle": string,
  "swapCalories": number,
  "swapProteinG": number,
  "caloriesSaved": number,
  "prepTime": string,
  "ingredients": string[],
  "quickRecipe": string,
  "psychologicalTip": string
}`;

          const result = await aiProvider.generateJSON({
            systemPrompt: 'You are an empathetic sports nutritionist. Return only valid JSON.',
            userPrompt: prompt,
            temperature: 0.3,
          });

          if (result) {
            return NextResponse.json({ ...result, provider: aiProvider.name });
          }
        } catch (e: any) {
          console.warn(`[AI Factory] ${aiProvider.name} craving swap error:`, e.message);
        }
      }

      // Smart Heuristic Craving Swap
      return NextResponse.json(generateHeuristicCravingSwap(cravingText));
    }

    // 2. ACTION: CHEAT-MEAL DAMAGE CONTROL
    if (action === 'damage_control') {
      if (!cheatMealText) {
        return NextResponse.json({ error: 'Cheat meal text is required' }, { status: 400 });
      }

      if (aiProvider) {
        try {
          const prompt = `You are a certified fitness coach.
The user just had a high-calorie cheat meal / party food: "${cheatMealText}".
User daily calorie target is ${targetCalories} kcal.
Provide an empathetic, scientifically grounded "Damage Control Plan".
Explain that 1 meal does not ruin fat loss (mostly water/glycogen).
Give a realistic calorie estimate, immediate relief step for tonight, and a gentle 24-hour offset strategy (light food tweaks, no extreme starving).

Return ONLY a valid JSON object:
{
  "estimatedCheatCalories": number,
  "reassuranceMessage": string,
  "tonightSteps": string[],
  "tomorrowPlan": string,
  "movementTip": string,
  "weeklyDeficitStatus": string
}`;

          const result = await aiProvider.generateJSON({
            systemPrompt: 'You are a certified fitness coach. Return only valid JSON.',
            userPrompt: prompt,
            temperature: 0.3,
          });

          if (result) {
            return NextResponse.json({ ...result, provider: aiProvider.name });
          }
        } catch (e: any) {
          console.warn(`[AI Factory] ${aiProvider.name} damage control error:`, e.message);
        }
      }

      // Smart Heuristic Damage Control
      return NextResponse.json(generateHeuristicDamageControl(cheatMealText, targetCalories));
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('Error in rescue API:', err);
    return NextResponse.json({ error: 'Failed to process rescue request' }, { status: 500 });
  }
}

function generateHeuristicCravingSwap(text: string) {
  const lower = text.toLowerCase();

  if (lower.includes('sweet') || lower.includes('chocolate') || lower.includes('ice cream') || lower.includes('pastry') || lower.includes('dessert')) {
    return {
      cravingName: 'Chocolate / Sweet Pastry',
      originalEstimatedCalories: 420,
      swapTitle: 'Chocolate Protein Mousse Bowl',
      swapCalories: 110,
      swapProteinG: 12,
      caloriesSaved: 310,
      prepTime: '2 mins',
      ingredients: ['120g Greek yogurt or hung curd', '1 tsp unsweetened cocoa powder', '1/2 tsp honey or stevia', 'Pinch of cinnamon'],
      quickRecipe: 'Whip hung curd with cocoa powder and sweetener until thick and creamy. Tastes like rich chocolate mousse!',
      psychologicalTip: 'Sweet cravings at 5 PM are often caused by dopamine dips or skipped protein at lunch. The protein here keeps you full until dinner.',
    };
  }

  if (lower.includes('chips') || lower.includes('crunchy') || lower.includes('salty') || lower.includes('namkeen') || lower.includes('fries')) {
    return {
      cravingName: 'Fried Chips / Salty Namkeen',
      originalEstimatedCalories: 380,
      swapTitle: 'Spiced Roasted Makhana & Chana Crunch',
      swapCalories: 130,
      swapProteinG: 8,
      caloriesSaved: 250,
      prepTime: '3 mins',
      ingredients: ['35g roasted chana or foxnuts (makhana)', 'Chaad masala, black salt', 'Lemon squeeze'],
      quickRecipe: 'Toss warm roasted chana or makhana with chaat masala and lime juice. Delivers that loud crunchy texture without deep frying.',
      psychologicalTip: 'Crunch cravings are often stress-related mastication relief. High fiber crunchy chana triggers jaw relaxation without oil calories.',
    };
  }

  // Default Chai / Biscuits or General Snack
  return {
    cravingName: 'Tea Time Biscuits / Bakery',
    originalEstimatedCalories: 340,
    swapTitle: 'Elaichi Black Tea & Cinnamon Apple Slices',
    swapCalories: 85,
    swapProteinG: 1,
    caloriesSaved: 255,
    prepTime: '2 mins',
    ingredients: ['1 crisp apple sliced', 'Pinch of cinnamon', '1 cup cardamom black tea or green tea'],
    quickRecipe: 'Dust warm sliced apples with cinnamon. Pair with aromatic hot chai without sugar. The natural pectin in apple satisfies stomach volume.',
    psychologicalTip: 'Liquid warm tea combined with solid chewy fiber tricks the vagus nerve into signaling full satiety within 10 minutes.',
  };
}

function generateHeuristicDamageControl(meal: string, targetCalories: number) {
  return {
    estimatedCheatCalories: 750,
    reassuranceMessage:
      'Breathe! One heavy meal does NOT ruin weeks of fat loss. 1 kg of pure fat requires ~7,700 kcal surplus. The scale spike tomorrow morning is 80% temporary water and sodium weight from restaurant seasoning.',
    tonightSteps: [
      'Drink 500ml of warm water with lemon before bed to help flush excess sodium.',
      'Do not starve yourself tomorrow—starving triggers hunger rebound and weekend binging.',
    ],
    tomorrowPlan:
      'Keep tomorrow normal: reduce lunch rice/bread by 1/3, focus on lean protein (boiled eggs, paneer, chicken), and skip sugary beverages.',
    movementTip: 'Go for a gentle 20-minute brisk walk tonight or tomorrow morning. This mobilizes glycogen stores right into muscle cells.',
    weeklyDeficitStatus: 'Your overall 7-day fat loss pace is still completely intact! Consistency > Perfection.',
  };
}
