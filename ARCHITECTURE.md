# NutriAI Android — Architecture & Master System Blueprint
> **Project Location:** `C:\Users\AYUSH RAJ\Documents\ayush\nutriai-android` (Same level as `calorie-tracker-ai`)  
> **Platform:** Native Android App (React Native Expo SDK 57 + NativeWind v4) + Node.js / Next.js AI Backend  
> **Status:** Initialized & Ready for Development  
> **Last Updated:** 2026-10-08  

---

## 1. Quick Resume Summary (Agar Session Reconnect Ho)
Agar naya AI agent session start ho ya context reset ho, **is section ko padh kar turant resume karein**:
1. **Target Directory:** `C:\Users\AYUSH RAJ\Documents\ayush\nutriai-android` (Old web project `calorie-tracker-ai` ko chhodkar is naye folder mein kaam karna hai).
2. **Current Step:** Architecture documented & Mobile updated to Expo SDK 57.
3. **Core Stack:**
   - **Frontend:** React Native (Expo Router) + NativeWind v4 (Tailwind).
   - **Theme:** Dark Mode First OLED (`#090A0F` base, `#141721` cards, `#38BDF8` cyan protein hero, `#10B981` emerald calories, `#F59E0B` warm amber warnings).
   - **AI Pipeline:** OpenAI Whisper-1 (Hinglish voice notes) + gpt-4o-mini (Vision plate scan + Structured Zod JSON).
   - **User Constraints:** 1,500 kcal deficit, 115g–120g protein floor, LDL 170 / Triglycerides 216 lipid guardrails, MuscleBlaze Pre-Workout 200 timing rule, Centrum & Omega-3 supplement checklist.

---

## 2. Fitness, Nutrition & Clinical Foundation

### 2.1. Daily Macro Targets
- **Target Calories:** Strict **1,500 kcal / day** (Fat loss caloric deficit).
- **Protein Floor:** **115g – 120g / day** (Mandatory lean mass preservation).
- **Fats:** ~40g–45g / day (Saturated fats strictly capped at $<15\text{g}$).
- **Carbohydrates:** ~140g–150g / day (Complex carbs & soluble fiber focus).

### 2.2. Clinical Lipid Guardrails (LDL 170 mg/dL | Triglycerides 216 mg/dL)
- **Saturated & Trans Fat Interceptor:**
  - Auto-flags bakery products, bun maska, osmania biscuits, dalda, deep-fried snacks.
  - Alert: `⚠️ Lipid Warning: High Saturated Fat Detected (>8g). Compensate with soluble fiber.`
- **Soluble Fiber Hero Target ($\ge 10\text{g}$ / day):**
  - High priority foods: **Bhutta (corn), Moong/Chana sprouts, Rolled oats, Chia seeds, Isabgol**.
- **Anti-Crash Dieting Protocol:**
  - Agar daily intake $< 1,100\text{kcal}$ rehta hai (jaise 5 Oct ~935 kcal event), app "Crash Alert" trigger karega aur recovery food (whey + oats + chia) suggest karega taaki muscle loss aur metabolic crash na ho.

### 2.3. Gym Safety & Stimulant Rules
- **MuscleBlaze Pre-Workout 200 Protocol:**
  - **Dose:** Half scoop (~100mg caffeine).
  - **Window:** Subah ya dopahar ke sessions only.
  - **4:00 PM Hard Cut-off:** Shaam 4 PM ke baad workout start karne par pre-workout disable hoga to protect sleep architecture and resting heart rate.
- **Vasovagal Syncope (Blackout) Prevention:**
  - Heavy compound lifts (Squats, Leg Press, Deadlifts, Overhead Press) par breathing cue banner:
  - `🌬️ Smooth Breathing Cue: Exhale on exertion (push/pull). Saans mat roko (avoid Valsalva) to prevent fainting.`

### 2.4. Daily Supplement Checklist (Dinner Anchor)
- **Centrum Multivitamin:** 1 tablet daily with dinner.
- **Naturaltein Omega-3:** 1–2 capsules daily with dinner (for lowering TG 216 mg/dL and joint recovery).

