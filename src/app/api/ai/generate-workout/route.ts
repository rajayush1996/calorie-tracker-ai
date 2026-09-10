import { NextRequest, NextResponse } from 'next/server';
import { WorkoutPlan, ExerciseItem } from '@/types';
import { getAIProvider, AIProviderType } from '@/lib/ai/factory';

export async function POST(req: NextRequest) {
  try {
    const {
      goal = 'fat_loss',
      equipment = 'home',
      targetMuscle = 'full_body',
      durationMinutes = 30,
      fitnessLevel = 'Intermediate',
      customNotes = '',
      apiKey: clientApiKey,
      provider: clientProvider,
    } = await req.json();

    const aiProvider = getAIProvider({
      preferredProvider: clientProvider as AIProviderType,
      customApiKey: clientApiKey,
    });

    if (aiProvider) {
      try {
        const goalExpertise =
          goal === 'muscle_gain'
            ? 'specializing in hypertrophy, progressive overload, and mass building'
            : goal === 'weight_gain'
            ? 'specializing in lean mass building, strength, and caloric retention'
            : goal === 'maintenance'
            ? 'specializing in functional athletic conditioning and injury prevention'
            : 'specializing in high metabolic caloric burn, fat shredding, and muscle preservation';

        const systemPrompt = `You are a certified strength & conditioning coach and biomechanics specialist ${goalExpertise}.
Design an ultra-effective, practical single-session workout plan strictly matching the user's requirements:
- Goal: ${goal.replace('_', ' ')}
- Equipment / Location: ${equipment} (only prescribe exercises feasible with this equipment!)
- Focus Muscle Group: ${targetMuscle.replace('_', ' ')}
- Duration: ${durationMinutes} minutes
- Fitness Level: ${fitnessLevel}
- Custom Instructions / Injury Restrictions: ${customNotes || 'None'}

CRITICAL GUIDELINES:
1. If user specified physical restrictions (e.g. knee pain, lower back issue, no jumping), strictly adhere to them and substitute safe alternative exercises.
2. Prescribe realistic sets (2-4), reps or duration (e.g., "10 - 12 reps" or "40 seconds"), and clear, actionable coaching form cues (bullet points).
3. Diagram types MUST be one of: "pushup", "squat", "pullup", "plank", "lunge", "bench_press", "crunch", "jumping_jack". Choose the closest visual match.
4. Total estimated calories burned should realistically reflect the duration and intensity (e.g. 20 min ~150-180 kcal, 30 min ~220-280 kcal, 45 min ~320-400 kcal).

Return ONLY a JSON object matching this schema:
{
  "title": string,
  "targetMuscle": string,
  "equipment": string,
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "durationMinutes": number,
  "totalCaloriesBurnEstimate": number,
  "coachTip": string,
  "warmupTip": string,
  "cooldownTip": string,
  "exercises": [
    {
      "name": string,
      "category": "chest" | "back" | "legs" | "core" | "cardio",
      "targetMuscle": string,
      "recommendedSets": string,
      "repsOrDuration": string,
      "difficulty": "Beginner" | "Intermediate" | "Advanced",
      "coachingTips": string[],
      "caloriesBurnEstimate": number,
      "diagramType": "pushup" | "squat" | "pullup" | "plank" | "lunge" | "bench_press" | "crunch" | "jumping_jack"
    }
  ]
}`;

        const parsed = await aiProvider.generateJSON<any>({
          systemPrompt,
          userPrompt: `Generate a workout with: Goal=${goal}, Equipment=${equipment}, Focus=${targetMuscle}, Duration=${durationMinutes}m, Level=${fitnessLevel}, Notes=${customNotes}`,
          temperature: 0.3,
        });

        if (parsed && Array.isArray(parsed.exercises) && parsed.exercises.length > 0) {
          const exercisesWithIds: ExerciseItem[] = parsed.exercises.map((ex: any, idx: number) => ({
            id: `ex-gen-${Date.now()}-${idx}`,
            name: ex.name || 'Exercise',
            category: ex.category || 'chest',
            targetMuscle: ex.targetMuscle || 'Target Muscle',
            recommendedSets: ex.recommendedSets || '3 Sets',
            repsOrDuration: ex.repsOrDuration || '10 - 12 Reps',
            difficulty: (ex.difficulty as any) || fitnessLevel,
            coachingTips: Array.isArray(ex.coachingTips) ? ex.coachingTips : ['Maintain neutral spine and controlled breathing.'],
            caloriesBurnEstimate: Number(ex.caloriesBurnEstimate) || 45,
            diagramType: ex.diagramType || 'pushup',
          }));

          const fullPlan: WorkoutPlan = {
            id: `workout-${Date.now()}`,
            title: parsed.title || `${durationMinutes}-Min ${targetMuscle.replace('_', ' ').toUpperCase()} Routine`,
            targetMuscle: parsed.targetMuscle || targetMuscle.replace('_', ' '),
            equipment: parsed.equipment || equipment,
            difficulty: (parsed.difficulty as any) || fitnessLevel,
            durationMinutes: Number(parsed.durationMinutes) || durationMinutes,
            totalCaloriesBurnEstimate:
              Number(parsed.totalCaloriesBurnEstimate) ||
              exercisesWithIds.reduce((sum, e) => sum + e.caloriesBurnEstimate, 0),
            coachTip: parsed.coachTip || 'Control every eccentric phase and keep your core braced.',
            warmupTip: parsed.warmupTip || 'Spend 3-5 minutes with dynamic arm swings and bodyweight hip circles.',
            cooldownTip: parsed.cooldownTip || 'Finish with 3 minutes of static stretches for worked muscle groups.',
            exercises: exercisesWithIds,
            createdAt: new Date().toISOString(),
          };

          return NextResponse.json({ ...fullPlan, provider: aiProvider.name });
        }
      } catch (err: any) {
        console.warn(`[AI Factory] Provider ${aiProvider.name} workout generation failed:`, err?.message);
      }
    }

    // Heuristic Fallback
    const fallbackPlan = generateHeuristicWorkoutPlan({
      goal,
      equipment,
      targetMuscle,
      durationMinutes,
      fitnessLevel,
      customNotes,
    });

    return NextResponse.json(fallbackPlan);
  } catch (err: any) {
    console.error('Error in generate-workout API:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to generate workout plan' },
      { status: 500 }
    );
  }
}

