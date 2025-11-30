# How to Increase Variety in Generated Workouts

## 🎯 Quick Answer

**YES - Adding more library workouts is the BEST way to increase variety!**

The library workouts provide structural/format guidance (~20-30% influence), so more examples = more variety in formats, movements, and rep schemes.

---

## 📊 Current State

- **Library Size**: ~20 workouts in `crossfit-wods.ts`
- **Selection**: 4 random workouts selected each time
- **Temperature**: 0.7 (balance between variety and consistency)
- **Variety Mechanisms**: 
  - ✅ Workout history analysis (prevents repetition)
  - ✅ CrossFit methodology balancing
  - ✅ Movement frequency tracking

---

## 🚀 Recommended Actions (Priority Order)

### 1. **Expand Library Workouts** ⭐ **HIGHEST PRIORITY**

**Why**: Library workouts provide format/structure guidance. More examples = more variety.

**Action**: Add more workouts to `src/config/crossfit-wods.ts`

**Target**: Aim for **50-100+ workouts** for maximum variety

**What to Add**:

#### **Format Diversity** (Ensure all types are represented):
- ✅ AMRAP (As Many Rounds As Possible)
- ✅ EMOM (Every Minute On the Minute)
- ✅ For Time
- ✅ Chipper
- ✅ Rounds For Time
- ✅ Tabata
- ✅ Custom (multi-part, complexes, etc.)

#### **Duration Diversity**:
- Short (10-15 min): Quick, intense benchmarks
- Medium (20-30 min): Classic WODs
- Long (40+ min): Grinders, endurance tests

#### **Movement Diversity**:
- **Gymnastics-heavy**: Pull-ups, push-ups, muscle-ups, handstands
- **Weightlifting-heavy**: Barbell complexes, Olympic lifts
- **Cardio-heavy**: Running, rowing, biking intervals
- **Mixed**: Classic CrossFit blend

#### **Rep Scheme Diversity**:
- 21-15-9 (Fran style)
- 50-40-30-20-10 (Chipper)
- 10-8-6-4-2 (Strength ladder)
- Ascending/descending ladders
- Fixed reps (EMOM)
- Max reps (AMRAP)

**Example Additions**:

```typescript
// Add more AMRAP variations
{
  name: 'The Beast',
  type: 'AMRAP',
  duration: 15,
  description: '15 minute AMRAP',
  movements: [
    '3 Bar Muscle-Ups',
    '6 Thrusters (43/29 kg)',
    '9 Toes-to-Bar',
    '12 Box Jumps (61/51 cm)',
  ],
  notes: 'Target: 8+ rounds. Scale BMU to jumping BMU or C2B pull-ups',
},

// Add more EMOM variations
{
  name: 'Death by Thrusters',
  type: 'EMOM',
  duration: 20,
  description: 'EMOM until failure',
  movements: [
    'Minute 1: 1 Thruster (43/29 kg)',
    'Minute 2: 2 Thrusters',
    'Minute 3: 3 Thrusters',
    '(Continue adding 1 thruster each minute until failure)',
  ],
  notes: 'Advanced athletes reach 15+ minutes',
},

// Add more For Time variations
{
  name: 'Diane',
  type: 'For Time',
  description: '21-15-9 reps for time',
  movements: [
    '21-15-9 Deadlifts (102/70 kg)',
    '21-15-9 Handstand Push-ups',
  ],
  notes: 'Scale HSPU to pike push-ups or wall walks',
},

// Add more Chipper variations
{
  name: 'The Chipper',
  type: 'Chipper',
  description: 'For time - complete all movements',
  movements: [
    '100 Double-Unders',
    '80 Wall Balls (9/6 kg)',
    '60 Box Jumps (61/51 cm)',
    '40 KB Swings (32/24 kg)',
    '20 Burpee Pull-ups',
  ],
  notes: 'Target: 15-25 minutes. Scale double-unders to single-unders (x3)',
},
```

---

### 2. **Increase Temperature** (Optional)

**Current**: `temperature: 0.7` (line 138, 193, 247 in `SingleWorkoutService.ts`)