---

## 3. Desi Food Heuristics Engine (Zero-Click Calibration)

| Food Item | Standard Measure | Estimated Calories | Macros & Heuristic Logic |
| :--- | :--- | :--- | :--- |
| **Ghar Ki Plain Roti** | 1 medium handmade | ~85 kcal | $3\text{g P} \mid 15\text{g C} \mid 1.2\text{g F}$ |
| **Butter / Ghee Roti** | 1 smeared roti | ~125 kcal | $3\text{g P} \mid 15\text{g C} \mid 5\text{g F}$ (+1 tsp ghee) |
| **Ghar Ki Gravy / Curry** | 1 katori (~150ml) | +5g Hidden Fat | Cooking oil in gravies auto-calculated |
| **Yellow Dal Tadka** | 1 katori (~150ml) | ~150 kcal | $7\text{g P} \mid 20\text{g C} \mid 4.5\text{g F}$ |
| **Dal Makhani** | 1 katori (~150ml) | ~280 kcal | $8\text{g P} \mid 25\text{g C} \mid 16\text{g F}$ (High butter/cream) |
| **Murmura / Lai** | 1 bowl (~25g) | ~95 kcal | High volume, low calorie density |
| **Bhutta (Sweet Corn)** | Half cob / 1 bowl | ~90 kcal | $3\text{g P} \mid 19\text{g C} \mid 2.5\text{g Soluble Fiber}$ |
| **Bun Maska** | 1 standard | ~380 kcal | $6\text{g P} \mid 42\text{g C} \mid 21\text{g F}$ (Saturated fat alert) |
| **Osmania Biscuit** | 1 piece (~15g) | ~75 kcal | $1\text{g P} \mid 9\text{g C} \mid 4\text{g F}$ (Dalda/butter alert) |

---

## 4. Design System & OLED Dark Tokens

```
Canvas Base:        #090A0F  (Pitch Slate Black - prevents OLED smearing)
Card / Surface:     #141721  (Elevated dark card layer)
Card Border:        #1F2433  (Subtle structure separator)
Protein Hero:       #38BDF8  (Electric Sky Cyan - highest visual hierarchy)
Calorie Metric:     #10B981  (Emerald Green - balanced, non-neon energy)
Lipid/Crash Alert:  #F59E0B  (Warm Amber - constructive, non-panic warning)
Text Primary:       #F8FAFC  (Crisp off-white - 17.5:1 contrast)
Text Secondary:     #94A3B8  (Muted slate for portions & timestamps)
```

---

## 5. Clean 3-Tab Android App UX Architecture

### Tab 1: Today (Dashboard Feed)
1. **Fuel Gauge Header:**
   - Calorie Ring: Consumed vs 1,500 kcal target.
   - Hero Protein Pill: Consumed vs 120g target (e.g. `69g / 120g — 51g left`).
2. **Omnibox Capsule (Single Unified Input):**
   - `[📷 Snap Plate]` $\rightarrow$ Vision nutrients.
   - `[🎙️ Voice Note]` $\rightarrow$ Whisper-1 Hinglish audio parser.
   - `[💬 Text Input]` $\rightarrow$ Instant natural language parsing.
3. **Workout Safety Widget:**
   - Daily split (e.g., Push Day).
   - MB Pre-Workout status (Active morning/afternoon vs Disabled after 4 PM).
   - Exhale on exertion breathing cue.
4. **Timeline Feed:**
   - Chronological meal cards.
   - Tactile/Haptic Portion Sliders: `0.5x`, `1.0x`, `1.5x`, `2.0x`.
   - Lipid warning badges if saturated fat $>8\text{g}$.
5. **Evening Supplement Anchor:**
   - 1-tap toggles for Centrum Multivitamin and Naturaltein Omega-3.

### Tab 2: Coach Mode
1. **Macro Gap Solver:**
   - Chat input: *"Shaam ko 51g protein bacha hai, kya khau?"* $\rightarrow$ Suggests low-saturated fat, high-protein options (whey, boiled eggs, roasted chana, sattu, soya).
