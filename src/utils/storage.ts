import { UserProfile, DailyLog, BodyMeasurement, DietPlan, WorkoutPlan, MultiWeekWorkoutProgram, MealLog, UserAccount, CommunityPost } from '@/types';
import { calculateTargets } from './nutritionCalculations';

const defaultTargets = calculateTargets(78, 175, 24, 'male', 'moderate', 'fat_loss', 'recommended', 'veg', 70);

export const DEFAULT_PROFILE: UserProfile = {
  userId: 'user_demo_123',
  name: 'Ayush',
  age: 24,
  gender: 'male',
  heightCm: 175,
  currentWeightKg: 78,
  targetWeightKg: 70,
  waistCm: 86,
  chestCm: 98,
  activityLevel: 'moderate',
  goal: 'fat_loss',
  dietType: 'veg',
  pace: 'recommended',
  targetCalories: defaultTargets.targetCalories,
  targetProteinG: defaultTargets.targetProteinG,
  targetCarbsG: defaultTargets.targetCarbsG,
  targetFatG: defaultTargets.targetFatG,
  waterTargetMl: defaultTargets.waterTargetMl,
  isOnboarded: true,
  apiKey: '',
};

function getKey(base: string, userId?: string): string {
  const uid = userId || (typeof window !== 'undefined' ? localStorage.getItem('nutriai_active_user_id') : null) || 'user_demo_123';
  return `nutriai_${uid}_${base}`;
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Background sync to disk file /api/db (asynchronous & non-blocking)
export async function syncToFileDb(userId?: string) {
  if (typeof window === 'undefined') return;
  const uid = userId || localStorage.getItem('nutriai_active_user_id') || 'user_demo_123';
  try {
    const profile = loadUserProfile(uid);
    const dailyLogs = loadAllDailyLogs(uid);
    const measurements = loadBodyMeasurements(uid);
    const dietPlan = loadActiveDietPlan(uid);
    const workoutPlan = loadActiveWorkoutPlan(uid);
    const workoutProgram = loadActiveWorkoutProgram(uid);

    await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: uid,
        profile,
        dailyLogs,
        measurements,
        dietPlan,
        workoutPlan,
        workoutProgram,
      }),
    });
  } catch (e) {
    // Graceful offline fallback
    console.warn('Sync to file disk skipped (offline mode)');
  }
}

