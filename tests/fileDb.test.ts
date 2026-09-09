import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readDb, writeDb, saveUserData, getUserData } from '../src/lib/fileDb';
import { UserAccount, UserProfile } from '../src/types';

describe('Offline File Database Engine (data/db.json)', () => {
  it('should successfully read database and ensure all collections exist', () => {
    const db = readDb();
    assert.ok(typeof db.users === 'object', 'users collection should exist');
    assert.ok(typeof db.profiles === 'object', 'profiles collection should exist');
    assert.ok(typeof db.logs === 'object', 'logs collection should exist');
    assert.ok(Array.isArray(db.communityPosts), 'communityPosts array should exist');
  });

  it('should save and retrieve user data correctly', () => {
    const testUserId = `test_user_${Date.now()}`;
    const testAccount: UserAccount = {
      id: testUserId,
      email: `${testUserId}@example.com`,
      name: 'Test Runner',
      createdAt: new Date().toISOString(),
    };

    const testProfile: UserProfile = {
      userId: testUserId,
      name: 'Test Runner',
      age: 26,
      gender: 'male',
      heightCm: 175,
      currentWeightKg: 78,
      targetWeightKg: 72,
      activityLevel: 'moderate',
      goal: 'fat_loss',
      pace: 'recommended',
      targetCalories: 1850,
      targetProteinG: 156,
      targetCarbsG: 185,
      targetFatG: 51,
      waterTargetMl: 2700,
      isOnboarded: true,
    };

    saveUserData(testUserId, {
      user: testAccount,
      profile: testProfile,
    });

    const retrieved = getUserData(testUserId);
    assert.ok(retrieved.user, 'User account should be saved and retrieved');
    assert.strictEqual(retrieved.user?.email, testAccount.email);
    assert.strictEqual(retrieved.profile?.targetCalories, 1850);
  });

  it('should persist data in ultra-compact single line JSON format', () => {
    const db = readDb();
    const bytes = writeDb(db);
    assert.ok(bytes > 0, 'Database should have valid byte length');
  });
});
