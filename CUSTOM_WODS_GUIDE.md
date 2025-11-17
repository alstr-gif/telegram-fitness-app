# 🏋️ Custom CrossFit WODs Guide

## How to Add Your Favorite Workouts

The AI uses your favorite WODs as examples when generating new workouts!

---

## 📁 **WOD Library Location:**

**File:** `src/config/crossfit-wods.ts`

---

## ➕ **How to Add Your WODs:**

### **Step 1: Open the file**

```bash
cd ~/telegram-fitness-app
code src/config/crossfit-wods.ts
# or
nano src/config/crossfit-wods.ts
```

### **Step 2: Scroll to the bottom**

Find this section:
```typescript
// ADD YOUR OWN FAVORITE WODS BELOW!
```

### **Step 3: Add your WOD**

Copy this template and paste it:

```typescript
{
  name: 'Your WOD Name',
  type: 'AMRAP', // Choose: AMRAP, EMOM, For Time, Chipper, Rounds, Tabata, Custom
  duration: 20, // Optional: time in minutes
  description: 'Brief description of the workout',
  movements: [
    '5 Movement One (with details)',
    '10 Movement Two (with details)',
    '15 Movement Three (with details)',
  ],
  notes: 'Scaling options, tips, target times, etc.',
},
```

### **Step 4: Save the file**

- In nano: **Ctrl+O**, **Enter**, **Ctrl+X**
- In VS Code: **Cmd+S**

### **Step 5: Restart backend**

Backend will auto-restart, or manually:
```bash
# Ctrl+C in backend terminal, then:
npm run dev
```

---

## 📝 **WOD Template Fields:**

### **Required Fields:**

- **name**: WOD name (e.g., "Fran", "Murph", "My Custom WOD")
- **type**: Workout format
  - `'AMRAP'` - As Many Rounds As Possible
  - `'EMOM'` - Every Minute On the Minute
  - `'For Time'` - Complete as fast as possible
  - `'Chipper'` - Work through a list of movements
  - `'Rounds'` - Fixed rounds for time
  - `'Tabata'` - 20 sec on, 10 sec off
  - `'Custom'` - Other formats
- **description**: What the workout is
- **movements**: Array of movements with reps/weights

### **Optional Fields:**

- **duration**: Time in minutes (for AMRAPs, EMOMs)
- **notes**: Scaling, modifications, targets

---

## 🎯 **Example: Adding a Custom WOD**

### Example 1: AMRAP Workout

```typescript
{
  name: 'The Beast',
  type: 'AMRAP',
  duration: 20,
  description: '20 minute AMRAP',
  movements: [
    '10 Thrusters (43/29 kg)',
    '10 Box Jumps (61/51 cm)',
    '10 Burpees',
    '10 Calorie Row',
  ],
  notes: 'Goal: 8+ rounds. Scale weight and movements as needed.',
},
```

### Example 2: For Time Workout

```typescript
{
  name: 'Karen',
  type: 'For Time',
  description: '150 reps for time',
  movements: [
    '150 Wall Balls (9/6 kg to 3m target)',
  ],
  notes: 'Target: Sub 10 minutes. Break up reps strategically.',
},
```

### Example 3: EMOM Workout

```typescript
{
  name: 'Gymnastics EMOM',
  type: 'EMOM',
  duration: 16,
  description: '16 min EMOM (4 movements x 4 rounds)',
  movements: [
    'Minute 1: 15 Push-ups',
    'Minute 2: 10 Pull-ups',
    'Minute 3: 20 Sit-ups',
    'Minute 4: 15 Air Squats',
  ],
  notes: 'Scale movements to finish with 15-20 seconds rest each minute.',
},
```

### Example 4: Complex Chipper

```typescript
{
  name: 'The Seven',
  type: 'Rounds',
  duration: 45,
  description: '7 rounds, 1 minute per station',
  movements: [
    '1 min: Burpees',
    '1 min: Thrusters (34/25 kg)',
    '1 min: Pull-ups',
    '1 min: Kettlebell Swings (24/16 kg)',
    '1 min: Row (calories)',
    '1 min: Box Jumps (61/51 cm)',
    '1 min: Double-Unders',
  ],
  notes: 'Score total reps across all rounds. No rest between stations.',
},
```

---

## 🔥 **Pre-Loaded Famous WODs:**

The file already includes these benchmark WODs:

