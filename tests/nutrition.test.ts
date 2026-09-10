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
  describe('BMR & TDEE Calculations', () => {
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

    it('should calculate correct TDEE across all activity multiplier levels', () => {
      const bmr = 1700;
      assert.strictEqual(calculateTDEE(bmr, 'sedentary'), Math.round(1700 * 1.2));     // 2040
      assert.strictEqual(calculateTDEE(bmr, 'light'), Math.round(1700 * 1.375));       // 2338
      assert.strictEqual(calculateTDEE(bmr, 'moderate'), Math.round(1700 * 1.55));     // 2635
      assert.strictEqual(calculateTDEE(bmr, 'active'), Math.round(1700 * 1.725));       // 2933
      assert.strictEqual(calculateTDEE(bmr, 'very_active'), Math.round(1700 * 1.9));   // 3230
    });
  });

  describe('BMI and Weight Categories', () => {
    it('should categorize normal weight correctly', () => {
      const { bmi, category } = calculateBMI(75, 175);
      assert.strictEqual(bmi, 24.5);
      assert.strictEqual(category, 'Normal');
    });

    it('should categorize underweight correctly', () => {
      const { bmi, category } = calculateBMI(45, 170);
      assert.ok(bmi < 18.5);
      assert.strictEqual(category, 'Underweight');
    });

    it('should categorize overweight correctly', () => {
      const { bmi, category } = calculateBMI(85, 175);
      assert.ok(bmi >= 25 && bmi < 30);
      assert.strictEqual(category, 'Overweight');
    });

    it('should categorize obese correctly', () => {
      const { bmi, category } = calculateBMI(110, 175);
      assert.ok(bmi >= 30);
      assert.strictEqual(category, 'Obese');
    });
  });

  describe('Goal Target Generation & Macro Splits', () => {
    it('should generate balanced fat loss targets with high protein and water requirements', () => {
      const result = calculateTargets(80, 175, 28, 'male', 'moderate', 'fat_loss', 'recommended');

      assert.ok(result.targetCalories < result.tdee, 'Target calories should be below TDEE for fat loss');
      assert.strictEqual(result.tdee - result.targetCalories, 500);

      // High protein for muscle preservation: ~2g/kg = 160g
      assert.ok(result.targetProteinG >= 150, 'Protein target should be >= 150g for 80kg male');

      // Water target check: ~35ml per kg = 2800ml
      assert.strictEqual(result.waterTargetMl, 2800);
    });

    it('should generate muscle building targets with surplus calories and optimal protein', () => {
      const result = calculateTargets(70, 175, 25, 'male', 'moderate', 'muscle_gain', 'recommended');
      assert.strictEqual(result.targetCalories - result.tdee, 350, 'Surplus should be exactly +350 kcal');
      assert.strictEqual(result.targetProteinG, 147);
      assert.ok(result.targetCarbsG > 200, 'Carbs should be high to fuel intense lifting');
    });

    it('should generate healthy weight gain targets with surplus and balanced macros', () => {
      const result = calculateTargets(55, 170, 22, 'male', 'light', 'weight_gain', 'recommended');
      assert.strictEqual(result.targetCalories - result.tdee, 500, 'Surplus should be exactly +500 kcal');
      assert.ok(result.targetCalories > result.tdee);
      assert.strictEqual(result.targetProteinG, Math.round(55 * 1.8));
    });

    it('should generate exact maintenance targets matching TDEE', () => {
      const result = calculateTargets(75, 180, 30, 'male', 'moderate', 'maintenance', 'recommended');
      assert.strictEqual(result.targetCalories, result.tdee, 'Maintenance calories should equal TDEE');
    });
  });

  describe('Milestone Projections & Journey Timeline', () => {
    it('should calculate weight loss milestones and weeks needed', () => {
      const journey = calculateWeightLossJourney(80, 75, 'recommended');
      assert.strictEqual(journey.weeksNeeded, 10);
      assert.strictEqual(journey.projectionPoints.length, 11);
      assert.strictEqual(journey.projectionPoints[0].projectedWeight, 80);
      assert.strictEqual(journey.projectionPoints[10].projectedWeight, 75);
    });

    it('should calculate upward weight gain trajectory accurately', () => {
      const journey = calculateWeightLossJourney(60, 67, 'recommended', 'muscle_gain');
      assert.strictEqual(journey.weeksNeeded, 20);
      assert.strictEqual(journey.projectionPoints[0].projectedWeight, 60);
      const lastPoint = journey.projectionPoints[journey.projectionPoints.length - 1];
      assert.ok(lastPoint.projectedWeight > 60, 'Projected weight should increase over time');
    });
  });
});
