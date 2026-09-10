import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseHeuristicWorkoutDoc } from '../src/app/api/ai/parse-workout-doc/route';

describe('Gym & Trainer Workout Document Parser Engine', () => {
  it('should parse raw trainer text into 4-week structured progressive schedule', () => {
    const rawText = `
    Trainer Split Sheet:
    Day 1: Bench Press 4x8, Incline DB Press 3x10, DB Overhead Press 3x10, Lat Raises 4x15, Skullcrushers 3x12, Ab wheel 3x15
    Day 2: Lat Pulldown 4x8, Barbell Row 3x10, Chest Supported Row 3x10, Face Pulls 3x15, Incline DB Curls 3x12, Hammer Curls 3x12
    Day 3: Barbell Squat 4x8, Romanian Deadlift 3x10, Walking Lunges 3x10, Leg Extension 3x12, Calf Raises 4x15, Hanging Leg Raise 3x12
    Day 4: Incline Barbell Press 4x8, Neutral Pullups 4x8, Dips 3x10, Cable Rows 3x12, Cable Lateral Raise 4x15, Cable Crunch 3x15
    `;

    const program = parseHeuristicWorkoutDoc({
      fileText: rawText,
      fileName: 'Gym_Routine_Whiteboard.txt',
      experienceLevel: 'Intermediate',
      equipmentAccess: 'Full commercial gym',
    });

    assert.ok(program.id, 'Program should have an ID');
    assert.strictEqual(program.weeks.length, 4, 'Should build a 4-week wave periodized program');
    assert.ok(program.progressionRules.length >= 3, 'Should generate clear overload rules');

    // Verify 4 training days per week
    for (const week of program.weeks) {
      assert.strictEqual(week.days.length, 4, 'Should have 4 structured training days');

      // Verify authentic gym volume (5 to 6 exercises per session)
      for (const day of week.days) {
        assert.ok(
          day.exercises.length >= 5 && day.exercises.length <= 6,
          `Day ${day.dayName} must contain 5 to 6 exercises, found ${day.exercises.length}`
        );

        // Verify exercise parameters
        for (const ex of day.exercises) {
          assert.ok(ex.name, 'Exercise must have a name');
          assert.ok(ex.sets >= 2 && ex.sets <= 5, 'Exercise must have realistic sets (2-5)');
          assert.ok(ex.repRange, 'Exercise must have rep range');
          assert.ok(ex.restSeconds > 0, 'Exercise must have rest interval');
          assert.ok(ex.diagramType, 'Exercise must have visual diagram mapping');
          assert.ok(ex.progressionRule, 'Exercise must have progression cue');
        }
      }
    }
  });

  it('should create wave periodization across weeks (Week 1 Calibration to Week 4 Deload)', () => {
    const program = parseHeuristicWorkoutDoc({
      fileText: 'Full gym push pull legs routine with coach',
      fileName: 'Trainer_Program.pdf',
      experienceLevel: 'Advanced',
      equipmentAccess: 'Full commercial gym',
    });

    assert.strictEqual(program.weeks[0].weekNumber, 1);
    assert.strictEqual(program.weeks[3].weekNumber, 4);

    const week1Day1 = program.weeks[0].days[0];
    const week4Day1 = program.weeks[3].days[0];

    // Deload week should have lower overall calories and volume
    assert.ok(
      week4Day1.estimatedCaloriesBurn <= week1Day1.estimatedCaloriesBurn,
      'Deload week should have reduced volume and burn'
    );
    assert.ok(
      program.weeks[3].weekFocus.toLowerCase().includes('deload'),
      'Week 4 should explicitly focus on deload recovery'
    );
  });

  it('should support home dumbbell routines when commercial gym is unavailable', () => {
    const program = parseHeuristicWorkoutDoc({
      fileText: 'Dumbbells and bench routine at home',
      fileName: 'Home_Workout.txt',
      experienceLevel: 'Beginner',
      equipmentAccess: 'Home with dumbbells & bands',
    });

    assert.ok(program.title, 'Should have program title');
    assert.ok(program.weeks.length === 4, 'Should have 4 weeks');
    const day1Exercises = program.weeks[0].days[0].exercises;
    assert.ok(day1Exercises.length >= 5, 'Should have at least 5 exercises for home workout');
  });
});
