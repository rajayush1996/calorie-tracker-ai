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
5. Diagram types MUST be one of: "pushup", "squat", "pullup", "plank", "lunge", "bench_press", "crunch", "jumping_jack".

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

  // Template Day 1: Upper / Push
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
      caloriesBurnEstimate: 60,
      diagramType: 'bench_press',
    },
    {
      id: 'd1-ex2',
      name: isHome ? 'Doorframe Inverted Rows' : isDumbbellsOnly ? 'Dual Dumbbell Chest-Supported Row' : 'Chest-Supported Row / Lat Pulldown',
      category: 'back',
      targetMuscle: 'Lats, Rhomboids & Rear Delts',
      sets: 3,
      repRange: '10 - 12 Reps',
      restSeconds: 90,
      rpeOrIntensity: 'RPE 8',
      progressionRule: 'Focus on full lat squeeze. Increase 1 rep per set weekly.',
      coachingTips: [
        'Drive elbows back past your torso without shrugging traps.',
        'Pause 1 second at peak contraction.',
      ],
      caloriesBurnEstimate: 50,
      diagramType: 'pullup',
    },
    {
      id: 'd1-ex3',
      name: hasShoulderInjury ? 'Incline Dumbbell Low-Angle Press' : 'Overhead Dumbbell Shoulder Press',
      category: 'chest',
      targetMuscle: 'Anterior & Medial Delts',
      sets: 3,
      repRange: '10 - 12 Reps',
      restSeconds: 75,
      rpeOrIntensity: 'RPE 8',
      progressionRule: 'Progress reps from 10 to 12 before moving up dumbbell size.',
      coachingTips: ['Keep core clamped tight, avoid arching lower spine.'],
      caloriesBurnEstimate: 45,
      diagramType: 'bench_press',
    },
    {
      id: 'd1-ex4',
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

  // Template Day 2: Lower / Legs
  const day2Exercises: ProgramExercise[] = [
    {
      id: 'd2-ex1',
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
      caloriesBurnEstimate: 75,
      diagramType: 'squat',
    },
    {
      id: 'd2-ex2',
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
      caloriesBurnEstimate: 65,
      diagramType: 'lunge',
    },
    {
      id: 'd2-ex3',
      name: hasKneeInjury ? 'Step-Ups onto Low Platform' : 'Walking Lunges / Split Squats',
      category: 'legs',
      targetMuscle: 'Quads, Glute Medius & Unilateral Balance',
      sets: 3,
      repRange: '10 - 12 Reps / Leg',
      restSeconds: 75,
      rpeOrIntensity: 'RPE 8',
      progressionRule: 'Increase 1 rep per leg weekly.',
      coachingTips: ['Keep torso slightly inclined forward for optimal glute loading.'],
      caloriesBurnEstimate: 55,
      diagramType: 'lunge',
    },
    {
      id: 'd2-ex4',
      name: 'Bicycle Crunches',
      category: 'core',
      targetMuscle: 'Rectus Abdominis & Obliques',
      sets: 3,
      repRange: '20 Total Reps',
      restSeconds: 60,
      rpeOrIntensity: 'RPE 8',
      progressionRule: 'Slow down tempo to 2 seconds per repetition.',
      coachingTips: ['Rotate through thoracic spine, do not pull behind neck.'],
      caloriesBurnEstimate: 40,
      diagramType: 'crunch',
    },
  ];

  // Build 4 Progressive Weeks
  const weeks: ProgramWeek[] = [
    {
      weekNumber: 1,
      weekFocus: 'Week 1: Baseline Volume & Form Calibration',
      progressionNote: 'Focus on perfect mechanics and finding starting working weights. Aim for RPE 7-7.5 (2-3 reps in reserve).',
      days: [
        {
          id: 'w1-d1',
          dayName: 'Day 1',
          dayTitle: 'Upper Body Strength & Posture',
          focus: 'Chest, Upper Back & Core Stability',
          warmup: '5 mins band pull-aparts, arm circles, and cat-cow mobilization.',
          cooldown: '3 mins doorway chest stretch and child’s pose.',
          estimatedDurationMinutes: 45,
          estimatedCaloriesBurn: 240,
          exercises: day1Exercises.map((e) => ({ ...e, sets: 3, repRange: '8 - 10 Reps' })),
        },
        {
          id: 'w1-d2',
          dayName: 'Day 2',
          dayTitle: 'Lower Body Strength & Balance',
          focus: 'Quads, Hamstrings & Glutes',
          warmup: '5 mins bodyweight hip openers, world’s greatest stretch, and glute bridges.',
          cooldown: '3 mins kneeling hip flexor stretch and hamstring sweep.',
          estimatedDurationMinutes: 50,
          estimatedCaloriesBurn: 280,
          exercises: day2Exercises.map((e) => ({ ...e, sets: 3, repRange: '10 - 12 Reps' })),
        },
      ],
    },
    {
      weekNumber: 2,
      weekFocus: 'Week 2: Volume & Rep Accumulation',
      progressionNote: 'Increase 1-2 reps per exercise with identical load. Intensity increases to RPE 8.',
      days: [
        {
          id: 'w2-d1',
          dayName: 'Day 1',
          dayTitle: 'Upper Body Overload & Density',
          focus: 'Chest, Upper Back & Shoulders',
          warmup: '5 mins dynamic band dislocates and thoracic spine rotations.',
          cooldown: '3 mins lat stretch and shoulder mobility.',
          estimatedDurationMinutes: 45,
          estimatedCaloriesBurn: 260,
          exercises: day1Exercises.map((e) => ({ ...e, sets: 3, repRange: '10 - 12 Reps' })),
        },
        {
          id: 'w2-d2',
          dayName: 'Day 2',
          dayTitle: 'Lower Body Power & Hypertrophy',
          focus: 'Posterior Chain & Quad Drive',
          warmup: '5 mins deep squat holds and ankle mobility stretches.',
          cooldown: '3 mins quad couch stretch and pigeon pose.',
          estimatedDurationMinutes: 50,
          estimatedCaloriesBurn: 300,
          exercises: day2Exercises.map((e) => ({ ...e, sets: 3, repRange: '12 Reps' })),
        },
      ],
    },
    {
      weekNumber: 3,
      weekFocus: 'Week 3: Peak Load & Intensity Block',
      progressionNote: 'Add weight (+2.5kg on upper, +5kg on lower) where top reps were completed in Week 2. RPE 8.5-9.',
      days: [
        {
          id: 'w3-d1',
          dayName: 'Day 1',
          dayTitle: 'Upper Body Peak Strength Session',
          focus: 'Max Mechanical Tension & Upper Thickness',
          warmup: '5 mins targeted warm-up sets building smoothly to working weight.',
          cooldown: '4 mins full upper body stretch and breathing.',
          estimatedDurationMinutes: 50,
          estimatedCaloriesBurn: 280,
          exercises: day1Exercises.map((e) => ({ ...e, sets: 4, repRange: '8 Reps (Heavier)' })),
        },
        {
          id: 'w3-d2',
          dayName: 'Day 2',
          dayTitle: 'Lower Body Peak Hypertrophy Session',
          focus: 'Max Leg Drive & Glute Overload',
          warmup: '5 mins progressive warmup sets on primary compound.',
          cooldown: '4 mins deep quad and hamstring recovery stretches.',
          estimatedDurationMinutes: 55,
          estimatedCaloriesBurn: 320,
          exercises: day2Exercises.map((e) => ({ ...e, sets: 4, repRange: '8 - 10 Reps (Heavier)' })),
        },
      ],
    },
    {
      weekNumber: 4,
      weekFocus: 'Week 4: Deload & Active Recovery Block',
      progressionNote: 'Reduce working sets by 40%. Focus on pristine form and joint recovery at RPE 6. Prepare for next training block.',
      days: [
        {
          id: 'w4-d1',
          dayName: 'Day 1',
          dayTitle: 'Upper Body Technique & Recovery',
          focus: 'Joint Health & Neural Refresh',
          warmup: '5 mins light cardio and gentle rotational stretches.',
          cooldown: '5 mins relaxing static stretch.',
          estimatedDurationMinutes: 35,
          estimatedCaloriesBurn: 180,
          exercises: day1Exercises.map((e) => ({ ...e, sets: 2, repRange: '8 Reps (Controlled)' })),
        },
        {
          id: 'w4-d2',
          dayName: 'Day 2',
          dayTitle: 'Lower Body Technique & Recovery',
          focus: 'Mobility, Blood Flow & Active Recovery',
          warmup: '5 mins mobility and foam rolling.',
          cooldown: '5 mins foam rolling and gentle stretching.',
          estimatedDurationMinutes: 35,
          estimatedCaloriesBurn: 200,
          exercises: day2Exercises.map((e) => ({ ...e, sets: 2, repRange: '10 Reps (Light)' })),
        },
      ],
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
      'Engineered for maximum sustainable progression. By controlling weekly volume and peaking safely before a planned deload, you stimulate steady hypertrophy without joint inflammation.',
    progressionRules: [
      'The Double Progression Rule: Do not add weight until you hit the top rep target on all prescribed working sets with strict form.',
      'Control the Negative: Maintain a 2-second lowering phase on every repetition to maximize time-under-tension and prevent tendon strain.',
      'Deload Discipline: Respect Week 4 recovery to allow central nervous system supercompensation for the subsequent cycle.',
    ],
    weeks,
    createdAt: new Date().toISOString(),
  };
}