// Restore from file database on app launch
export async function restoreFromFileDb(userId: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const res = await fetch(`/api/db?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) return false;
    const data = await res.json();

    if (data.profile) {
      localStorage.setItem(getKey('profile', userId), JSON.stringify(data.profile));
    }
    if (data.dailyLogs && Object.keys(data.dailyLogs).length > 0) {
      localStorage.setItem(getKey('daily_logs', userId), JSON.stringify(data.dailyLogs));
    }
    if (data.measurements && data.measurements.length > 0) {
      localStorage.setItem(getKey('measurements', userId), JSON.stringify(data.measurements));
    }
    if (data.dietPlan) {
      localStorage.setItem(getKey('diet_plan', userId), JSON.stringify(data.dietPlan));
    }
    if (data.workoutPlan) {
      localStorage.setItem(getKey('workout_plan', userId), JSON.stringify(data.workoutPlan));
    }
    if (data.workoutProgram) {
      localStorage.setItem(getKey('workout_program', userId), JSON.stringify(data.workoutProgram));
    }
    return true;
  } catch (e) {
    return false;
  }
}

export function loadUserProfile(userId?: string): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const key = getKey('profile', userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      const uid = userId || localStorage.getItem('nutriai_active_user_id') || 'user_demo_123';
      const initial: UserProfile = {
        ...DEFAULT_PROFILE,
        userId: uid,
        isOnboarded: uid === 'user_demo_123',
      };
      saveUserProfile(initial, uid);
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile, userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const uid = userId || profile.userId;
    const key = getKey('profile', uid);
    localStorage.setItem(key, JSON.stringify(profile));
    syncToFileDb(uid);
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function loadAllDailyLogs(userId?: string): Record<string, DailyLog> {
  if (typeof window === 'undefined') return {};
  try {
    const key = getKey('daily_logs', userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      const uid = userId || localStorage.getItem('nutriai_active_user_id') || 'user_demo_123';
      const initialLogs: Record<string, DailyLog> = {};
      saveAllDailyLogs(initialLogs, uid);
      return initialLogs;
    }
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

export function saveAllDailyLogs(logs: Record<string, DailyLog>, userId?: string): void {
  if (typeof window === 'undefined') return;
  const uid = userId || localStorage.getItem('nutriai_active_user_id') || 'user_demo_123';
  try {
    const key = getKey('daily_logs', uid);
    localStorage.setItem(key, JSON.stringify(logs));
    syncToFileDb(uid);
  } catch (e) {
    console.error('Failed to save daily logs', e);
  }
}

export function loadTodayLog(userId?: string): DailyLog {
  const today = getTodayDateString();
  const logs = loadAllDailyLogs(userId);
  if (logs[today]) return logs[today];

  const newLog: DailyLog = {
    date: today,
    waterConsumedMl: 0,
    meals: [],
  };

  logs[today] = newLog;
  saveAllDailyLogs(logs, userId);
  return newLog;
}

export function saveTodayLog(log: DailyLog, userId?: string): void {
  const today = getTodayDateString();
  const logs = loadAllDailyLogs(userId);
  logs[today] = log;
  saveAllDailyLogs(logs, userId);
}

export function loadBodyMeasurements(userId?: string): BodyMeasurement[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = getKey('measurements', userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      const uid = userId || localStorage.getItem('nutriai_active_user_id') || 'user_demo_123';
      const initial = uid === 'user_demo_123' ? getInitialMeasurements() : [];
      saveBodyMeasurements(initial, uid);
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveBodyMeasurements(measurements: BodyMeasurement[], userId?: string): void {
  if (typeof window === 'undefined') return;
  const uid = userId || localStorage.getItem('nutriai_active_user_id') || 'user_demo_123';
  try {
    const key = getKey('measurements', uid);
    localStorage.setItem(key, JSON.stringify(measurements));
    syncToFileDb(uid);
  } catch (e) {
    console.error('Failed to save measurements', e);
  }
}

export function loadActiveDietPlan(userId?: string): DietPlan | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = getKey('diet_plan', userId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function saveActiveDietPlan(plan: DietPlan, userId?: string): void {
  if (typeof window === 'undefined') return;
  const uid = userId || localStorage.getItem('nutriai_active_user_id') || 'user_demo_123';
  try {
    const key = getKey('diet_plan', uid);
    localStorage.setItem(key, JSON.stringify(plan));
    syncToFileDb(uid);
  } catch (e) {
    console.error('Failed to save diet plan', e);
  }
}

export function loadActiveWorkoutPlan(userId?: string): WorkoutPlan | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = getKey('workout_plan', userId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function saveActiveWorkoutPlan(plan: WorkoutPlan, userId?: string): void {
  if (typeof window === 'undefined') return;
  const uid = userId || localStorage.getItem('nutriai_active_user_id') || 'user_demo_123';
  try {
    const key = getKey('workout_plan', uid);
    localStorage.setItem(key, JSON.stringify(plan));
    syncToFileDb(uid);
  } catch (e) {
    console.error('Failed to save workout plan', e);
  }
}

export function loadActiveWorkoutProgram(userId?: string): MultiWeekWorkoutProgram | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = getKey('workout_program', userId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function saveActiveWorkoutProgram(program: MultiWeekWorkoutProgram, userId?: string): void {
  if (typeof window === 'undefined') return;
  const uid = userId || localStorage.getItem('nutriai_active_user_id') || 'user_demo_123';
  try {
    const key = getKey('workout_program', uid);
    localStorage.setItem(key, JSON.stringify(program));
    syncToFileDb(uid);
  } catch (e) {
    console.error('Failed to save workout program', e);
  }
}


function getInitialMeasurements(): BodyMeasurement[] {
  const today = new Date();
  const res: BodyMeasurement[] = [];
  const weights = [80.5, 80.0, 79.4, 78.8, 78.3, 78.0];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i * 5);
    res.push({
      id: `measure-${i}`,
      date: d.toISOString().split('T')[0],
      weightKg: weights[5 - i],
      waistCm: 89 - (5 - i) * 0.6,
      chestCm: 100 - (5 - i) * 0.3,
      notes: i === 5 ? 'Starting fat loss journey' : 'Consistency paying off!',
    });
  }
  return res;
}

const COMMUNITY_KEY = 'nutriai_community_posts';

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    authorId: 'user_rahul',
    authorName: 'Rahul Sharma',
    authorBadge: '-7.5 kg in 12 weeks 🏆',
    timeAgo: '2 hours ago',
    tag: 'Fat Loss',
    title: 'Down 7.5 kg without giving up rotis & homemade Indian food!',
    story:
      'I used to quit tracking after 3 days because weighing every ingredient in grams was impossible in an Indian household. NutriAI\'s conversational logger changed the game for me—I just type "2 rotis with dal tadka and 1 bowl curd" and it parses everything instantly with portion estimates. Sticking to a 500 kcal deficit consistently gave me results I couldn\'t get in 2 years of random diets.',
    milestoneStats: {
      startWeightKg: 83.5,
      currentWeightKg: 76.0,
      weeksTaken: 12,
    },
    likesCount: 24,
    isLiked: false,
    comments: [
      {
        id: 'c-1',
        authorName: 'Pooja V.',
        content: 'This is super inspiring Rahul! Did you drink chai as well?',
        createdAt: '1 hour ago',
      },
      {
        id: 'c-2',
        authorName: 'Rahul Sharma',
        content: '@Pooja Yes, 1 cup with toned milk and no sugar! AI logged it at 65 kcal.',
        createdAt: '45 mins ago',
      },
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'post-2',
    authorId: 'user_priya',
    authorName: 'Priya Mehta',
    authorBadge: 'Vegetarian Diet Pro 🥦',
    timeAgo: '5 hours ago',
    tag: 'Diet & Recipes',
    title: 'How I hit 110g protein daily on a 100% vegetarian Indian diet',
    story:
      'The AI Diet planner matched what I had in my kitchen: 100g low-fat paneer, 2 scoops curd, 40g roasted chana for evening snack, and soya chunks pulao for dinner. Satiety is through the roof and zero late night sweet cravings!',
    milestoneStats: {
      startWeightKg: 68.0,
      currentWeightKg: 63.5,
      weeksTaken: 8,
    },
    likesCount: 38,
    isLiked: false,
    comments: [
      {
        id: 'c-3',
        authorName: 'Vikram S.',
        content: 'Low-fat paneer bhurji is literally a cheat code for veg protein!',
        createdAt: '3 hours ago',
      },
    ],
    createdAt: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    id: 'post-3',
    authorId: 'user_aman',
    authorName: 'Aman Verma',
    authorBadge: '45-Day Consistency Streak 🔥',
    timeAgo: 'Yesterday',
    tag: 'Consistency',
    title: 'The Nightly AI Audit is the best psychological accountability tool',
    story:
      'Seeing that 8.5/10 score every night and reading what went wrong (like "you had 45g excess fat from cooking oil today") gamified fat loss for me. Small course-corrections every single day compound into massive transformations.',
    milestoneStats: {
      startWeightKg: 88.0,
      currentWeightKg: 80.5,
      weeksTaken: 14,
    },
    likesCount: 52,
    isLiked: true,
    comments: [],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export function loadCommunityPosts(): CommunityPost[] {
  if (typeof window === 'undefined') return INITIAL_COMMUNITY_POSTS;
  try {
    const raw = localStorage.getItem(COMMUNITY_KEY);
    if (!raw) {
      saveCommunityPosts(INITIAL_COMMUNITY_POSTS);
      return INITIAL_COMMUNITY_POSTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_COMMUNITY_POSTS;
  }
}

export function saveCommunityPosts(posts: CommunityPost[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(COMMUNITY_KEY, JSON.stringify(posts));
  } catch (e) {
    console.error('Failed to save community posts', e);
  }
}

export function clearAllUserData(userId?: string): void {
  if (typeof window === 'undefined') return;
  const uid = userId || localStorage.getItem('nutriai_active_user_id') || 'user_demo_123';
  try {
    localStorage.removeItem(`nutriai_${uid}_profile`);
    localStorage.removeItem(`nutriai_${uid}_daily_logs`);
    localStorage.removeItem(`nutriai_${uid}_measurements`);
    localStorage.removeItem(`nutriai_${uid}_diet_plan`);
  } catch (e) {
    console.error('Failed to clear user data', e);
  }
}

export function resetAppToCleanSlate(): void {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('nutriai_') || key.startsWith('calorie_tracker_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    fetch('/api/reset', { method: 'POST' }).catch(() => {});
  } catch (e) {
    console.error('Failed to reset app', e);
  }
}

