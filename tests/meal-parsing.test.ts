import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getAIProvider } from '../src/lib/ai/factory';

describe('AI Meal Parsing & Self-Correction Logic', () => {
  it('should test OpenAI provider meal parsing if OPENAI_API_KEY is available in env', async () => {
    const provider = getAIProvider({ preferredProvider: 'openai' });

    if (!provider) {
      console.log('Skipping live OpenAI network test (no key)');
      return;
    }

    assert.strictEqual(provider.name, 'openai');

    const result = await provider.generateJSON<{
      items: Array<{ name: string; calories: number; proteinG: number }>;
    }>({
      systemPrompt: 'You are a certified nutritionist. Parse meal into JSON: { items: [{ name, calories, proteinG }] }',
      userPrompt: '2 whole wheat rotis and 1 bowl yellow dal',
      temperature: 0.1,
    });

    assert.ok(result, 'Result should be returned');
    assert.ok(Array.isArray(result.items), 'Items should be an array');
    assert.ok(result.items.length >= 2, 'Should detect at least 2 food items');

    const totalCals = result.items.reduce((s, it) => s + it.calories, 0);
    assert.ok(totalCals > 200 && totalCals < 600, `Calories should be realistic (~300-500 kcal), got ${totalCals}`);
  });
});
