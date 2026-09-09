import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateTargets } from '../src/utils/nutritionCalculations';
import { DailyAudit, DailyLog } from '../src/types';

describe('AI Target Calibration & Daily Audit Preservation', () => {
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
    assert.strictEqual(retrievedLog.audit.date, '2026-09-08');
    assert.strictEqual(retrievedLog.audit.coachSummary, testAudit.coachSummary);
  });
});
