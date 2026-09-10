import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateHeuristicMealParse } from '../src/app/api/ai/parse-meal/route';
import { getAIProvider } from '../src/lib/ai/factory';

describe('AI Meal Parsing & Nutrition Extractor Logic', () => {
  describe('Offline Heuristic Parser Scenarios', () => {
    it('should parse multi-item combo meal (2 rotis + 1 bowl dal)', () => {
      const result = generateHeuristicMealParse('2 rotis and 1 bowl yellow dal');

      assert.strictEqual(result.items.length, 2, 'Should extract exactly 2 food items');

      const roti = result.items.find((i) => i.name.toLowerCase().includes('roti'));
      const dal = result.items.find((i) => i.name.toLowerCase().includes('dal'));

      assert.ok(roti, 'Roti should be parsed');
      assert.strictEqual(roti?.quantity, 2);
      assert.strictEqual(roti?.calories, 170); // 2 * 85
      assert.strictEqual(roti?.proteinG, 6); // 2 * 3

      assert.ok(dal, 'Dal should be parsed');
      assert.strictEqual(dal?.calories, 160);
      assert.strictEqual(dal?.proteinG, 8);

      const totalCals = result.items.reduce((s, it) => s + it.calories, 0);
      assert.strictEqual(totalCals, 330, 'Total meal calories should be 330 kcal');
    });

    it('should accurately account for butter / ghee addition on rotis', () => {
      const dryRoti = generateHeuristicMealParse('2 rotis');
      const butterRoti = generateHeuristicMealParse('2 rotis with ghee butter');

      const dryItem = dryRoti.items[0];
      const butterItem = butterRoti.items[0];

      assert.strictEqual(dryItem.calories, 170);
      assert.strictEqual(butterItem.calories, 250); // 2 * 125 kcal
      assert.ok(butterItem.fatG > dryItem.fatG, 'Butter roti must have higher fat');
      assert.ok(butterRoti.assumptions.some((a) => a.toLowerCase().includes('ghee')));
    });

    it('should distinguish light yellow dal from high-calorie dal makhani', () => {
      const yellowDal = generateHeuristicMealParse('1 bowl yellow dal');
      const dalMakhani = generateHeuristicMealParse('1 bowl dal makhani');

      const yellow = yellowDal.items[0];
      const makhani = dalMakhani.items[0];

      assert.strictEqual(yellow.calories, 160);
      assert.strictEqual(makhani.calories, 280);
      assert.strictEqual(makhani.fatG, 16);
    });

    it('should parse egg preparations: boiled eggs vs omelette', () => {
      const boiled = generateHeuristicMealParse('3 boiled eggs');
      const omelette = generateHeuristicMealParse('2 eggs omelette');

      assert.strictEqual(boiled.items[0].quantity, 3);
      assert.strictEqual(boiled.items[0].calories, 216); // 3 * 72
      assert.strictEqual(boiled.items[0].proteinG, 18); // 3 * 6

      assert.strictEqual(omelette.items[0].quantity, 2);
      assert.strictEqual(omelette.items[0].calories, 190); // 2 * 95
      assert.ok(omelette.items[0].fatG > boiled.items[0].fatG / 3 * 2, 'Omelette includes cooking oil/butter');
    });

    it('should parse high-protein chicken breast and paneer correctly', () => {
      const chicken = generateHeuristicMealParse('chicken breast curry');
      const paneer = generateHeuristicMealParse('paneer bhurji');

      assert.strictEqual(chicken.items[0].proteinG, 34);
      assert.strictEqual(chicken.items[0].calories, 240);

      assert.strictEqual(paneer.items[0].proteinG, 14);
      assert.strictEqual(paneer.items[0].calories, 260);
    });

    it('should generate clarification prompt for beverages with optional sugar', () => {
      const teaWithSugar = generateHeuristicMealParse('1 cup masala chai');
      assert.strictEqual(teaWithSugar.items[0].calories, 110);
      assert.ok(teaWithSugar.clarification?.includes('sugar'), 'Should prompt user about sugar');

      const blackCoffee = generateHeuristicMealParse('1 cup black coffee no sugar');
      assert.strictEqual(blackCoffee.items[0].calories, 65);
      assert.strictEqual(blackCoffee.clarification, null, 'No sugar clarification needed when black');
    });

    it('should fall back gracefully to a generic parsed food for unknown inputs', () => {
      const unknown = generateHeuristicMealParse('mystery exotic dish');
      assert.strictEqual(unknown.items.length, 1);
      assert.ok(unknown.items[0].calories > 0);
      assert.ok(unknown.assumptions.length > 0);
    });
  });

  describe('Live AI Model Provider Integration', () => {
    it('should test live OpenAI provider meal parsing if OPENAI_API_KEY is available', async () => {
      const provider = getAIProvider({ preferredProvider: 'openai' });

      if (!provider) {
        console.log('Skipping live OpenAI network test (no API key configured)');
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
});
