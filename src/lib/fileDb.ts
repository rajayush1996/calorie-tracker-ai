import fs from 'fs';
import path from 'path';
import { UserAccount, UserProfile, DailyLog, BodyMeasurement, DietPlan, CommunityPost } from '@/types';

export interface FileDatabase {
  users: Record<string, UserAccount>;
  profiles: Record<string, UserProfile>;
  logs: Record<string, Record<string, DailyLog>>;
  measurements: Record<string, BodyMeasurement[]>;
  dietPlans: Record<string, DietPlan>;
  communityPosts: CommunityPost[];
}

const isVercel = Boolean(process.env.VERCEL);
const DB_DIR = isVercel ? '/tmp' : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

let memoryDbCache: FileDatabase | null = null;

// Ensure data folder and db file exist
function ensureDbFile(): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialDb: FileDatabase = {
        users: {},
        profiles: {},
        logs: {},
        measurements: {},
        dietPlans: {},
        communityPosts: [],
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb), 'utf-8');
    }
  } catch (err) {
    // Graceful fallback for read-only or permission-constrained environments
  }
}

export function readDb(): FileDatabase {
  if (memoryDbCache) return memoryDbCache;

  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.communityPosts) parsed.communityPosts = [];
    memoryDbCache = parsed;
    return parsed;
  } catch (e) {
    const fallback: FileDatabase = {
      users: {},
      profiles: {},
      logs: {},
      measurements: {},
      dietPlans: {},
      communityPosts: [],
    };
    memoryDbCache = fallback;
    return fallback;
  }
}

export function writeDb(data: FileDatabase): number {
  memoryDbCache = data;
  const minified = JSON.stringify(data);
  try {
    ensureDbFile();
    fs.writeFileSync(DB_FILE, minified, 'utf-8');
  } catch (err) {
    // Disk write ignored in serverless read-only contexts
  }
  return Buffer.byteLength(minified, 'utf-8');
}

export function getUserData(userId: string) {
  const db = readDb();
  return {
    user: db.users[userId] || null,
    profile: db.profiles[userId] || null,
    dailyLogs: db.logs[userId] || {},
    measurements: db.measurements[userId] || [],
    dietPlan: db.dietPlans[userId] || null,
    communityPosts: db.communityPosts || [],
  };
}

export function saveUserData(userId: string, payload: {
  user?: UserAccount;
  profile?: UserProfile;
  dailyLogs?: Record<string, DailyLog>;
  measurements?: BodyMeasurement[];
  dietPlan?: DietPlan;
  communityPosts?: CommunityPost[];
}) {
  const db = readDb();

  if (payload.user) db.users[userId] = payload.user;
  if (payload.profile) db.profiles[userId] = payload.profile;
  if (payload.dailyLogs) db.logs[userId] = payload.dailyLogs;
  if (payload.measurements) db.measurements[userId] = payload.measurements;
  if (payload.dietPlan) db.dietPlans[userId] = payload.dietPlan;
  if (payload.communityPosts) db.communityPosts = payload.communityPosts;

  const sizeBytes = writeDb(db);
  return {
    success: true,
    fileSizeBytes: sizeBytes,
    fileSizeKb: (sizeBytes / 1024).toFixed(2),
  };
}
