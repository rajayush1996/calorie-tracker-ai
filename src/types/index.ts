export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type FitnessGoal = 'fat_loss' | 'muscle_gain' | 'weight_gain' | 'maintenance';
export type TransformationPace = 'sustainable' | 'recommended' | 'aggressive' | 'muscle_gain';
export type DietType = 'veg' | 'non_veg' | 'eggetarian' | 'vegan' | 'jain' | 'keto';
export type MealType =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'meal_1'
  | 'meal_2'
  | 'meal_3'
  | 'meal_4'
  | 'meal_5';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  name: string;
  age: number;
  gender: Gender;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  waistCm?: number;
  chestCm?: number;
  hipsCm?: number;
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
  dietType?: DietType;
  pace: TransformationPace;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  waterTargetMl: number;
  targetDate?: string;
  wakeUpTime?: string; // e.g. '11:00 AM' or '07:30 AM'
  mealNamingStyle?: 'lifestyle' | 'numbered' | 'standard';
  isOnboarded: boolean;
  apiKey?: string;
  aiProvider?: 'openai' | 'gemini' | 'claude' | 'groq';
}

export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  portionDescription: string;
  weightG: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  confidence?: 'high' | 'medium' | 'low';
}

export interface MealLog {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  items: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  rawInput?: string;
  assumptions?: string[];
  createdAt: string;
}

export interface BodyMeasurement {
  id: string;
  date: string;
  weightKg: number;
  waistCm?: number;
  chestCm?: number;
  hipsCm?: number;
  armsCm?: number;
  notes?: string;
}

export interface PlannedMeal {
  mealType: MealType;
  time: string;
  title: string;
  items: {
    name: string;
    portion: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  }[];
  totalCalories: number;
  proteinG: number;
  tips: string;
}

export interface DietPlan {
  id: string;
  createdAt: string;
  dietType: DietType;
  targetCalories: number;
  targetProteinG: number;
  pantryItems: string[];
  scheduleDescription: string;
  meals: PlannedMeal[];
  summaryNotes: string;
  projectedWeeklyFatLossKg: number;
}

export interface DailyAudit {
  id: string;
  date: string;
  caloriesConsumed: number;
  calorieTarget: number;
  calorieDifference: number;
  proteinConsumed: number;
  proteinTarget: number;
  carbsConsumed: number;
  carbsTarget: number;
  fatConsumed: number;
  fatTarget: number;
  scoreOutOf10: number;
  wins: string[];
  mistakes: string[];
  tomorrowActionPlan: string[];
  coachSummary: string;
}

export interface LoggedWorkout {
  id: string;
  workoutTitle: string;
  exerciseName?: string;
  caloriesBurned: number;
  durationMinutes?: number;
  timestamp: string;
}

export interface DailyLog {
  date: string;
  waterConsumedMl: number;
  meals: MealLog[];
  audit?: DailyAudit;
  burnedCalories?: number;
  workouts?: LoggedWorkout[];
}

export interface CommunityComment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorBadge?: string;
  timeAgo: string;
  tag: 'Fat Loss' | 'Diet & Recipes' | 'Muscle Gain' | 'Consistency';
  title: string;
  story: string;
  milestoneStats?: {
    startWeightKg?: number;
    currentWeightKg?: number;
    weeksTaken?: number;
  };
  likesCount: number;
  isLiked?: boolean;
  comments: CommunityComment[];
  createdAt: string;
}

export interface ExerciseItem {
  id: string;
  name: string;
  category: 'chest' | 'back' | 'legs' | 'core' | 'cardio';
  targetMuscle: string;
  recommendedSets: string;
  repsOrDuration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  coachingTips: string[];
  caloriesBurnEstimate: number;
  diagramType:
    | 'pushup'
    | 'squat'
    | 'pullup'
    | 'plank'
    | 'lunge'
    | 'bench_press'
    | 'crunch'
    | 'jumping_jack'
    | (string & {});
}

export interface WorkoutPlan {
  id: string;
  title: string;
  targetMuscle: string;
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationMinutes: number;
  totalCaloriesBurnEstimate: number;
  coachTip: string;
  warmupTip: string;
  cooldownTip: string;
  exercises: ExerciseItem[];
  createdAt: string;
  provider?: string;
}
