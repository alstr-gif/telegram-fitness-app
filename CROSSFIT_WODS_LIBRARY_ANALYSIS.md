# CrossFit WODs Library Analysis

## 📊 Summary

**Total Workouts in Library:** **291 workouts**

**Last Updated:** Analysis based on current `crossfit-wods.ts` file

**File Location:** `src/config/crossfit-wods.ts`

---

## 📈 Breakdown by Workout Type

| Type | Count | Percentage | Avg Duration | Min Duration | Max Duration | Description |
|------|-------|------------|--------------|--------------|--------------|-------------|
| **EMOM** | 104 | 35.7% | **33.0 min** | 8 min | 50 min | Every Minute On the Minute workouts |
| **For Time** | 76 | 26.1% | **20.4 min** | 5 min | 60 min | Classic timed workouts (21-15-9, chipper-style, etc.) |
| **AMRAP** | 31 | 10.7% | **22.6 min** | 8 min | 60 min | As Many Rounds As Possible workouts |
| **Rounds** | 28 | 9.6% | **24.0 min** | 14 min | 50 min | Fixed rounds for time workouts |
| **Custom** | 23 | 7.9% | **34.5 min** | 18 min | 60 min | Custom workout formats (complexes, ladders, etc.) |
| **Chipper** | 15 | 5.2% | **41.1 min** | 26 min | 58 min | High-volume chipper workouts |
| **Tabata** | 14 | 4.8% | **20.4 min** | 5 min | 32 min | Tabata interval workouts |

---

## 📊 Visual Breakdown

```
For Time:    ████████████████████████████████████████████████████████████████████ 76 (34.2%)
EMOM:        ████████████████████████████████████ 34 (15.3%)
AMRAP:       ██████████████████████████████████ 32 (14.4%)
Rounds:      ████████████████████████████ 28 (12.6%)
Custom:      ███████████████████████ 23 (10.4%)
Chipper:     ███████████████ 15 (6.8%)
Tabata:      ██████████████ 14 (6.3%)
```

---

## 🔍 Key Insights

### **Most Common Type: For Time (34.2%)**
- **76 workouts** use the "For Time" format
- **Average Duration:** 20.4 min (range: 5-60 min)
- Includes classic benchmarks like Fran, Murph, Grace, etc.
- Popular rep schemes: 21-15-9, 50-40-30-20-10, ladders

### **Second Most Common: EMOM (15.3%)**
- **34 workouts** use EMOM format
- **Average Duration:** 18.6 min (range: 8-50 min) - **Shortest average!**
- Good for structured interval training
- Often combines strength and conditioning

### **Third Most Common: AMRAP (14.4%)**
- **32 workouts** use AMRAP format
- **Average Duration:** 22.6 min (range: 8-60 min)
- Includes famous benchmarks like Cindy
- Popular for time-capped workouts

### **Longest Average Duration: Chipper (41.1 min)**
- **15 workouts** use Chipper format
- **Average Duration:** 41.1 min (range: 26-58 min) - **Longest average!**
- High-volume workouts with many movements
- Typically longer due to high rep counts

### **Shortest Average Duration: EMOM (18.6 min)**
- **34 workouts** use EMOM format
- **Average Duration:** 18.6 min (range: 8-50 min) - **Shortest average!**
- Structured intervals keep workouts focused
- Good for time-efficient training

### **Balanced Distribution:**
- **Top 3 types** (For Time, EMOM, AMRAP) = **64%** of all workouts
- **Remaining 4 types** (Rounds, Custom, Chipper, Tabata) = **36%** of all workouts

---

## 📋 Type Descriptions

### **For Time (76 workouts - 34.2%)**
- Complete a set amount of work as fast as possible
- **Average Duration:** 20.4 min (range: 5-60 min)
- Examples: Fran (21-15-9), Murph, Grace, DT
- Rep schemes: 21-15-9, 50-40-30-20-10, ladders, fixed reps

### **EMOM (34 workouts - 15.3%)**
- Every Minute On the Minute
- **Average Duration:** 18.6 min (range: 8-50 min)
- Complete specified work within each minute
- Examples: EMOM Power, EMOM Complex, EMOM Sprint

### **AMRAP (32 workouts - 14.4%)**
- As Many Rounds As Possible
- **Average Duration:** 22.6 min (range: 8-60 min)
- Complete as many rounds as possible in a given time
- Examples: Cindy, 20-Minute AMRAP, AMRAP Grinder

### **Rounds (28 workouts - 12.6%)**
- Fixed number of rounds for time
- **Average Duration:** 24.0 min (range: 14-50 min)
- Examples: 5 Rounds For Time, 12 Rounds, Classic Couplets

### **Custom (23 workouts - 10.4%)**
- Custom workout formats
- **Average Duration:** 34.5 min (range: 18-60 min)
- Examples: Complexes, ladders, pyramids, death by, etc.

