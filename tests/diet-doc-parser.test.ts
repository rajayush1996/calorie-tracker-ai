import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseHeuristicDietDoc } from '../src/app/api/ai/parse-diet-doc/route';

describe('Diet Document & Nutrition Chart Parser Engine', () => {
  it('should parse diet document text into balanced daily meals matching target calories', () => {
    const rawDietText = `
    Personalized Diet Chart from Nutritionist:
    Brunch (11:30 AM): 2 Whole wheat rotis with yellow moong dal (1 cup) and bowl of curd
    Snack (4:00 PM): 100g Paneer cubes lightly sautéed with sprouts
    Dinner (9:00 PM): 2 rotis with mixed veg sabzi and fresh cucumber salad
    Daily Target: 2100 kcal, 140g protein
    `;

    const plan = parseHeuristicDietDoc({
      fileText: rawDietText,
      fileName: 'Nutritionist_Plan.txt',
      targetCalories: 2100,
      targetProteinG: 140,
    });

    assert.ok(plan.id, 'Plan should have an ID');
    assert.strictEqual(plan.targetCalories, 2100);
    assert.strictEqual(plan.targetProteinG, 140);
    assert.strictEqual(plan.meals.length, 3, 'Should generate 3 structured daily meals');

    // Check Meal 1 (Brunch)
    assert.strictEqual(plan.meals[0].mealType, 'meal_1');
    assert.ok(plan.meals[0].items.length > 0, 'Meal 1 should contain food items');
    assert.ok(plan.meals[0].totalCalories > 0, 'Meal 1 should have calories');
    assert.ok(plan.meals[0].proteinG > 0, 'Meal 1 should have protein');

    // Check Meal 2 (Mid-Day)
    assert.strictEqual(plan.meals[1].mealType, 'meal_2');
    assert.ok(plan.meals[1].items.length > 0, 'Meal 2 should contain food items');

    // Check Meal 3 (Dinner)
    assert.strictEqual(plan.meals[2].mealType, 'meal_3');
    assert.ok(plan.meals[2].items.length > 0, 'Meal 3 should contain food items');

    // Sum of meal calories should approximately match targetCalories
    const sumCalories = plan.meals.reduce((sum, m) => sum + m.totalCalories, 0);
    assert.ok(
      Math.abs(sumCalories - 2100) < 100,
      `Sum of meal calories (${sumCalories}) should be within 100 kcal of target (2100)`
    );

    // Sum of protein should approximately match targetProtein
    const sumProtein = plan.meals.reduce((sum, m) => sum + m.proteinG, 0);
    assert.ok(
      Math.abs(sumProtein - 140) < 15,
      `Sum of meal protein (${sumProtein}g) should be within 15g of target (140g)`
    );
  });

  it('should use sensible default targets (2000 kcal, 130g protein) when none provided', () => {
    const plan = parseHeuristicDietDoc({
      fileText: 'General gym diet chart for fat loss',
      fileName: 'Diet_Chart.pdf',
    });

    assert.strictEqual(plan.targetCalories, 2000);
    assert.strictEqual(plan.targetProteinG, 130);
    assert.strictEqual(plan.meals.length, 3);
    assert.ok(plan.summaryNotes.includes('Diet_Chart.pdf'));
  });
});