export function generateHeuristicWorkoutPlan(params: {
  goal?: string;
  equipment?: string;
  targetMuscle?: string;
  durationMinutes?: number;
  fitnessLevel?: string;
  customNotes?: string;
}): WorkoutPlan {
  const {
    goal = 'fat_loss',
    equipment = 'home',
    targetMuscle = 'full_body',
    durationMinutes = 30,
    fitnessLevel = 'Intermediate',
    customNotes = '',
  } = params;

  const isHome = equipment === 'home' || equipment === 'bodyweight';
  const isDumbbell = equipment === 'dumbbells';
  const hasKneeRestriction = /knee|joint|no jump/i.test(customNotes);

  const pool: Record<string, ExerciseItem[]> = {
    chest: [
      {
        id: 'h-chest-1',
        name: isDumbbell ? 'Dumbbell Floor Press' : 'Standard Push-Up',
        category: 'chest',
        targetMuscle: 'Chest, Triceps & Front Delts',
        recommendedSets: fitnessLevel === 'Beginner' ? '3 Sets' : '4 Sets',
        repsOrDuration: isDumbbell ? '10 - 12 Reps' : '12 - 15 Reps',
        difficulty: fitnessLevel as any,
        coachingTips: [
          'Keep elbows tucked at roughly 45 degrees, avoiding excessive flare.',
          'Full lockout at top with controlled 2-second eccentric lowering.',
        ],
        caloriesBurnEstimate: 50,
        diagramType: isDumbbell ? 'bench_press' : 'pushup',
      },
      {
        id: 'h-chest-2',
        name: isHome ? 'Diamond / Close-Grip Push-Up' : 'Incline Dumbbell Press',
        category: 'chest',
        targetMuscle: 'Upper Chest & Triceps',
        recommendedSets: '3 Sets',
        repsOrDuration: '10 - 12 Reps',
        difficulty: 'Intermediate',
        coachingTips: [
          'Keep core braced and squeeze triceps hard at the peak of extension.',
          'Breathe out forcefully as you drive through your palms.',
        ],
        caloriesBurnEstimate: 45,
        diagramType: isHome ? 'pushup' : 'bench_press',
      },
    ],
    back: [
      {
        id: 'h-back-1',
        name: isDumbbell ? 'Dual Dumbbell Bent-Over Row' : isHome ? 'Doorframe / Towel Inverted Row' : 'Lat Pulldown',
        category: 'back',
        targetMuscle: 'Lats, Rhomboids & Biceps',
        recommendedSets: '3 - 4 Sets',
        repsOrDuration: '10 - 12 Reps',
        difficulty: fitnessLevel as any,
        coachingTips: [
          'Hinge hips back with flat spine; initiate pull by driving elbows past ribs.',
          'Pause 1 second at full contraction to maximize lat recruitment.',
        ],
        caloriesBurnEstimate: 55,
        diagramType: 'pullup',
      },
    ],
    legs: [
      {
        id: 'h-legs-1',
        name: hasKneeRestriction
          ? 'Glute Bridge with Hold'
          : isDumbbell
          ? 'Goblet Squat'
          : 'Bodyweight Deep Squat',
        category: 'legs',
        targetMuscle: hasKneeRestriction ? 'Glutes & Hamstrings (Zero Knee Impact)' : 'Quadriceps & Glutes',
        recommendedSets: '3 Sets',
        repsOrDuration: hasKneeRestriction ? '15 Reps (2s pause)' : '15 - 20 Reps',
        difficulty: fitnessLevel as any,
        coachingTips: hasKneeRestriction
          ? ['Drive through heels, squeeze glutes at top without arching lower back.', 'Completely knee-friendly isometric bridge.']
          : ['Keep chest lifted high, sit back into hips, drive through midfoot.', 'Knees track naturally in line with toes.'],
        caloriesBurnEstimate: 60,
        diagramType: 'squat',
      },
      {
        id: 'h-legs-2',
        name: hasKneeRestriction ? 'Romanian Deadlift (Hinge)' : 'Reverse Step Lunges',
        category: 'legs',
        targetMuscle: 'Hamstrings & Glutes',
        recommendedSets: '3 Sets',
        repsOrDuration: '12 Reps / Leg',
        difficulty: 'Intermediate',
        coachingTips: [
          'Step back smoothly and maintain vertical front shin for stability.',
          'Push through front heel to engage posterior chain.',
        ],
        caloriesBurnEstimate: 50,
        diagramType: 'lunge',
      },
    ],
    core: [
      {
        id: 'h-core-1',
        name: 'Forearm Plank with Squeeze',
        category: 'core',
        targetMuscle: 'Deep Core & Transverse Abdominis',
        recommendedSets: '3 Sets',
        repsOrDuration: '30 - 60 Seconds',
        difficulty: 'Beginner',
        coachingTips: [
          'Elbows directly under shoulders, clamp glutes and pull navel to spine.',
          'Never allow lower back to sag toward floor.',
        ],
        caloriesBurnEstimate: 35,
        diagramType: 'plank',
      },
      {
        id: 'h-core-2',
        name: 'Deadbug / Bicycle Crunches',
        category: 'core',
        targetMuscle: 'Upper/Lower Abs & Obliques',
        recommendedSets: '3 Sets',
        repsOrDuration: '20 Reps Total',
        difficulty: 'Beginner',
        coachingTips: [
          'Keep lower back glued flush against the floor throughout.',
          'Focus on slow, rotational contraction over fast repetition.',
        ],
        caloriesBurnEstimate: 40,
        diagramType: 'crunch',
      },
    ],
    cardio: [
      {
        id: 'h-cardio-1',
        name: hasKneeRestriction ? 'Low-Impact Shadow Boxing & Fast Steps' : 'Jumping Jacks & High Knees',
        category: 'cardio',
        targetMuscle: 'Cardiovascular Conditioning & Whole Body Endurance',
        recommendedSets: '3 Sets',
        repsOrDuration: '45 Seconds',
        difficulty: 'Beginner',
        coachingTips: [
          hasKneeRestriction
            ? 'Fast punch combinations with steady pivot steps (zero joint impact).'
            : 'Land softly on balls of feet with rhythmic breath control.',
          'Keep tempo high to elevate heart rate and maximize afterburn.',
        ],
        caloriesBurnEstimate: 70,
        diagramType: 'jumping_jack',
      },
    ],
  };

  // Select exercises according to target muscle
  let selectedExercises: ExerciseItem[] = [];

  if (targetMuscle === 'chest_arms') {
    selectedExercises = [...pool.chest, pool.core[0], pool.cardio[0]];
  } else if (targetMuscle === 'back_shoulders') {
    selectedExercises = [...pool.back, pool.chest[0], pool.core[1]];
  } else if (targetMuscle === 'legs_glutes') {
    selectedExercises = [...pool.legs, pool.core[0], pool.cardio[0]];
  } else if (targetMuscle === 'core_abs') {
    selectedExercises = [...pool.core, pool.cardio[0], pool.legs[0]];
  } else if (targetMuscle === 'cardio_hiit') {
    selectedExercises = [pool.cardio[0], pool.legs[0], pool.core[0], pool.chest[0]];
  } else {
    // Full body
    selectedExercises = [
      pool.chest[0],
      pool.legs[0],
      pool.back[0],
      pool.core[0],
      pool.cardio[0],
    ];
  }

  // Adjust for duration (15-20 min -> 3-4 exercises, 45-60 min -> more volume)
  if (durationMinutes <= 20) {
    selectedExercises = selectedExercises.slice(0, 3);
  } else if (durationMinutes >= 45) {
    selectedExercises = [
      ...selectedExercises,
      pool.legs[1] || pool.core[1],
      pool.chest[1] || pool.core[0],
    ];
  }

  const totalCals = selectedExercises.reduce((sum, e) => sum + e.caloriesBurnEstimate, 0);

  const muscleLabel =
    targetMuscle === 'chest_arms'
      ? 'Chest & Arms Hypertrophy'
      : targetMuscle === 'back_shoulders'
      ? 'Back & Posture Builder'
      : targetMuscle === 'legs_glutes'
      ? 'Lower Body Power & Glutes'
      : targetMuscle === 'core_abs'
      ? 'Core Sculpt & Tight Abs'
      : targetMuscle === 'cardio_hiit'
      ? 'High-Intensity Metabolic Burn'
      : 'Full-Body Athletic Conditioning';

  return {
    id: `workout-${Date.now()}`,
    title: `${durationMinutes}-Min ${muscleLabel}`,
    targetMuscle: targetMuscle.replace('_', ' '),
    equipment: equipment === 'dumbbells' ? 'Dumbbells' : isHome ? 'Bodyweight' : 'Gym Equipment',
    difficulty: fitnessLevel as any,
    durationMinutes,
    totalCaloriesBurnEstimate: totalCals,
    coachTip: hasKneeRestriction
      ? 'Tailored low-impact routine designed specifically around joint comfort with zero jumping.'
      : 'Focus on maximum tension on every repetition. Rest 45-60s between sets for peak metabolic output.',
    warmupTip: '3 minutes of shoulder circles, cat-cows, and hip openers before beginning first working set.',
    cooldownTip: '2-3 minutes of deep nasal breathing and full-body hamstring & chest doorway stretch.',
    exercises: selectedExercises,
    createdAt: new Date().toISOString(),
  };
}