✅ **Fran** - 21-15-9 Thrusters & Pull-ups  
✅ **Cindy** - 20 min AMRAP  
✅ **Murph** - Mile, 100-200-300, Mile  
✅ **Annie** - 50-40-30-20-10 DUs & Sit-ups  
✅ **Helen** - 3 rounds: Run, KBS, Pull-ups  
✅ **Grace** - 30 Clean & Jerks for time  
✅ **DT** - 5 rounds Deadlift/HPC/Push Jerk  
✅ **The Filthy Fifty** - 50 of 10 movements  
✅ **Death by Burpees** - EMOM until failure  
✅ **Tabata Something Else**  

---

## 🎨 **How the AI Uses Your WODs:**

1. **Random Selection**: AI picks 4 random WODs from your library
2. **Learning**: Analyzes the structure, rep schemes, and formats
3. **Inspiration**: Creates new workouts in similar style
4. **Variation**: Keeps it fresh by mixing elements

**More WODs you add = More variety AI can generate!**

---

## 💡 **Tips for Adding WODs:**

### **1. Include Variety**

Add different types:
- Some short (10-15 min)
- Some long (30-45 min)
- Different formats (AMRAP, EMOM, For Time)
- Various movements (gymnastics, lifting, cardio)

### **2. Specify Details**

```typescript
// GOOD: Specific
movements: [
  '21 Thrusters (43/29 kg)',
  '400m Run',
  '15 Pull-ups (strict)',
]

// OKAY: General
movements: [
  'Thrusters',
  'Run',
  'Pull-ups',
]
```

### **3. Add Scaling Options**

```typescript
notes: 'RX: 43/29 kg. Scaled: 34/25 kg. Beginner: 20/16 kg or PVC pipe'
```

### **4. Include Context**

```typescript
description: '5 rounds for time - heavy thrusters and gymnastics',
notes: 'Target: 15-20 minutes. This is a grinder - pace yourself!'
```

---

## 🧪 **Testing Your Custom WODs:**

After adding new WODs:

1. **Save the file**
2. **Restart backend** (auto-restarts with nodemon)
3. **Generate a new workout** in the app
4. **AI will use your WODs as inspiration!**

The more workouts you add, the better the variety!

---

## 📚 **Workout Type Reference:**

### **AMRAP** (As Many Rounds/Reps As Possible)
```
20 min AMRAP:
- 5 Pull-ups
- 10 Push-ups
- 15 Squats
```

### **EMOM** (Every Minute On the Minute)
```
12 min EMOM:
Min 1: 10 Burpees
Min 2: 15 KB Swings
Min 3: 20 Sit-ups
```

### **For Time**
```
For Time:
21-15-9 reps of:
- Thrusters
- Pull-ups
```

### **Chipper** (Work through a list)
```
For Time:
50 Wall Balls
40 Box Jumps
30 Burpees
20 T2B
10 Muscle-ups
```

### **Rounds For Time**
```
5 Rounds For Time:
- 400m Run
- 15 Thrusters (95/65)
- 15 Pull-ups
```

---

## 🎯 **Quick Add Example:**

Want to add "Fran" variant? Just paste this:

```typescript
{
  name: 'Light Fran',
  type: 'For Time',
  description: '21-15-9 for time',
  movements: [
    '21-15-9 Thrusters (29/20 kg)',
    '21-15-9 Chest-to-Bar Pull-ups',
  ],
  notes: 'Lighter weight, harder pull-up variation. Target: Sub 5 minutes.',
},
```

---

## 📖 **Current Library:**

You already have **10 famous CrossFit WODs** loaded!

The AI randomly picks 4 each time to use as examples.

---

## 💪 **Add Your Favorites:**

**Where to find CrossFit WODs:**
- https://www.crossfit.com/workout/ (Daily WODs)
- https://wodwell.com/ (Huge WOD database)
- Your gym's programming
- Competition workouts
- Your own creations!

---

## 🚀 **Next Steps:**

1. **Open:** `src/config/crossfit-wods.ts`
2. **Scroll** to bottom (after the pre-loaded WODs)
3. **Paste** your favorite workouts using the template
4. **Save** and restart backend
5. **Generate** a new workout - AI uses your library!

---

**The more WODs you add, the better and more varied your AI-generated workouts will be!** 🔥

**File Location:** `/Users/aleksandrsstramkals/telegram-fitness-app/src/config/crossfit-wods.ts`