**Options**:
- **0.75-0.8**: More variety, slightly less consistency
- **0.7**: Current balance (recommended)
- **0.9**: Maximum variety, less consistency

**Trade-off**: Higher temperature = more creative/varied outputs but less predictable

**Recommendation**: Keep at 0.7 unless you notice too much repetition, then try 0.75

---

### 3. **Ensure Library Diversity** (Check Current Library)

Verify your library has:

- ✅ **All 7 format types** (AMRAP, EMOM, For Time, Chipper, Rounds, Tabata, Custom)
- ✅ **All 3 duration ranges** (short, medium, long)
- ✅ **All 4 modality types** (gymnastics, weightlifting, cardio, mixed)
- ✅ **Various rep schemes** (21-15-9, 50-40-30-20-10, ladders, etc.)

**Quick Check**:
```bash
# Count workouts by type
grep -c "type: 'AMRAP'" src/config/crossfit-wods.ts
grep -c "type: 'EMOM'" src/config/crossfit-wods.ts
grep -c "type: 'For Time'" src/config/crossfit-wods.ts
# etc.
```

---

## 📈 Expected Impact

### **Current (20 workouts)**:
- 4 random examples selected each time
- ~5% chance of seeing same 4 examples again
- Limited format variety if library is skewed

### **After Expansion (50-100 workouts)**:
- 4 random examples from much larger pool
- <1% chance of seeing same 4 examples
- Much more format/movement variety
- AI has more patterns to learn from

---

## 🎯 Quick Win: Add 10-20 Workouts Now

**Fastest way to increase variety**: Add 10-20 diverse workouts to your library right now.

**Focus on**:
1. **Missing formats**: If you only have 2 EMOM workouts, add 5 more
2. **Missing durations**: If you only have short workouts, add medium/long ones
3. **Missing movements**: If you're light on gymnastics, add more gymnastics-heavy WODs

**Where to find workouts**:
- https://www.crossfit.com/workout/ (Daily WODs)
- https://wodwell.com/ (Huge WOD database)
- Your gym's programming
- Competition workouts

---

## ✅ Already Working Well

These mechanisms already help with variety:

1. **Workout History Analysis** (lines 381-522 in `SingleWorkoutService.ts`)
   - Prevents movement overtraining
   - Balances time domains, modalities, intensity
   - Suggests underused movements

2. **CrossFit Methodology Balancing** (lines 431-500)
   - Ensures variety across energy systems
   - Balances movement patterns
   - Rotates workout types

3. **Random Library Selection** (line 265 in `LibraryWorkoutService.ts`)
   - `RANDOM()` ensures different examples each time
   - More library workouts = more variety in examples

---

## 🔧 Implementation Steps

1. **Open**: `src/config/crossfit-wods.ts`
2. **Add**: 10-20 new diverse workouts (use template from file)
3. **Save**: File auto-reloads (or restart backend)
4. **Test**: Generate a few workouts and check variety
5. **Repeat**: Add more as needed

---

## 📊 Monitoring Variety

**How to check if variety improved**:

1. **Generate 10 workouts** with same user preferences
2. **Check**:
   - How many different formats? (AMRAP, EMOM, For Time, etc.)
   - How many different movements?
   - How many different rep schemes?
   - Are workouts feeling repetitive?

**Goal**: Each workout should feel unique while following CrossFit principles.

---

## 🎯 Summary

**Best Action**: **Add more library workouts** (50-100+ target)

**Why**: Library workouts provide structural guidance. More examples = more variety in formats, movements, and rep schemes.

**Quick Win**: Add 10-20 diverse workouts now focusing on missing formats/durations/movements.

**Optional**: Increase temperature to 0.75-0.8 if you want more creative variety (but may reduce consistency).

**Already Working**: Workout history analysis and CrossFit methodology balancing already help with variety.

---

**File to Edit**: `src/config/crossfit-wods.ts`

**Current Count**: ~20 workouts

**Target Count**: 50-100+ workouts for maximum variety