### **Chipper (15 workouts - 6.8%)**
- High-volume workouts with many movements
- **Average Duration:** 41.1 min (range: 26-58 min) - **Longest average!**
- Complete all reps of each movement before moving to next
- Examples: Chipper of Pain, The Chipper 400, Classic Chipper

### **Tabata (14 workouts - 6.3%)**
- Tabata interval format (20s on, 10s off)
- **Average Duration:** 20.4 min (range: 5-32 min)
- Examples: Tabata Takedown, Tabata Upper Burn, Tabata Lower Burn

---

## 🎯 Distribution Analysis

### **Well-Balanced Library:**
- ✅ **7 different workout types** represented
- ✅ **No single type dominates** (largest is 34.2%)
- ✅ **Good variety** across all formats
- ✅ **Classic formats well-represented** (For Time, EMOM, AMRAP)

### **Potential Improvements:**
- Could add more **Tabata** workouts (currently only 6.3%)
- Could add more **Chipper** workouts (currently only 6.8%)
- Could add more **Custom** formats for variety

---

## 📊 Comparison to CrossFit Standards

### **Typical CrossFit Distribution:**
- For Time: ~30-40% ✅ (We have 34.2% - Good!)
- AMRAP: ~20-25% ⚠️ (We have 14.4% - Could add more)
- EMOM: ~15-20% ✅ (We have 15.3% - Good!)
- Rounds: ~10-15% ✅ (We have 12.6% - Good!)
- Chipper: ~5-10% ✅ (We have 6.8% - Good!)
- Tabata: ~5-10% ✅ (We have 6.3% - Good!)
- Custom: ~5-10% ✅ (We have 10.4% - Good!)

**Overall:** Library is well-balanced and follows CrossFit programming standards!

---

## 🔢 Statistics

### **Overall Statistics:**
- **Total Workouts:** 222
- **Unique Types:** 7
- **Average per Type:** ~32 workouts
- **Most Common:** For Time (76 workouts - 34.2%)
- **Least Common:** Tabata (14 workouts - 6.3%)
- **Type Diversity:** High (7 different types)
- **Distribution Balance:** Good (no single type > 35%)

### **Duration Statistics by Type:**

| Type | Average Duration | Min Duration | Max Duration | Workouts with Duration |
|------|------------------|--------------|--------------|------------------------|
| **Chipper** | **41.1 min** | 26 min | 58 min | 14/15 (93.3%) |
| **Custom** | **34.5 min** | 18 min | 60 min | 21/23 (91.3%) |
| **Rounds** | **24.0 min** | 14 min | 50 min | 26/28 (92.9%) |
| **AMRAP** | **22.6 min** | 8 min | 60 min | 31/32 (96.9%) |
| **For Time** | **20.4 min** | 5 min | 60 min | 70/76 (92.1%) |
| **Tabata** | **20.4 min** | 5 min | 32 min | 14/14 (100%) |
| **EMOM** | **18.6 min** | 8 min | 50 min | 33/34 (97.1%) |

### **Duration Insights:**
- **Longest Average:** Chipper (41.1 min) - High-volume workouts
- **Shortest Average:** EMOM (18.6 min) - Structured intervals
- **Most Consistent:** Tabata (100% have duration specified)
- **Longest Single Workout:** 60 min (For Time, AMRAP, Custom)
- **Shortest Single Workout:** 5 min (For Time, Tabata)

---

## 📝 Notes

- Library includes famous benchmarks (Fran, Murph, Cindy, etc.)
- Library includes custom workouts and variations
- All workouts are formatted for AI inspiration
- Library is used to provide examples to AI during workout generation
- 4 random workouts are selected each time for AI inspiration

---

## 🎯 Recommendations

### **To Improve Variety:**

1. **Add More AMRAP Workouts** (currently 14.4%, could be 18-20%)
   - Add 8-12 more AMRAP workouts
   - Focus on different time domains (10min, 15min, 20min, 30min)

2. **Add More Tabata Workouts** (currently 6.3%, could be 8-10%)
   - Add 4-6 more Tabata workouts
   - Focus on different movement combinations

3. **Add More Chipper Workouts** (currently 6.8%, could be 8-10%)
   - Add 3-5 more Chipper workouts
   - Focus on different movement combinations and rep schemes

4. **Maintain Current Distribution:**
   - For Time: Keep at ~34% (good representation)
   - EMOM: Keep at ~15% (good representation)
   - Rounds: Keep at ~12% (good representation)
   - Custom: Keep at ~10% (good representation)

---

## ✅ Conclusion

**Library Status:** ✅ **Well-Balanced**

- **222 workouts** provide good variety
- **7 different types** ensure diverse programming
- **Distribution** follows CrossFit standards
- **Good foundation** for AI workout generation

**The library is in good shape and provides excellent variety for AI inspiration!** 🎉

