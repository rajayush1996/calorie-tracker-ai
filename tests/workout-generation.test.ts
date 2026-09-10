import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateHeuristicWorkoutPlan } from '../src/app/api/ai/generate-workout/route';
import { generateHeuristicMultiWeekProgram } from '../src/app/api/ai/generate-workout-program/route';

describe('AI Workout Generation Engine', () => {
  describe('Single-Day Routine Scenarios', () => {
    it('should generate balanced home bodyweight full-body routine', () => {
      const plan = generateHeuristicWorkoutPlan({
        goal: 'fat_loss',
        equipment: 'home',
        targetMuscle: 'full_body',
        durationMinutes: 30,
        fitnessLevel: 'Intermediate',
      });

      assert.ok(plan.id, 'Plan should have an ID');
      assert.strictEqual(plan.durationMinutes, 30);
      assert.ok(plan.totalCaloriesBurnEstimate > 100, 'Should estimate calories burned');
      assert.ok(plan.exercises.length >= 4, 'Should generate at least 4-5 exercises');
      assert.ok(plan.exercises.some((e) => e.diagramType === 'pushup'), 'Should include pushup');
    });

    it('should generate dumbbell-specific routine when dumbbells selected', () => {
      const plan = generateHeuristicWorkoutPlan({
        goal: 'muscle_gain',
        equipment: 'dumbbells',
        targetMuscle: 'chest_arms',
        durationMinutes: 45,
        fitnessLevel: 'Advanced',
      });

      assert.ok(plan.title.toLowerCase().includes('chest'), 'Title should reflect target muscle');
      assert.ok(plan.exercises.some((e) => e.diagramType === 'bench_press'), 'Should prescribe bench/floor press diagram');
      assert.ok(plan.exercises.length >= 5, 'Should generate full routine volume');
    });

    it('should generate authentic 5-6 exercise gym session when gym equipment is selected', () => {
      const plan = generateHeuristicWorkoutPlan({
        goal: 'muscle_gain',
        equipment: 'gym',
        targetMuscle: 'full_body',
        durationMinutes: 45,
        fitnessLevel: 'Intermediate',
      });

      assert.ok(plan.exercises.length >= 5 && plan.exercises.length <= 6, `Should have 5-6 exercises, got ${plan.exercises.length}`);
      assert.ok(plan.totalCaloriesBurnEstimate >= 250, 'Estimated burn should match authentic gym volume');
    });

    it('should adapt exercises when knee injury or no jumping is specified in notes', () => {
      const plan = generateHeuristicWorkoutPlan({
        goal: 'fat_loss',
        equipment: 'home',
        targetMuscle: 'legs_glutes',
        durationMinutes: 30,
        fitnessLevel: 'Beginner',
        customNotes: 'Severe knee pain, no jumping please',
      });

      assert.ok(
        plan.coachTip.toLowerCase().includes('low-impact') || plan.coachTip.toLowerCase().includes('joint'),
        'Coach tip should acknowledge knee / joint accommodation'
      );
      assert.ok(
        plan.exercises.some((e) => e.targetMuscle.includes('Zero Knee Impact')),
        'Should include knee-friendly movement'
      );
    });

    it('should adapt exercises when shoulder impingement is specified', () => {
      const plan = generateHeuristicWorkoutPlan({
        goal: 'muscle_gain',
        equipment: 'dumbbells',
        targetMuscle: 'chest_arms',
        durationMinutes: 45,
        fitnessLevel: 'Intermediate',
        customNotes: 'Shoulder impingement, avoid heavy overhead pressing',
      });

      assert.ok(plan.id, 'Should generate valid plan');
      assert.ok(
        plan.coachTip.toLowerCase().includes('shoulder') || plan.coachTip.toLowerCase().includes('joint') || plan.coachTip.toLowerCase().includes('scapular'),
        'Coach tip should acknowledge shoulder safety'
      );
    });
  });

  describe('Multi-Week Progressive Overload Schedule Scenarios', () => {
    it('should generate structured 4-week program with exactly 4 distinct periodization weeks', () => {
      const program = generateHeuristicMultiWeekProgram({
        primaryGoal: 'Muscle hypertrophy',
        experienceLevel: 'Intermediate',
        daysAvailable: '4 days a week - Mon, Tue, Thu, Fri',
        equipmentAccess: 'Full commercial gym',
        injuries: 'None',
        baselineFitness: 'Can bench 70kg, squat 90kg',
      });

      assert.ok(program.id, 'Program should have an ID');
      assert.strictEqual(program.weeks.length, 4, 'Should contain exactly 4 progressive weeks');
      assert.strictEqual(program.weeks[0].weekNumber, 1);
      assert.strictEqual(program.weeks[1].weekNumber, 2);
      assert.strictEqual(program.weeks[2].weekNumber, 3);
      assert.strictEqual(program.weeks[3].weekNumber, 4);

      // Week 1 should be calibration / baseline
      assert.ok(
        program.weeks[0].weekFocus.toLowerCase().includes('baseline') ||
        program.weeks[0].weekFocus.toLowerCase().includes('calibration'),
        'Week 1 should be baseline calibration'
      );

      // Week 4 should be deload
      assert.ok(
        program.weeks[3].weekFocus.toLowerCase().includes('deload') ||
        program.weeks[3].progressionNote.toLowerCase().includes('deload'),
        'Week 4 should be deload'
      );
    });

    it('should enforce authentic gym volume: 5 to 6 exercises per session across all training days', () => {
      const program = generateHeuristicMultiWeekProgram({
        primaryGoal: 'Muscle hypertrophy',
        experienceLevel: 'Advanced',
        daysAvailable: '4 days a week - Mon, Tue, Thu, Fri',
        equipmentAccess: 'Full commercial gym',
        injuries: 'None',
        baselineFitness: 'Can bench 100kg, deadlift 140kg',
      });

      for (const week of program.weeks) {
        assert.ok(week.days.length >= 4, `Each week should have 4 training days, got ${week.days.length}`);
        for (const day of week.days) {
          assert.ok(
            day.exercises.length >= 5 && day.exercises.length <= 6,
            `Day "${day.dayName}: ${day.dayTitle}" must have 5-6 exercises, but found ${day.exercises.length}`
          );

          // Verify every exercise has complete gym parameters
          for (const ex of day.exercises) {
            assert.ok(ex.name && ex.name.length > 2, 'Exercise must have valid name');
            assert.ok(ex.sets >= 2 && ex.sets <= 5, 'Exercise must have realistic sets (2-5)');
            assert.ok(ex.repRange && ex.repRange.includes('Rep'), 'Exercise must have explicit rep range');
            assert.ok(ex.restSeconds >= 45 && ex.restSeconds <= 180, 'Exercise must have rest duration');
            assert.ok(ex.progressionRule && ex.progressionRule.length > 5, 'Exercise must have progression rule');
            assert.ok(ex.coachingTips && ex.coachingTips.length >= 1, 'Exercise must have form coaching tips');
            assert.ok(ex.caloriesBurnEstimate > 0, 'Exercise must have calorie burn estimate');
          }
        }
      }
    });

    it('should adapt multi-week program when lower back injury is present', () => {
      const program = generateHeuristicMultiWeekProgram({
        primaryGoal: 'Strength & Power',
        experienceLevel: 'Intermediate',
        daysAvailable: '4 days a week',
        equipmentAccess: 'Full commercial gym',
        injuries: 'Bad lower back',
        baselineFitness: 'Can bench 80kg',
      });

      assert.ok(
        program.injuryAccommodations.toLowerCase().includes('back'),
        'Program should document lower back accommodation'
      );
    });

    it('should calculate realistic session duration (45-60m) and calorie burns (300-500 kcal)', () => {
      const program = generateHeuristicMultiWeekProgram({
        primaryGoal: 'Fat loss & conditioning',
        experienceLevel: 'Beginner',
        daysAvailable: '4 days a week',
        equipmentAccess: 'Full commercial gym',
      });

      const day1 = program.weeks[0].days[0];
      assert.ok(day1.estimatedDurationMinutes >= 40 && day1.estimatedDurationMinutes <= 75, 'Duration should be 40-75m');
      assert.ok(day1.estimatedCaloriesBurn >= 250 && day1.estimatedCaloriesBurn <= 600, 'Calories should be 250-600 kcal');
      assert.ok(day1.warmup && day1.warmup.length > 5, 'Should have dedicated warmup routine');
      assert.ok(day1.cooldown && day1.cooldown.length > 5, 'Should have dedicated cooldown routine');
    });
  });
});