2. **Lab Report Vault:**
   - Upload PDF or photo of blood work (Lipid profile, HbA1c, Vitamin D).
   - Extracts LDL, Triglycerides, HDL and updates dynamic guardrails.

### Tab 3: Club & Profile
1. **Consistency Leaderboard:**
   - Points awarded for streak days and hitting $\ge 115\text{g}$ protein floor.
   - Penalty / warning flag for crash dieting ($<1,100\text{kcal}$).
2. **Lipid Trends:** Historical graph of dietary saturated fat vs soluble fiber intake.
3. **Biometrics & Settings:** Age, height, weight, API key configuration, data export.

---

## 6. Monorepo Directory Layout (`nutriai-android`)

```
nutriai-android/
├── ARCHITECTURE.md                  # This file (source of truth)
├── package.json                     # Root scripts & workspaces
│
├── mobile/                          # React Native (Expo SDK 52) Android App
│   ├── app/
│   │   ├── _layout.tsx              # Root Stack & Theme Provider
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx          # 3-Tab Bottom Navigation
│   │   │   ├── index.tsx            # TAB 1: Today Feed & Fuel Gauge
│   │   │   ├── coach.tsx            # TAB 2: AI Coach & Lab Report
│   │   │   └── club.tsx             # TAB 3: Consistency Club & Profile
│   │   └── modal/
│   │       ├── omnibox.tsx          # Fullscreen Voice/Camera modal
│   │       └── lab-report.tsx       # Lab report upload & breakdown
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── FuelGauge.tsx
│   │   │   ├── OmniboxCapsule.tsx
│   │   │   ├── MealTimelineCard.tsx
│   │   │   ├── WorkoutSafetyCard.tsx
│   │   │   └── SupplementChecklist.tsx
│   │   └── ui/
│   │       ├── TactileSlider.tsx
│   │       └── LipidAlertBadge.tsx
│   ├── services/
│   │   ├── audioRecorder.ts         # Expo AV microphone recording
│   │   ├── cameraService.ts         # Expo ImagePicker
│   │   └── api.ts                   # Fast backend client
│   ├── tailwind.config.js           # Design tokens (#090A0F, #141721, etc.)
│   ├── app.json                     # Android package (com.nutriai.app)
│   └── package.json
│
└── server/                          # Dedicated Node.js / Next.js AI Backend
    ├── src/
    │   ├── routes/
    │   │   ├── omniLog.ts           # Whisper audio + Vision + Text $\rightarrow$ Zod JSON
    │   │   ├── coachChat.ts         # Macro gap solver
    │   │   └── labReport.ts         # PDF/Image lipid parser
    │   ├── lib/
    │   │   ├── desiHeuristics.ts    # Roti, katori, lai, gravy fat
    │   │   ├── healthGuardrails.ts  # 1500 kcal, 120g protein, lipid & crash alerts
    │   │   └── schemas.ts           # Zod validation schemas
    │   └── server.ts                # Express / Hono server
    ├── package.json
    └── tsconfig.json
```

---

## 7. Implementation Roadmap & Resume Checklist

- [x] **Milestone 0:** Architecture, clinical guardrails, design tokens, and monorepo blueprint defined.
- [x] **Milestone 1:** Initialize `nutriai-android` root, `server/` with Zod schemas, Desi Heuristics, Lipid Guardrails, and Whisper/Omni-log endpoints.
- [x] **Milestone 2:** Initialize `mobile/` with Expo SDK 52, NativeWind v4, Lucide icons, and `#090A0F` dark theme.
- [x] **Milestone 3:** Build Tab 1 (Today Feed): Fuel Gauge, Omnibox Capsule (Voice/Camera/Text), Meal Timeline with tactile sliders, Workout safety card, and Supplement checklist.
- [x] **Milestone 4:** Build Tab 2 (Coach Mode): AI Macro Gap Solver and Lab Report Vault.
- [x] **Milestone 5:** Build Tab 3 (Club & Profile): Consistency Leaderboard, Lipid Trends, and Profile settings.
- [ ] **Milestone 6:** Android APK build verification & live device testing.

