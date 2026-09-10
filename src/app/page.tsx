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
  resetAppToCleanSlate,
  DEFAULT_PROFILE,
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
import { HeaderDrawer } from '@/components/layout/HeaderDrawer';
import { ExerciseGuideModal } from '@/components/exercise/ExerciseGuideModal';
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
import { DaySummaryCard } from '@/components/dashboard/DaySummaryCard';
import { getTodayDateString } from '@/utils/dateUtils';
import { Sparkles, RotateCcw } from 'lucide-react';

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [dietTabMode, setDietTabMode] = useState<'pantry' | 'upload'>('pantry');

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
    setShowAuthForm(true);
  };

  const handleFreshStart = () => {
    resetAppToCleanSlate();
    logoutUser();
    setCurrentUser(null);
    setUserProfile(null);
    setTodayLog(null);
    setAllLogs({});
    setMeasurements([]);
    setShowAuthForm(false);
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
            ...DEFAULT_PROFILE,
            userId: currentUser.id,
            name: currentUser.name,
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

  const handleOpenLoggerForMeal = (type?: MealType) => {
    setLoggerTargetMeal(type || 'lunch');
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
    const targetDate = audit.date || selectedDate;
    const existingLog = allLogs[targetDate] || (targetDate === todayStr ? todayLog : {
      date: targetDate,
      waterConsumedMl: 0,
      meals: [],
    });

    const updated: DailyLog = {
      ...existingLog,
      audit,
    };

    const updatedAll = { ...allLogs, [targetDate]: updated };
    setAllLogs(updatedAll);
    saveAllDailyLogs(updatedAll, currentUser.id);

    if (targetDate === todayStr) {
      setTodayLog(updated);
      saveTodayLog(updated, currentUser.id);
    }
  };

  const handleRestartOnboarding = () => {
    if (userProfile && currentUser) {
      const resetProf: UserProfile = { ...userProfile, isOnboarded: false };
      setUserProfile(resetProf);
      saveUserProfile(resetProf, currentUser.id);
    }
  };

  const handleResetMeals = () => {
    if (currentUser) {
      setAllLogs({});
      const emptyToday: DailyLog = {
        date: todayStr,
        waterConsumedMl: 0,
        meals: [],
      };
      setTodayLog(emptyToday);
      saveTodayLog(emptyToday, currentUser.id);
      saveAllDailyLogs({}, currentUser.id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white flex justify-center selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Mobile-first app container */}
      <div className="w-full max-w-md min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col shadow-2xl relative border-x border-slate-200/60 dark:border-slate-800/60 transition-colors">
        {/* Sticky Header with Light/Dark toggle, Streak & Hamburger Menu */}
        <Header
          user={currentUser}
          theme={theme}
          streakDays={Math.max(1, Object.keys(allLogs).length)}
          onToggleTheme={handleToggleTheme}
          onOpenMenu={() => setIsDrawerOpen(true)}
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

              {/* Day Total Summary Card (Today & Past Dates) */}
              <DaySummaryCard
                date={selectedDate}
                dailyLog={activeLog}
                profile={userProfile}
                onOpenLogger={handleOpenLoggerForMeal}
                onOpenAudit={() => setActiveTab('audit')}
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

              {/* Quick Helpers */}
              <div className="pt-1">
                <div className="flex items-center justify-between px-1 mb-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    Quick Helpers
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">1-tap solutions</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setRescueInitialTab('craving');
                      setIsRescueOpen(true);
                    }}
                    className="p-3 bg-amber-50/60 hover:bg-amber-100/60 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/30 rounded-2xl active:scale-95 transition-all group"
                  >
                    <span className="text-xl block mb-1 group-hover:scale-110 transition-transform">🍫</span>
                    <strong className="text-xs font-bold text-amber-900 dark:text-amber-200 block leading-tight">
                      Craving
                    </strong>
                    <span className="text-[9px] text-amber-700/70 dark:text-amber-400/80">0-guilt swap</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRescueInitialTab('cheat');
                      setIsRescueOpen(true);
                    }}
                    className="p-3 bg-rose-50/60 hover:bg-rose-100/60 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/30 rounded-2xl active:scale-95 transition-all group"
                  >
                    <span className="text-xl block mb-1 group-hover:scale-110 transition-transform">🍕</span>
                    <strong className="text-xs font-bold text-rose-900 dark:text-rose-200 block leading-tight">
                      Cheat Fix
                    </strong>
                    <span className="text-[9px] text-rose-700/70 dark:text-rose-400/80">24h offset</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('audit')}
                    className="p-3 bg-purple-50/60 hover:bg-purple-100/60 dark:bg-purple-950/20 dark:hover:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/30 rounded-2xl active:scale-95 transition-all group"
                  >
                    <span className="text-xl block mb-1 group-hover:scale-110 transition-transform">🌙</span>
                    <strong className="text-xs font-bold text-purple-900 dark:text-purple-200 block leading-tight">
                      Daily Review
                    </strong>
                    <span className="text-[9px] text-purple-700/70 dark:text-purple-400/80">Coach feedback</span>
                  </button>
                </div>
              </div>

              {/* Discreet Sectional Reset Button */}
              {activeLog.meals && activeLog.meals.length > 0 && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleResetMeals}
                    className="text-[11px] text-slate-400 hover:text-rose-500 underline inline-flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear today&apos;s logged meals</span>
                  </button>
                </div>
              )}
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
              defaultMode={dietTabMode}
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
              dailyLog={activeLog}
              userProfile={userProfile}
              onSaveAudit={handleSaveAudit}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              userProfile={userProfile}
              onSaveProfile={handleSaveProfile}
              onRestartOnboarding={handleRestartOnboarding}
              onResetMeals={handleResetMeals}
              onLogout={handleLogout}
              onFreshStart={handleFreshStart}
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

        {/* Slide-out Hamburger Drawer */}
        <HeaderDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          user={currentUser || undefined}
          theme={theme}
          streakDays={Math.max(1, Object.keys(allLogs).length)}
          onToggleTheme={handleToggleTheme}
          onOpenExerciseGuide={() => setIsExerciseModalOpen(true)}
          onOpenUploadDiet={() => {
            setDietTabMode('upload');
            setActiveTab('diet');
          }}
          onOpenProfile={() => setActiveTab('profile')}
          onOpenResetCenter={() => setActiveTab('profile')}
          onLogout={handleLogout}
        />

        {/* Exercise & Form Guide Modal */}
        <ExerciseGuideModal
          isOpen={isExerciseModalOpen}
          onClose={() => setIsExerciseModalOpen(false)}
        />
      </div>
    </div>
  );
}
