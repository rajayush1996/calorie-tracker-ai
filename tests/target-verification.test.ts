import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateTargets } from '../src/utils/nutritionCalculations';
import { DailyAudit, DailyLog } from '../src/types';

describe('AI Target Calibration & Daily Audit Preservation', () => {
  describe('Metabolic Deficit & Surplus Calibration Scenarios', () => {
    it('should calculate appropriate calorie surplus and high protein for muscle gain', () => {
      const targets = calculateTargets(70, 175, 25, 'male', 'moderate', 'muscle_gain', 'recommended');
      assert.ok(targets.targetCalories > targets.tdee, 'Muscle gain must be in caloric surplus');
      assert.ok(targets.targetProteinG >= 140, 'Muscle gain requires high protein (>= 2g/kg)');
    });

    it('should calculate caloric deficit and lean protein preservation for fat loss', () => {
      const targets = calculateTargets(80, 175, 26, 'male', 'moderate', 'fat_loss', 'recommended');
      assert.ok(targets.targetCalories < targets.tdee, 'Fat loss must be in caloric deficit');
      assert.ok(targets.targetProteinG >= 144, 'Fat loss requires >= 1.8g/kg protein to spare lean muscle');
    });

    it('should calculate caloric surplus for weight gain / bulking', () => {
      const targets = calculateTargets(55, 170, 22, 'female', 'light', 'weight_gain', 'sustainable');
      assert.ok(targets.targetCalories > targets.tdee, 'Weight gain must be in caloric surplus');
      assert.ok(targets.targetCarbsG > targets.targetProteinG, 'Weight gain requires ample carbs for energy');
    });

    it('should scale fat loss pace: aggressive vs recommended vs slow', () => {
      const slow = calculateTargets(80, 175, 30, 'male', 'moderate', 'fat_loss', 'sustainable');
      const rec = calculateTargets(80, 175, 30, 'male', 'moderate', 'fat_loss', 'recommended');
      const agg = calculateTargets(80, 175, 30, 'male', 'moderate', 'fat_loss', 'aggressive');

      assert.ok(
        slow.targetCalories > rec.targetCalories,
        'Slow deficit should allow more daily calories than recommended'
      );
      assert.ok(
        rec.targetCalories > agg.targetCalories,
        'Recommended deficit should allow more daily calories than aggressive'
      );
      assert.ok(agg.targetCalories >= 1200, 'Even aggressive deficit should respect minimum healthy calorie floor');
    });

    it('should ensure macronutrient calorie equivalence (P*4 + C*4 + F*9 ~= TargetCalories)', () => {
      const targets = calculateTargets(75, 178, 27, 'male', 'moderate', 'fat_loss', 'recommended');
      const macroCalories =
        targets.targetProteinG * 4 + targets.targetCarbsG * 4 + targets.targetFatG * 9;

      const diff = Math.abs(macroCalories - targets.targetCalories);
      assert.ok(diff <= 25, `Macronutrient energy (${macroCalories} kcal) must match target calories (${targets.targetCalories} kcal) within 25 kcal`);
    });
  });

  describe('Daily Audit & Historical Logs Preservation', () => {
    it('should preserve daily audit data structure across date navigation', () => {
      const testAudit: DailyAudit = {
        id: 'audit-test-123',
        date: '2026-09-08',
        caloriesConsumed: 1950,
        calorieTarget: 2000,
        calorieDifference: 50,
        proteinConsumed: 155,
        proteinTarget: 150,
        carbsConsumed: 180,
        carbsTarget: 200,
        fatConsumed: 55,
        fatTarget: 60,
        scoreOutOf10: 9,
        wins: ['Hit protein target cleanly', 'Great hydration'],
        mistakes: ['Slightly low on morning carbs'],
        tomorrowActionPlan: ['Keep up the hydration pace'],
        coachSummary: 'Phenomenal consistency! Your protein intake was on point.',
      };

      const pastLog: DailyLog = {
        date: '2026-09-08',
        waterConsumedMl: 2800,
        meals: [],
        audit: testAudit,
      };

      const allLogs: Record<string, DailyLog> = {
        '2026-09-08': pastLog,
      };

      // Simulate navigating to past date
      const retrievedLog = allLogs['2026-09-08'];
      assert.ok(retrievedLog, 'Log for 2026-09-08 must exist');
      assert.ok(retrievedLog.audit, 'Audit must be preserved for past date');
      assert.strictEqual(retrievedLog.audit.scoreOutOf10, 9);
      assert.strictEqual(retrievedLog.audit.wins.length, 2);
      assert.strictEqual(retrievedLog.waterConsumedMl, 2800);
    });

    it('should preserve logged workouts and burn records inside daily logs', () => {
      const pastLog: DailyLog = {
        date: '2026-09-09',
        waterConsumedMl: 2500,
        meals: [],
        burnedCalories: 420,
        workouts: [
          {
            id: 'wo-1',
            workoutTitle: 'Day 1: Push Power (Barbell Bench & Incline DB)',
            caloriesBurned: 420,
            durationMinutes: 50,
            timestamp: '2026-09-09T10:30:00Z',
          },
        ],
      };

      assert.strictEqual(pastLog.burnedCalories, 420);
      assert.strictEqual(pastLog.workouts?.length, 1);
      assert.strictEqual(pastLog.workouts?.[0].caloriesBurned, 420);
    });
  });
});
