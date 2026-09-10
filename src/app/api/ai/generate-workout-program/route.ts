import { NextRequest, NextResponse } from 'next/server';
import { MultiWeekWorkoutProgram, ProgramWeek, ProgramTrainingDay, ProgramExercise } from '@/types';
import { getAIProvider, AIProviderType } from '@/lib/ai/factory';

export async function POST(req: NextRequest) {
  try {
    const {
      primaryGoal = 'Muscle hypertrophy',
      experienceLevel = 'Intermediate',
      daysAvailable = '4 days a week - Mon, Tue, Thu, Fri',
      equipmentAccess = 'Full commercial gym',
      injuries = 'None',
      baselineFitness = 'Can bench 60kg, run 3km',
      existingRoutineNotes = '',
      apiKey: clientApiKey,
      provider: clientProvider,
    } = await req.json();

    const aiProvider = getAIProvider({
      preferredProvider: clientProvider as AIProviderType,
      customApiKey: clientApiKey,
    });

    if (aiProvider) {
      try {
        const systemPrompt = `You are an expert personal trainer and certified master strength & conditioning coach (CSCS).
A client wants you to create a comprehensive, progressive, week-by-week workout schedule.

Client's Full Data:
- Primary Goal: ${primaryGoal}
- Experience Level: ${experienceLevel}
- Days Available: ${daysAvailable}
- Equipment Access: ${equipmentAccess}
- Injuries or Limitations: ${injuries || 'None'}
- Current Fitness Baseline: ${baselineFitness || 'Standard baseline'}
- Retained Exercises / Custom Notes: ${existingRoutineNotes || 'None'}

CRITICAL GUIDELINES:
1. Build a structured 4-week progressive overload program:
   - Week 1: Baseline Volume & Movement Calibration (RPE 7)
   - Week 2: Volume & Rep Accumulation (RPE 7.5 - 8)
   - Week 3: Peak Load & Intensity Overload (RPE 8.5 - 9)
   - Week 4: Deload & Active Recovery / Technique Refinement (RPE 6)
2. Match the exact number of days per week stated in "Days Available" (e.g., if 4 days, provide 4 training days per week; if 3 days, provide 3 days; if 5 days, provide 5 days).
3. Strictly accommodate any injuries or limitations (e.g. if bad lower back, avoid heavy axial spinal loading; if shoulder impingement, avoid upright rows and behind-neck pressing).
4. Provide exact sets, rep ranges, rest times in seconds, RPE/intensity targets, coaching form cues, and clear progression rules for each exercise.
5. EXERCISE COUNT: Each training day MUST contain 5 to 6 distinct, structured exercises (e.g. 2 compound primary lifts, 2 hypertrophy accessory lifts, 1 targeted isolation movement, and 1 core/finisher). Real gym training requires 5 to 6 exercises per day.
6. Diagram types MUST be one of: "pushup", "squat", "pullup", "plank", "lunge", "bench_press", "crunch", "jumping_jack".

Return ONLY a JSON object matching this schema:
{
  "title": string,
  "periodizationModel": string,
  "primaryGoal": string,
  "experienceLevel": "Beginner" | "Intermediate" | "Advanced",
  "daysPerWeek": string,
  "equipmentAccess": string,
  "injuryAccommodations": string,
  "baselineFitness": string,
  "coachVerdict": string,
  "progressionRules": string[],
  "weeks": [
    {
      "weekNumber": number,
      "weekFocus": string,
      "progressionNote": string,
      "days": [
        {
          "dayName": string,
          "dayTitle": string,
          "focus": string,
          "warmup": string,
          "cooldown": string,
          "estimatedDurationMinutes": number,
          "estimatedCaloriesBurn": number,
          "exercises": [
            {
              "name": string,
              "category": "chest" | "back" | "legs" | "core" | "cardio",
              "targetMuscle": string,
              "sets": number,
              "repRange": string,
              "restSeconds": number,
              "rpeOrIntensity": string,
              "progressionRule": string,
              "coachingTips": string[],
              "caloriesBurnEstimate": number,
              "diagramType": "pushup" | "squat" | "pullup" | "plank" | "lunge" | "bench_press" | "crunch" | "jumping_jack"
            }
          ]
        }
      ]
    }
  ]
}`;

        const parsed = await aiProvider.generateJSON<any>({
          systemPrompt,
          userPrompt: `Build the progressive overload multi-week program for: Goal=${primaryGoal}, Level=${experienceLevel}, Days=${daysAvailable}, Equipment=${equipmentAccess}, Injuries=${injuries}, Baseline=${baselineFitness}, Notes=${existingRoutineNotes}`,
          temperature: 0.3,
        });

        if (parsed && Array.isArray(parsed.weeks) && parsed.weeks.length > 0) {
          const validatedWeeks: ProgramWeek[] = parsed.weeks.map((wk: any, wkIdx: number) => ({
            weekNumber: Number(wk.weekNumber) || wkIdx + 1,
            weekFocus: wk.weekFocus || `Week ${wkIdx + 1} Progression`,
            progressionNote: wk.progressionNote || 'Follow prescribed tempo and progressive overload.',
            days: Array.isArray(wk.days)
              ? wk.days.map((d: any, dIdx: number) => ({
                  id: `prog-d-${wkIdx}-${dIdx}-${Date.now()}`,
                  dayName: d.dayName || `Day ${dIdx + 1}`,
                  dayTitle: d.dayTitle || 'Target Training Session',
                  focus: d.focus || 'Strength & Hypertrophy',
                  warmup: d.warmup || '5 minutes dynamic joint mobility and light movement preparation.',
                  cooldown: d.cooldown || '3 minutes static stretching and nasal breath down-regulation.',
                  estimatedDurationMinutes: Number(d.estimatedDurationMinutes) || 45,
                  estimatedCaloriesBurn: Number(d.estimatedCaloriesBurn) || 280,
                  exercises: Array.isArray(d.exercises)
                    ? d.exercises.map((ex: any, exIdx: number) => ({
                        id: `prog-ex-${wkIdx}-${dIdx}-${exIdx}-${Date.now()}`,
                        name: ex.name || 'Movement',
                        category: ex.category || 'chest',
                        targetMuscle: ex.targetMuscle || 'Target Muscle',
                        sets: Number(ex.sets) || 3,
                        repRange: ex.repRange || '8 - 12 Reps',
                        restSeconds: Number(ex.restSeconds) || 90,
                        rpeOrIntensity: ex.rpeOrIntensity || 'RPE 8',
                        progressionRule:
                          ex.progressionRule ||
                          'Add 1 rep per set when all sets hit the top threshold, then add load.',
                        coachingTips: Array.isArray(ex.coachingTips)
                          ? ex.coachingTips
                          : ['Brace core throughout and control the negative phase.'],
                        caloriesBurnEstimate: Number(ex.caloriesBurnEstimate) || 45,
                        diagramType: ex.diagramType || 'pushup',
                      }))
                    : [],
                }))
              : [],
          }));

          const fullProgram: MultiWeekWorkoutProgram = {
            id: `program-${Date.now()}`,
            title:
              parsed.title ||
              `4-Week ${experienceLevel} ${primaryGoal.toUpperCase()} Progressive Program`,
            periodizationModel:
              parsed.periodizationModel ||
              '4-Week Linear Hypertrophy & Progressive Overload Block',
            primaryGoal,
            experienceLevel: (parsed.experienceLevel as any) || experienceLevel,
            daysPerWeek: parsed.daysPerWeek || daysAvailable,
            equipmentAccess: parsed.equipmentAccess || equipmentAccess,
            injuryAccommodations:
              parsed.injuryAccommodations ||
              (injuries && injuries !== 'None'
                ? `Custom substitutions active for: ${injuries}`
                : 'Standard biomechanical progression'),
            baselineFitness: parsed.baselineFitness || baselineFitness,
            coachVerdict:
              parsed.coachVerdict ||
              'A structured split designed to safely build strength and lean muscle through progressive overload.',
            progressionRules: Array.isArray(parsed.progressionRules) && parsed.progressionRules.length > 0
              ? parsed.progressionRules
              : [
                  'Double Progression Method: Increase reps until you hit the top of the rep range on all sets, then increase load by 2.5kg - 5kg.',
                  'Maintain 1-2 reps in reserve (RIR) on compound lifts to prevent systemic nervous system fatigue.',
                  'Track every set and rep in your logbook to ensure week-over-week measurable improvement.',
                ],
            weeks: validatedWeeks,
            createdAt: new Date().toISOString(),
          };

          return NextResponse.json({ ...fullProgram, provider: aiProvider.name });
        }
      } catch (err: any) {
        console.warn(`[AI Factory] Provider ${aiProvider.name} program generation failed:`, err?.message);
      }
    }

    // Heuristic Multi-Week Fallback
    const fallbackProgram = generateHeuristicMultiWeekProgram({
      primaryGoal,
      experienceLevel,
      daysAvailable,
      equipmentAccess,
      injuries,
      baselineFitness,
      existingRoutineNotes,
    });

    return NextResponse.json(fallbackProgram);
  } catch (err: any) {
    console.error('Error in generate-workout-program API:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to generate workout program' },
      { status: 500 }
    );
  }
}

