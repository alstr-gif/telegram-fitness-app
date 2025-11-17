# Cindy Bias Analysis & Fix

## 🔍 Issues Found

### **Issue 1: Prompt Uses Cindy's Exact Rep Scheme as Primary Example** ⚠️ **CRITICAL**

The prompt uses **"5 Pull-ups, 10 Push-ups, 15 Squats"** as the primary example for AMRAP workouts in **4 different places**:

1. Line 941: `"${time.wodDuration} min AMRAP: 5 Pull-ups, 10 Push-ups, 15 Squats"`
2. Line 945: `"${time.wodDuration} min AMRAP: 5 Pull-ups, 10 Push-ups, 15 Squats"`
3. Line 1042: `"${time.wodDuration} min AMRAP: 5 Pull-ups, 10 Push-ups, 15 Squats"`
4. Line 1208: `"20 min AMRAP: Each round consists of 5 pull-ups, then 10 push-ups, then 15 squats"`

**This is exactly Cindy's rep scheme!** The AI sees this pattern repeatedly and replicates it.

### **Issue 2: "Cindy" Mentioned Explicitly in Examples** ⚠️

In `AIWorkoutService.ts` line 170:
```typescript
"name": "WOD name (e.g., 'Fran', 'Cindy', or descriptive like 'Metcon Mayhem')"
```

This explicitly mentions "Cindy" as an example, which could bias the AI.

### **Issue 3: Multiple Cindy Variants in Library** ⚠️

There are **4 Cindy-related workouts** in the library:
1. "Cindy" (original)
2. "Cindy's Cousin"
3. "Strict Cindy – Bodyweight AMRAP"
4. "Barbell Biased Cindy"

While this is only ~1.8% of the library, if the random selection picks one of these frequently, the AI sees the pattern.

### **Issue 4: No Variety Instructions** ⚠️

The prompt doesn't explicitly instruct the AI to:
- Avoid repeating the same workout
- Vary rep schemes
- Not copy exact examples from the library

---

## 🔧 Fixes Needed

1. **Replace "5 Pull-ups, 10 Push-ups, 15 Squats" examples** with different rep schemes
2. **Remove "Cindy" from explicit examples** in AIWorkoutService
3. **Add variety instructions** to avoid repeating workouts
4. **Add explicit instruction** to not copy exact examples from library

---

## 📊 Impact

- **Current**: AI sees "5 Pull-ups, 10 Push-ups, 15 Squats" 4 times in prompt → Generates Cindy-like workouts frequently
- **After Fix**: AI sees varied examples → Generates more diverse workouts

---

## ✅ Recommended Fixes

1. Change examples to use different rep schemes (e.g., "10 Wall Balls, 8 KB Swings, 6 Box Jumps")
2. Remove "Cindy" from explicit example
3. Add: "DO NOT copy exact examples from the library - create NEW workouts"
4. Add: "Vary rep schemes - don't always use 5-10-15 pattern"



