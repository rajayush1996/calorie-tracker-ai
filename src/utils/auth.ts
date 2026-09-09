import { UserAccount, UserProfile } from '@/types';
import { saveUserProfile, DEFAULT_PROFILE } from './storage';

const STORAGE_KEYS = {
  USERS: 'nutriai_all_users',
  ACTIVE_USER_ID: 'nutriai_active_user_id',
  THEME: 'nutriai_theme',
};

export const DEMO_USER: UserAccount = {
  id: 'user_demo_123',
  name: 'Ayush Raj',
  email: 'ayush@demo.com',
  createdAt: new Date().toISOString(),
};

export function getAllUsers(): UserAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function getActiveUser(): UserAccount | null {
  if (typeof window === 'undefined') return null;
  try {
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
    if (!activeId) return null;
    const users = getAllUsers();
    return users.find((u) => u.id === activeId) || null;
  } catch (e) {
    return null;
  }
}

export function setActiveUserId(userId: string | null): void {
  if (typeof window === 'undefined') return;
  if (!userId) {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
  } else {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, userId);
  }
}

export function loginUser(email: string): { user: UserAccount; isNew: boolean } {
  const users = getAllUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    setActiveUserId(existing.id);
    return { user: existing, isNew: false };
  }

  // Auto-create if not found for friction-free onboarding
  const newUser: UserAccount = {
    id: `user_${Date.now()}`,
    name: email.split('@')[0],
    email: email.trim(),
    createdAt: new Date().toISOString(),
  };
  const updated = [...users, newUser];
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
  setActiveUserId(newUser.id);
  return { user: newUser, isNew: true };
}

export function signupUser(name: string, email: string): UserAccount {
  const users = getAllUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    setActiveUserId(existing.id);
    return existing;
  }

  const newUser: UserAccount = {
    id: `user_${Date.now()}`,
    name: name.trim(),
    email: email.trim(),
    createdAt: new Date().toISOString(),
  };

  const updated = [...users, newUser];
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
  setActiveUserId(newUser.id);

  // Initialize a fresh, un-onboarded profile for the user
  const initialProfile: UserProfile = {
    ...DEFAULT_PROFILE,
    userId: newUser.id,
    name: newUser.name,
    isOnboarded: false, // Forces onboarding flow!
  };
  saveUserProfile(initialProfile, newUser.id);

  return newUser;
}

export function logoutUser(): void {
  setActiveUserId(null);
}

// Theme storage
export function getSavedTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem(STORAGE_KEYS.THEME);
  return (saved === 'dark' ? 'dark' : 'light');
}

export function saveTheme(theme: 'light' | 'dark'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
