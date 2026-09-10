import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateHeuristicWorkoutPlan } from '../src/app/api/ai/generate-workout/route';
import { generateHeuristicMultiWeekProgram } from '../src/app/api/ai/generate-workout-program/route';

describe('AI Workout Generation Engine', () => {
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
    assert.ok(plan.exercises.length >= 3, 'Should generate at least 3 exercises');
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

  it('should generate structured 4-week progressive overload program with wave periodization', () => {
    const program = generateHeuristicMultiWeekProgram({
      primaryGoal: 'Muscle hypertrophy',
      experienceLevel: 'Intermediate',
      daysAvailable: '4 days a week - Mon, Tue, Thu, Fri',
      equipmentAccess: 'Full commercial gym',
      injuries: 'Bad lower back',
      baselineFitness: 'Can bench 70kg, squat 90kg',
    });

    assert.ok(program.id, 'Program should have an ID');
    assert.strictEqual(program.weeks.length, 4, 'Should contain 4 progressive weeks');
    assert.ok(program.progressionRules.length > 0, 'Should outline clear progression rules');
    assert.strictEqual(program.weeks[0].weekNumber, 1);
    assert.strictEqual(program.weeks[3].weekNumber, 4);

    // Week 4 should be deload
    assert.ok(
      program.weeks[3].weekFocus.toLowerCase().includes('deload') ||
      program.weeks[3].progressionNote.toLowerCase().includes('deload'),
      'Week 4 should be deload'
    );

    // Check injury accommodation
    assert.ok(
      program.injuryAccommodations.toLowerCase().includes('back'),
      'Should protect lower back in program notes'
    );
  });
});