export function generateHeuristicMultiWeekProgram(params: {
  primaryGoal?: string;
  experienceLevel?: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  daysAvailable?: string;
  equipmentAccess?: string;
  injuries?: string;
  baselineFitness?: string;
  existingRoutineNotes?: string;
}): MultiWeekWorkoutProgram {
  const {
    primaryGoal = 'Muscle hypertrophy',
    experienceLevel = 'Intermediate',
    daysAvailable = '4 days a week',
    equipmentAccess = 'Full commercial gym',
    injuries = 'None',
    baselineFitness = 'Active baseline',
    existingRoutineNotes = '',
  } = params;

  const isDumbbellsOnly = /dumbbell/i.test(equipmentAccess);
  const isHome = /home|bodyweight/i.test(equipmentAccess);
  const hasBackInjury = /back|spine/i.test(injuries);
  const hasKneeInjury = /knee|joint/i.test(injuries);
  const hasShoulderInjury = /shoulder/i.test(injuries);

  // Template Day 1: Push (Chest, Shoulders, Triceps) - 6 Exercises
  const day1Exercises: ProgramExercise[] = [
    {
      id: 'd1-ex1',
      name: hasShoulderInjury
        ? 'Neutral Grip Dumbbell Floor Press'
        : isHome
        ? 'Push-Ups (Tempo 3-1-1)'
        : isDumbbellsOnly
        ? 'Flat Dumbbell Bench Press'
        : 'Barbell Bench Press',
      category: 'chest',
      targetMuscle: 'Chest, Front Deltoids & Triceps',
      sets: experienceLevel === 'Beginner' ? 3 : 4,
      repRange: '8 - 10 Reps',
      restSeconds: 120,
      rpeOrIntensity: 'RPE 7.5',
      progressionRule: 'When you can hit 10 reps on all sets, add 2.5kg load next week.',
      coachingTips: [
        'Tuck shoulder blades back and down into the bench.',
        'Keep forearms vertical and control the negative descent.',
      ],
      caloriesBurnEstimate: 70,
      diagramType: 'bench_press',
    },
    {
      id: 'd1-ex2',
      name: hasShoulderInjury ? 'Incline Dumbbell Low-Angle Press' : 'Incline Dumbbell Bench Press',
      category: 'chest',
      targetMuscle: 'Upper Clavicular Chest',
      sets: 3,
      repRange: '10 - 12 Reps',
      restSeconds: 90,
      rpeOrIntensity: 'RPE 8',
      progressionRule: 'Increase reps from 10 to 12 before moving up dumbbell size.',
      coachingTips: [
        'Set bench to 30 degrees to maximize upper chest activation.',
        'Drive through palms and squeeze chest at the top.',
      ],
      caloriesBurnEstimate: 60,
      diagramType: 'bench_press',
    },
    {
      id: 'd1-ex3',
      name: hasShoulderInjury ? 'Seated Dumbbell Neutral Press' : 'Overhead Dumbbell Shoulder Press',
      category: 'chest',
      targetMuscle: 'Anterior & Medial Delts',
      sets: 3,
      repRange: '10 - 12 Reps',
      restSeconds: 75,
      rpeOrIntensity: 'RPE 8',
      progressionRule: 'Progress reps to 12 with strict tempo before adding load.',
      coachingTips: ['Keep core clamped tight, avoid arching lower spine.'],
      caloriesBurnEstimate: 55,
      diagramType: 'bench_press',
    },
    {
      id: 'd1-ex4',
      name: 'Dumbbell Lateral Raises',
      category: 'chest',
      targetMuscle: 'Lateral Deltoids (Shoulder Width)',
      sets: 4,
      repRange: '12 - 15 Reps',
      restSeconds: 60,
      rpeOrIntensity: 'RPE 8.5',
      progressionRule: 'Focus on 1-second squeeze at top horizontal plane.',
      coachingTips: ['Lead with elbows and avoid swinging torso.'],
      caloriesBurnEstimate: 45,
      diagramType: 'bench_press',
    },
    {
      id: 'd1-ex5',
      name: isHome ? 'Close-Grip Push-Ups' : 'Cable Tricep Rope Pushdowns',
      category: 'chest',
      targetMuscle: 'Triceps (Lateral Head)',
      sets: 3,
      repRange: '12 - 15 Reps',
      restSeconds: 60,
      rpeOrIntensity: 'RPE 8',
      progressionRule: 'Spread rope handles apart at bottom for full contraction.',
      coachingTips: ['Pin elbows tight to ribs; isolate forearm extension.'],
      caloriesBurnEstimate: 45,
      diagramType: 'pushup',
    },
    {
      id: 'd1-ex6',
      name: 'Forearm Plank with Glute Squeeze',
      category: 'core',
      targetMuscle: 'Deep Core & Transverse Abdominis',
      sets: 3,
      repRange: '45 - 60 Seconds',
      restSeconds: 60,
      rpeOrIntensity: 'RPE 8',
      progressionRule: 'Increase plank hold time by 5 seconds each week.',
      coachingTips: ['Pull navel toward spine and maintain rigid neutral line.'],
      caloriesBurnEstimate: 35,
      diagramType: 'plank',
    },
  ];

  // Template Day 2: Pull (Back, Lats, Biceps) - 6 Exercises
  const day2Exercises: ProgramExercise[] = [
    {
      id: 'd2-ex1',
      name: isHome ? 'Pull-Ups / Inverted Doorframe Rows' : 'Wide-Grip Lat Pulldown',
      category: 'back',
      targetMuscle: 'Lats & Teres Major (V-Taper Width)',
      sets: 4,
      repRange: '8 - 10 Reps',
      restSeconds: 90,
      rpeOrIntensity: 'RPE 8',
      progressionRule: 'Drive elbows into back pockets; add 1 rep per set weekly.',
      coachingTips: [
        'Depress shoulder blades before pulling.',
        'Squeeze lats hard at upper chest level.',
      ],
      caloriesBurnEstimate: 65,
      diagramType: 'pullup',
    },
    {
      id: 'd2-ex2',
      name: isDumbbellsOnly ? 'Dual Dumbbell Bent-Over Row' : 'Seated Cable Row (Neutral Grip)',
      category: 'back',
      targetMuscle: 'Rhomboids & Mid-Back Thickness',
      sets: 3,
      repRange: '10 - 12 Reps',
      restSeconds: 90,
      rpeOrIntensity: 'RPE 8',
      progressionRule: 'Hold 1 second at peak contraction without leaning torso.',
      coachingTips: ['Pull handle towards lower ribs, keeping chest puffed out.'],
      caloriesBurnEstimate: 60,
      diagramType: 'pullup',
    },
    {
      id: 'd2-ex3',
      name: hasBackInjury ? 'Chest-Supported Incline Dumbbell Row' : 'One-Arm Dumbbell Row',
      category: 'back',
      targetMuscle: 'Lats & Upper Back (Unilateral Balance)',
      sets: 3,
      repRange: '10 - 12 Reps / Arm',
      restSeconds: 75,
      rpeOrIntensity: 'RPE 8',
      progressionRule: 'Step up dumbbell weight when hitting 12 clean reps.',
      coachingTips: ['Keep back parallel to ground or firmly against bench pad.'],
      caloriesBurnEstimate: 55,
      diagramType: 'pullup',
    },
    {
      id: 'd2-ex4',
      name: 'Cable Face Pulls with External Rotation',
      category: 'back',
      targetMuscle: 'Rear Delts & Rotator Cuff (Posture)',
      sets: 3,
      repRange: '15 Reps',
      restSeconds: 60,
      rpeOrIntensity: 'RPE 7.5',
      progressionRule: 'Prioritize strict rear delt contraction over heavy weight.',
      coachingTips: ['Pull rope toward bridge of nose; pull thumbs backward.'],
      caloriesBurnEstimate: 40,
      diagramType: 'pullup',
    },
    {
      id: 'd2-ex5',
      name: 'Incline Dumbbell Bicep Curls',
      category: 'back',
      targetMuscle: 'Biceps Long Head (Arm Peak)',
      sets: 3,
      repRange: '10 - 12 Reps',
      restSeconds: 60,
      rpeOrIntensity: 'RPE 8',
      progressionRule: 'Emphasize deep stretch at bottom of each repetition.',
      coachingTips: ['Keep elbows behind torso; avoid swinging dumbbells.'],
      caloriesBurnEstimate: 45,
      diagramType: 'bench_press',
    },
    {
      id: 'd2-ex6',
      name: 'Standing Hammer Curls',
      category: 'back',
      targetMuscle: 'Brachialis & Forearm Grip Strength',
      sets: 3,
      repRange: '12 - 15 Reps',
      restSeconds: 60,
      rpeOrIntensity: 'RPE 8',
      progressionRule: 'Keep palms facing inward throughout the movement.',
      coachingTips: ['Slow 2-second negative lowering on every rep.'],
      caloriesBurnEstimate: 40,
      diagramType: 'bench_press',
    },
  ];

  // Template Day 3: Legs (Quads, Hamstrings, Calves) - 6 Exercises
  const day3Exercises: ProgramExercise[] = [
    {
      id: 'd3-ex1',
      name: hasKneeInjury
        ? 'Glute Bridge with 3-Second Hold'
        : hasBackInjury
        ? 'Goblet Squat to Box'
        : isHome
        ? 'Bodyweight Deep Squat (Tempo)'
        : 'Barbell Back Squat / Leg Press',
      category: 'legs',
      targetMuscle: hasKneeInjury ? 'Glutes & Hamstrings (Zero Knee Strain)' : 'Quadriceps & Glutes',
      sets: 4,
      repRange: hasKneeInjury ? '12 - 15 Reps' : '8 - 10 Reps',
      restSeconds: 120,
      rpeOrIntensity: 'RPE 7.5',
      progressionRule: 'Prioritize depth and mid-foot balance before increasing load.',
      coachingTips: [
        'Inhale into stomach to create 360-degree intra-abdominal pressure.',
        'Drive through mid-foot and spread the floor with your feet.',
      ],
      caloriesBurnEstimate: 80,
      diagramType: 'squat',
    },
    {
      id: 'd3-ex2',
      name: hasBackInjury ? 'Hamstring Slider Curls / Glute Bridge' : 'Romanian Deadlift (Dumbbell or Barbell)',
      category: 'legs',
      targetMuscle: 'Hamstrings & Posterior Chain',
      sets: 3,
      repRange: '10 - 12 Reps',
      restSeconds: 90,
      rpeOrIntensity: 'RPE 8',
      progressionRule: 'Add 2.5kg once 12 clean reps are completed with zero back rounding.',
      coachingTips: [
        'Hinge hips backward as if touching wall behind you.',
        'Keep weights skimming close along your shins.',
      ],
      caloriesBurnEstimate: 70,
      diagramType: 'lunge',
    },
    {
      id: 'd3-ex3',
      name: hasKneeInjury ? 'Step-Ups onto Low Platform' : 'Walking Dumbbell Lunges',
      category: 'legs',
      targetMuscle: 'Quads, Glute Medius & Unilateral Balance',
      sets: 3,
      repRange: '10 - 12 Reps / Leg',
      restSeconds: 75,
      rpeOrIntensity: 'RPE 8',
      progressionRule: 'Increase 1 rep per leg weekly.',
      coachingTips: ['Keep torso slightly inclined forward for optimal glute loading.'],
      caloriesBurnEstimate: 60,
      diagramType: 'lunge',
    },
    {
      id: 'd3-ex4',
      name: isHome ? 'Bodyweight Sissy Squat Hold' : 'Leg Extensions / Goblet Squat Hold',
      category: 'legs',
      targetMuscle: 'Quadriceps Isolation (Vastus Medialis)',
      sets: 3,
      repRange: '12 - 15 Reps',
      restSeconds: 60,
      rpeOrIntensity: 'RPE 8.5',
      progressionRule: 'Pause 1 second at top contraction.',
      coachingTips: ['Controlled 2-second eccentric lowering on every repetition.'],
      caloriesBurnEstimate: 50,
      diagramType: 'squat',
    },
    {
      id: 'd3-ex5',
      name: 'Standing Dumbbell Calf Raises',
      category: 'legs',
      targetMuscle: 'Calves (Gastrocnemius & Soleus)',
      sets: 4,
      repRange: '15 - 20 Reps',
      restSeconds: 45,
      rpeOrIntensity: 'RPE 8.5',
      progressionRule: 'Pause 2 seconds at deep stretch, rise high on big toes.',
      coachingTips: ['Zero bouncing; slow rhythmic calf pump.'],
      caloriesBurnEstimate: 40,
      diagramType: 'squat',
    },
    {
      id: 'd3-ex6',
      name: 'Hanging Leg Raises / Bicycle Crunches',
      category: 'core',
      targetMuscle: 'Lower Rectus Abdominis & Hip Flexors',
      sets: 3,
      repRange: '12 - 15 Reps',
      restSeconds: 60,
      rpeOrIntensity: 'RPE 8',
      progressionRule: 'Curl pelvis upward toward ribcage at top of motion.',
      coachingTips: ['Avoid swinging; use pure abdominal tension.'],
      caloriesBurnEstimate: 40,
      diagramType: 'crunch',
    },
  ];

  // Template Day 4: Upper Hypertrophy & Arms (Full Upper) - 6 Exercises
  const day4Exercises: ProgramExercise[] = [
    {
      id: 'd4-ex1',
      name: 'Incline Dumbbell Press',
      category: 'chest',
      targetMuscle: 'Upper Chest & Anterior Delts',
      sets: 4,
      repRange: '8 - 10 Reps',
      restSeconds: 90,
      rpeOrIntensity: 'RPE 8',
      progressionRule: 'Add 1 rep each session; step up weight when reaching 10 reps.',
      coachingTips: ['Press upward and inward without clacking dumbbells together.'],
      caloriesBurnEstimate: 65,
      diagramType: 'bench_press',
    },
    {
      id: 'd4-ex2',
      name: 'Neutral-Grip Lat Pulldown / Cable Row',
      category: 'back',
      targetMuscle: 'Lats & Lower Trapezius',
      sets: 3,
      repRange: '10 - 12 Reps',
      restSeconds: 90,
      rpeOrIntensity: 'RPE 8',
      progressionRule: 'Pause at bottom for full lat contraction.',
      coachingTips: ['Keep chest arched slightly toward ceiling.'],
      caloriesBurnEstimate: 60,
      diagramType: 'pullup',
    },
    {
      id: 'd4-ex3',
      name: 'Cable Lateral Raises / Upright Rows',
      category: 'chest',
      targetMuscle: 'Side Deltoid Continuous Tension',
      sets: 3,
      repRange: '12 - 15 Reps',
      restSeconds: 60,
      rpeOrIntensity: 'RPE 8.5',
      progressionRule: 'Add 1 rep per week with strict form.',
      coachingTips: ['Cable at wrist height, pull out toward side wall.'],
      caloriesBurnEstimate: 45,
      diagramType: 'bench_press',
    },
    {
      id: 'd4-ex4',
      name: 'Ez-Bar / Dumbbell Bicep Curls',
      category: 'back',
      targetMuscle: 'Biceps Hypertrophy',
      sets: 3,
      repRange: '10 - 12 Reps',
      restSeconds: 60,
      rpeOrIntensity: 'RPE 8',
      progressionRule: 'Strict form; zero body momentum.',
      coachingTips: ['Supinate wrists at top of curl.'],
      caloriesBurnEstimate: 45,
      diagramType: 'bench_press',
    },
    {
      id: 'd4-ex5',
      name: 'Overhead Dumbbell Tricep Extension',
      category: 'chest',
      targetMuscle: 'Triceps Long Head',
      sets: 3,
      repRange: '10 - 12 Reps',
      restSeconds: 60,
      rpeOrIntensity: 'RPE 8',
      progressionRule: 'Lower dumbbell behind head for full tricep stretch.',
      coachingTips: ['Keep elbows tucked in close to ears.'],
      caloriesBurnEstimate: 45,
      diagramType: 'pushup',
    },
    {
      id: 'd4-ex6',
      name: 'Forearm Plank with Knee Tucks',
      category: 'core',
      targetMuscle: 'Core Anti-Extension & Obliques',
      sets: 3,
      repRange: '45 - 60 Seconds',
      restSeconds: 60,
      rpeOrIntensity: 'RPE 8',
      progressionRule: 'Increase total hold time by 5 seconds weekly.',
      coachingTips: ['Draw knee toward elbow without lifting hips.'],
      caloriesBurnEstimate: 40,
      diagramType: 'plank',
    },
  ];

  const trainingDays: ProgramTrainingDay[] = [
    {
      id: 'prog-d1',
      dayName: 'Day 1 (Mon)',
      dayTitle: 'Chest, Shoulders & Triceps (Push)',
      focus: 'Chest Pressing, Deltoid Width & Tricep Hypertrophy',
      warmup: '5 mins band pull-aparts, arm circles, and push-up activation.',
      cooldown: '3 mins doorway chest stretch and tricep overhead stretch.',
      estimatedDurationMinutes: 50,
      estimatedCaloriesBurn: 330,
      exercises: day1Exercises,
    },
    {
      id: 'prog-d2',
      dayName: 'Day 2 (Tue)',
      dayTitle: 'Back, Lats & Biceps (Pull)',
      focus: 'Lat Width, Mid-Back Thickness & Bicep Peak',
      warmup: '5 mins cat-cow, thoracic rotations, and dead hangs.',
      cooldown: '3 mins lat stretch and bicep wall stretch.',
      estimatedDurationMinutes: 50,
      estimatedCaloriesBurn: 320,
      exercises: day2Exercises,
    },
    {
      id: 'prog-d3',
      dayName: 'Day 3 (Thu)',
      dayTitle: 'Legs, Hamstrings & Calves (Legs)',
      focus: 'Squat Drive, Posterior Chain & Calves',
      warmup: '5 mins world’s greatest stretch, bodyweight squats, and ankle circles.',
      cooldown: '4 mins kneeling hip flexor stretch and hamstring sweep.',
      estimatedDurationMinutes: 55,
      estimatedCaloriesBurn: 340,
      exercises: day3Exercises,
    },
    {
      id: 'prog-d4',
      dayName: 'Day 4 (Fri)',
      dayTitle: 'Upper Hypertrophy & Arms (Upper Focus)',
      focus: 'Incline Pressing, Arm Growth & Core Stabilization',
      warmup: '5 mins light cardio, shoulder dislocates, and light lateral raises.',
      cooldown: '3 mins chest and shoulder recovery stretch.',
      estimatedDurationMinutes: 48,
      estimatedCaloriesBurn: 300,
      exercises: day4Exercises,
    },
  ];

  // Build 4 Progressive Weeks with 4 training days each and 6 exercises per day
  const weeks: ProgramWeek[] = [
    {
      weekNumber: 1,
      weekFocus: 'Week 1: Baseline Volume & Form Calibration',
      progressionNote: 'Calibrate starting working weights. Focus on 2-second lowering and clean execution at RPE 7.5.',
      days: trainingDays.map((d, dIdx) => ({
        ...d,
        id: `w1-d${dIdx + 1}`,
        exercises: d.exercises.map((e) => ({ ...e, sets: 3, repRange: '8 - 10 Reps' })),
      })),
    },
    {
      weekNumber: 2,
      weekFocus: 'Week 2: Volume & Rep Accumulation',
      progressionNote: 'Add 1-2 reps per set with identical weight. Target RPE 8.',
      days: trainingDays.map((d, dIdx) => ({
        ...d,
        id: `w2-d${dIdx + 1}`,
        exercises: d.exercises.map((e) => ({ ...e, sets: 3, repRange: '10 - 12 Reps' })),
      })),
    },
    {
      weekNumber: 3,
      weekFocus: 'Week 3: Peak Load & Intensity Overload',
      progressionNote: 'Increase load (+2.5kg upper, +5kg lower) on core movements where top reps were hit in Week 2. RPE 8.5-9.',
      days: trainingDays.map((d, dIdx) => ({
        ...d,
        id: `w3-d${dIdx + 1}`,
        exercises: d.exercises.map((e) => ({ ...e, sets: 4, repRange: '8 Reps (Heavier)' })),
      })),
    },
    {
      weekNumber: 4,
      weekFocus: 'Week 4: Deload & Active Recovery Block',
      progressionNote: 'Reduce working sets by 40%. Reset connective tissue and fatigue at RPE 6. Prepare for next training cycle.',
      days: trainingDays.map((d, dIdx) => ({
        ...d,
        id: `w4-d${dIdx + 1}`,
        exercises: d.exercises.map((e) => ({ ...e, sets: 2, repRange: '8 Reps (Controlled)' })),
      })),
    },
  ];

  return {
    id: `program-${Date.now()}`,
    title: `4-Week ${experienceLevel} ${primaryGoal} Overload Program`,
    periodizationModel: '4-Week Wave Periodization (Base → Volume → Peak → Deload)',
    primaryGoal,
    experienceLevel: experienceLevel as any,
    daysPerWeek: daysAvailable,
    equipmentAccess,
    injuryAccommodations:
      injuries && injuries !== 'None'
        ? `Prescribed safe substitutions protecting: ${injuries}`
        : 'Standard biomechanical progression',
    baselineFitness,
    coachVerdict:
      'Engineered for maximum sustainable progression with 4 complete training days per week and 6 structured exercises each session. By controlling weekly volume and peaking safely before a planned deload, you stimulate steady hypertrophy without joint inflammation.',
    progressionRules: [
      'The Double Progression Rule: Do not add weight until you hit the top rep target on all prescribed working sets with strict form.',
      'Control the Negative: Maintain a 2-second lowering phase on every repetition to maximize time-under-tension and prevent tendon strain.',
      'Deload Discipline: Respect Week 4 recovery to allow central nervous system supercompensation for the subsequent cycle.',
    ],
    weeks,
    createdAt: new Date().toISOString(),
  };
}
