'use client';

import React, { useState, useEffect } from 'react';
import { UserAccount, UserProfile, DailyLog, BodyMeasurement, MealLog, MealType, DailyAudit } from '@/types';
import {
  loadUserProfile,
  saveUserProfile,
  loadTodayLog,
  saveTodayLog,
  loadAllDailyLogs,
  saveAllDailyLogs,
  loadBodyMeasurements,
  saveBodyMeasurements,
  restoreFromFileDb,
} from '@/utils/storage';
import {
  getActiveUser,
  logoutUser,
  getSavedTheme,
  saveTheme,
} from '@/utils/auth';

import { AppOnboardingCarousel } from '@/components/auth/AppOnboardingCarousel';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { Header } from '@/components/layout/Header';
import { BottomNav, ActiveTab } from '@/components/layout/BottomNav';
import { CalorieRing } from '@/components/dashboard/CalorieRing';
import { WaterTracker } from '@/components/dashboard/WaterTracker';
import { MealSection } from '@/components/dashboard/MealSection';
import { AILoggerTab } from '@/components/ai-logger/AILoggerTab';
import { DietPlannerTab } from '@/components/diet-planner/DietPlannerTab';
import { AnalyticsTab } from '@/components/analytics/AnalyticsTab';
import { DailyAuditTab } from '@/components/audit/DailyAuditTab';
import { ProfileTab } from '@/components/profile/ProfileTab';
import { CommunityTab } from '@/components/community/CommunityTab';
import { RescueModal } from '@/components/rescue/RescueModal';
import { PwaInstallPrompt } from '@/components/common/PwaInstallPrompt';
import { DateNavigator } from '@/components/common/DateNavigator';
import { getTodayDateString } from '@/utils/dateUtils';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [allLogs, setAllLogs] = useState<Record<string, DailyLog>>({});
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [loggerTargetMeal, setLoggerTargetMeal] = useState<MealType>('lunch');
  const [isRescueOpen, setIsRescueOpen] = useState(false);
  const [rescueInitialTab, setRescueInitialTab] = useState<'craving' | 'cheat'>('craving');
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Initialize Auth & Theme
  useEffect(() => {
    setIsClient(true);

    const savedTheme = getSavedTheme();
    setTheme(savedTheme);
    saveTheme(savedTheme);

    const active = getActiveUser();
    if (active) {
      setCurrentUser(active);
      loadUserData(active.id);
    }
  }, []);

  const loadUserData = async (userId: string) => {
    // 1. Instant local load
    const profile = loadUserProfile(userId);
    setUserProfile(profile);

    const today = loadTodayLog(userId);
    setTodayLog(today);

    const logs = loadAllDailyLogs(userId);
    setAllLogs(logs);

    const meas = loadBodyMeasurements(userId);
    setMeasurements(meas);

    // 2. Restore from server disk file db if available
    const restored = await restoreFromFileDb(userId);
    if (restored) {
      setUserProfile(loadUserProfile(userId));
      setTodayLog(loadTodayLog(userId));
      setAllLogs(loadAllDailyLogs(userId));
      setMeasurements(loadBodyMeasurements(userId));
    }
  };

  const handleAuthenticated = (user: UserAccount) => {
    setCurrentUser(user);
    loadUserData(user.id);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setUserProfile(null);
  };

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    saveTheme(next);
  };

  const handleCompleteOnboarding = (completedProfile: UserProfile) => {
    setUserProfile(completedProfile);
    saveUserProfile(completedProfile, completedProfile.userId);

    // Initial measurement
    const initialMeas: BodyMeasurement = {
      id: `measure-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weightKg: completedProfile.currentWeightKg,
      waistCm: completedProfile.waistCm,
      chestCm: completedProfile.chestCm,
      notes: 'Initial onboarding measurement',
    };
    const updatedMeas = [initialMeas];
    setMeasurements(updatedMeas);
    saveBodyMeasurements(updatedMeas, completedProfile.userId);
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-2xl animate-pulse shadow-md shadow-emerald-500/20">
            🥑
          </div>
          <p className="text-sm font-semibold tracking-wide text-slate-500">Loading NutriAI...</p>
        </div>
      </div>
    );
  }

  // 1. Not Logged In -> Show App Onboarding Carousel with Skip / Get Started
  if (!currentUser) {
    if (!showAuthForm) {
      return <AppOnboardingCarousel onFinish={() => setShowAuthForm(true)} />;
    }
    return (
      <AuthScreen
        onAuthenticated={handleAuthenticated}
        onBackToCarousel={() => setShowAuthForm(false)}
      />
    );
  }

  // 2. Logged In but Not Onboarded -> Show Interactive Onboarding Wizard
  if (!userProfile || !userProfile.isOnboarded) {
    return (
      <OnboardingWizard
        initialProfile={
          userProfile || {
            userId: currentUser.id,
            name: currentUser.name,
            age: 24,
            gender: 'male',
            heightCm: 172,
            currentWeightKg: 78,
            targetWeightKg: 70,
            waistCm: 86,
            chestCm: 98,
            activityLevel: 'moderate',
            goal: 'fat_loss',
            pace: 'recommended',
            targetCalories: 1850,
            targetProteinG: 150,
            targetCarbsG: 185,
            targetFatG: 50,
            waterTargetMl: 2800,
            isOnboarded: false,
          }
        }
        onComplete={handleCompleteOnboarding}
      />
    );
  }

  if (!todayLog) {
    return null;
  }

  const todayStr = getTodayDateString();
  const activeLog: DailyLog = allLogs[selectedDate] || (selectedDate === todayStr ? todayLog : {
    date: selectedDate,
    waterConsumedMl: 0,
    meals: [],
  });

  // Calculate selected date's consumed totals
  const consumedTotals = (activeLog.meals || []).reduce(
    (acc, m) => ({
      calories: acc.calories + (m.totalCalories || 0),
      protein: acc.protein + (m.totalProtein || 0),
      carbs: acc.carbs + (m.totalCarbs || 0),
      fat: acc.fat + (m.totalFat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const handleUpdateWater = (amountMl: number) => {
    const updated: DailyLog = {
      ...activeLog,
      waterConsumedMl: amountMl,
    };
    const updatedAll = { ...allLogs, [selectedDate]: updated };
    setAllLogs(updatedAll);
    saveAllDailyLogs(updatedAll, currentUser.id);

    if (selectedDate === todayStr) {
      setTodayLog(updated);
      saveTodayLog(updated, currentUser.id);
    }
  };

  const handleSaveMeal = (meal: MealLog) => {
    const targetDate = meal.date || selectedDate;
    const targetLog = allLogs[targetDate] || (targetDate === todayStr ? todayLog : {
      date: targetDate,
      waterConsumedMl: 0,
      meals: [],
    });

    const updatedMeals = [...(targetLog.meals || []), meal];
    const updated: DailyLog = {
      ...targetLog,
      meals: updatedMeals,
    };

    const updatedAll = { ...allLogs, [targetDate]: updated };
    setAllLogs(updatedAll);
    saveAllDailyLogs(updatedAll, currentUser.id);

    if (targetDate === todayStr) {
      setTodayLog(updated);
      saveTodayLog(updated, currentUser.id);
    }

    setSelectedDate(targetDate);
    setActiveTab('dashboard');
  };

  const handleDeleteMealItem = (mealId: string, itemId: string) => {
    const updatedMeals = (activeLog.meals || [])
      .map((meal) => {
        if (meal.id !== mealId) return meal;
        const filteredItems = meal.items.filter((it) => it.id !== itemId);
        return {
          ...meal,
          items: filteredItems,
          totalCalories: filteredItems.reduce((s, it) => s + it.calories, 0),
          totalProtein: filteredItems.reduce((s, it) => s + it.proteinG, 0),
          totalCarbs: filteredItems.reduce((s, it) => s + it.carbsG, 0),
          totalFat: filteredItems.reduce((s, it) => s + it.fatG, 0),
        };
      })
      .filter((meal) => meal.items.length > 0);

    const updated: DailyLog = {
      ...activeLog,
      meals: updatedMeals,
    };

    const updatedAll = { ...allLogs, [selectedDate]: updated };
    setAllLogs(updatedAll);
    saveAllDailyLogs(updatedAll, currentUser.id);

    if (selectedDate === todayStr) {
      setTodayLog(updated);
      saveTodayLog(updated, currentUser.id);
    }
  };

  const handleOpenLoggerForMeal = (type: MealType) => {
    setLoggerTargetMeal(type);
    setActiveTab('logger');
  };

  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    saveUserProfile(profile, currentUser.id);
  };

  const handleAddMeasurement = (newMeas: BodyMeasurement) => {
    const updated = [newMeas, ...measurements];
    setMeasurements(updated);
    saveBodyMeasurements(updated, currentUser.id);

    if (newMeas.weightKg !== userProfile.currentWeightKg) {
      const updatedProf = { ...userProfile, currentWeightKg: newMeas.weightKg };
      setUserProfile(updatedProf);
      saveUserProfile(updatedProf, currentUser.id);
    }
  };

  const handleSaveAudit = (audit: DailyAudit) => {
    const updated: DailyLog = {
      ...todayLog,
      audit,
    };
    setTodayLog(updated);
    saveTodayLog(updated, currentUser.id);

    const updatedAll = { ...allLogs, [todayLog.date]: updated };
    setAllLogs(updatedAll);
    saveAllDailyLogs(updatedAll, currentUser.id);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white flex justify-center selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Mobile-first app container */}
      <div className="w-full max-w-md min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col shadow-2xl relative border-x border-slate-200/60 dark:border-slate-800/60 transition-colors">
        {/* Sticky Header with Light/Dark toggle & Logout */}
        <Header
          user={currentUser}
          theme={theme}
          streakDays={Math.max(1, Object.keys(allLogs).length)}
          onToggleTheme={handleToggleTheme}
          onOpenProfile={() => setActiveTab('profile')}
          onLogout={handleLogout}
        />

        {/* Tab View Container */}
        <main className="flex-1 p-4 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-4 pb-20">
              {/* Date & Calendar Navigator */}
              <DateNavigator
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />

              <CalorieRing consumed={consumedTotals} profile={userProfile} />

              <MealSection
                meals={activeLog.meals || []}
                onOpenLoggerForMeal={handleOpenLoggerForMeal}
                onDeleteMealItem={handleDeleteMealItem}
              />

              <WaterTracker
                consumedMl={activeLog.waterConsumedMl || 0}
                targetMl={userProfile.waterTargetMl || 2500}
                onUpdateWater={handleUpdateWater}
              />

              {/* Minimalist Helper Strip - Unobtrusive & Clean */}
              <div className="pt-2 flex items-center justify-between gap-1.5 text-[11px]">
                <button
                  onClick={() => {
                    setRescueInitialTab('craving');
                    setIsRescueOpen(true);
                  }}
                  className="flex-1 py-2 px-2 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-semibold hover:border-amber-400 active:scale-95 transition-all text-center flex items-center justify-center gap-1 shadow-2xs"
                >
                  <span>🍫 Craving Help</span>
                </button>
                <button
                  onClick={() => {
                    setRescueInitialTab('cheat');
                    setIsRescueOpen(true);
                  }}
                  className="flex-1 py-2 px-2 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-semibold hover:border-rose-400 active:scale-95 transition-all text-center flex items-center justify-center gap-1 shadow-2xs"
                >
                  <span>🍕 Cheat Fix</span>
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className="flex-1 py-2 px-2 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-xl text-purple-700 dark:text-purple-400 font-semibold hover:border-purple-400 active:scale-95 transition-all text-center flex items-center justify-center gap-1 shadow-2xs"
                >
                  <span>🌙 Day Audit</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'logger' && (
            <AILoggerTab
              initialMealType={loggerTargetMeal}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              userProfile={userProfile}
              onMealSaved={handleSaveMeal}
              onOpenRescue={(tab) => {
                setRescueInitialTab(tab);
                setIsRescueOpen(true);
              }}
            />
          )}

          {activeTab === 'diet' && (
            <DietPlannerTab
              userProfile={userProfile}
              onLogMealDirectly={handleSaveMeal}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab
              userProfile={userProfile}
              dailyLogs={allLogs}
              measurements={measurements}
              onAddMeasurement={handleAddMeasurement}
            />
          )}

          {activeTab === 'community' && (
            <CommunityTab
              currentUser={currentUser}
              userProfile={userProfile}
            />
          )}

          {activeTab === 'audit' && (
            <DailyAuditTab
              dailyLog={todayLog}
              userProfile={userProfile}
              onSaveAudit={handleSaveAudit}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              userProfile={userProfile}
              onSaveProfile={handleSaveProfile}
            />
          )}
        </main>

        {/* AI Diet SOS & Craving Rescue Modal */}
        {userProfile && (
          <RescueModal
            isOpen={isRescueOpen}
            onClose={() => setIsRescueOpen(false)}
            userProfile={userProfile}
            initialTab={rescueInitialTab}
          />
        )}

        {/* PWA Android / Mobile Install Prompt */}
        <PwaInstallPrompt />

        {/* Mobile Bottom Navigation */}
        <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
      </div>
    </div>
  );
}
