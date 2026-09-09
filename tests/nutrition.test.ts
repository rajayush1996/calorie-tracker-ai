import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculateBMR,
  calculateTDEE,
  calculateTargets,
  calculateBMI,
  calculateWeightLossJourney,
} from '../src/utils/nutritionCalculations';

describe('Nutrition & Metabolic Calculation Engine', () => {
  it('should accurately calculate BMR for a male using Mifflin-St Jeor formula', () => {
    // Male: 10 * weight(75) + 6.25 * height(175) - 5 * age(25) + 5
    // 750 + 1093.75 - 125 + 5 = 1723.75 -> round = 1724
    const bmr = calculateBMR(75, 175, 25, 'male');
    assert.strictEqual(bmr, 1724);
  });

  it('should accurately calculate BMR for a female using Mifflin-St Jeor formula', () => {
    // Female: 10 * weight(60) + 6.25 * height(160) - 5 * age(28) - 161
    // 600 + 1000 - 140 - 161 = 1299
    const bmr = calculateBMR(60, 160, 28, 'female');
    assert.strictEqual(bmr, 1299);
  });

  it('should calculate correct TDEE based on activity levels', () => {
    const bmr = 1700;
    const sedentaryTdee = calculateTDEE(bmr, 'sedentary'); // 1700 * 1.2 = 2040
    const moderateTdee = calculateTDEE(bmr, 'moderate');   // 1700 * 1.55 = 2635

    assert.strictEqual(sedentaryTdee, 2040);
    assert.strictEqual(moderateTdee, 2635);
  });

  it('should generate balanced fat loss targets with correct macros', () => {
    const result = calculateTargets(80, 175, 28, 'male', 'moderate', 'fat_loss', 'recommended');

    // TDEE should be higher than targetCalories (caloric deficit for fat loss)
    assert.ok(result.targetCalories < result.tdee, 'Target calories should be below TDEE for fat loss');
    assert.strictEqual(result.tdee - result.targetCalories, 500);

    // High protein for muscle preservation: ~2g/kg = 160g
    assert.ok(result.targetProteinG >= 150, 'Protein target should be >= 150g for 80kg male');

    // Water target check: ~35ml per kg = 2800ml
    assert.strictEqual(result.waterTargetMl, 2800);
  });

  it('should calculate BMI and category correctly', () => {
    const { bmi, category } = calculateBMI(75, 175);
    assert.strictEqual(bmi, 24.5);
    assert.strictEqual(category, 'Normal');
  });

  it('should calculate weight loss milestones and weeks needed', () => {
    // 80kg down to 75kg = 5kg loss at 0.5kg/week = 10 weeks
    const journey = calculateWeightLossJourney(80, 75, 'recommended');
    assert.strictEqual(journey.weeksNeeded, 10);
    assert.strictEqual(journey.projectionPoints.length, 11);
  });

  it('should generate muscle building targets with surplus calories and optimal protein', () => {
    // 70kg male, moderate activity, muscle gain recommended (+350 kcal)
    const result = calculateTargets(70, 175, 25, 'male', 'moderate', 'muscle_gain', 'recommended');
    assert.strictEqual(result.targetCalories - result.tdee, 350, 'Surplus should be exactly +350 kcal');
    // Protein target: 70 * 2.1 = 147g
    assert.strictEqual(result.targetProteinG, 147);
    assert.ok(result.targetCarbsG > 200, 'Carbs should be high to fuel intense lifting');
  });

  it('should generate healthy weight gain targets with surplus and balanced macros', () => {
    // 55kg skinny individual wanting healthy weight gain (+500 kcal)
    const result = calculateTargets(55, 170, 22, 'male', 'light', 'weight_gain', 'recommended');
    assert.strictEqual(result.targetCalories - result.tdee, 500, 'Surplus should be exactly +500 kcal');
    assert.ok(result.targetCalories > result.tdee);
    assert.strictEqual(result.targetProteinG, Math.round(55 * 1.8));
  });

  it('should generate exact maintenance targets matching TDEE', () => {
    const result = calculateTargets(75, 180, 30, 'male', 'moderate', 'maintenance', 'recommended');
    assert.strictEqual(result.targetCalories, result.tdee, 'Maintenance calories should equal TDEE');
  });

  it('should calculate upward weight gain trajectory accurately', () => {
    // 60kg aiming for 67kg (+7kg gain) with muscle_gain (0.35kg/wk) -> 7 / 0.35 = 20 weeks
    const journey = calculateWeightLossJourney(60, 67, 'recommended', 'muscle_gain');
    assert.strictEqual(journey.weeksNeeded, 20);
    assert.strictEqual(journey.projectionPoints[0].projectedWeight, 60);
    const lastPoint = journey.projectionPoints[journey.projectionPoints.length - 1];
    assert.ok(lastPoint.projectedWeight > 60, 'Projected weight should increase over time');
  });
});
