# AMRAP Bias Analysis

## Problem
The AI is generating AMRAP workouts more frequently than expected, despite AMRAP being only **10.7%** of the library (31 workouts), while:
- **EMOM** is **35.7%** (104 workouts) - Most common
- **For Time** is **26.1%** (76 workouts) - Second most common
- **AMRAP** is **10.7%** (31 workouts) - Third most common

## Root Causes Found

### 1. **Format List Ordering** (Line 1053-1058)
AMRAP is listed **FIRST** in the format options, making it more prominent:
```
1. **Use WOD Formats** - Choose one:
   - AMRAP: ALWAYS use... (FIRST!)
   - EMOM: ALWAYS use...
   - For Time: ...
   - Chipper: ...
   - Rounds: ...
```

**Fix:** Reorder to match library distribution: EMOM → For Time → AMRAP → Rounds → Custom → Chipper → Tabata

### 2. **Time-Based Logic Defaults to AMRAP** (Lines 943-957)
All three time choices suggest AMRAP as the primary option:
- **Quick** (line 944): "Format: For Time (like Fran: 21-15-9) OR short AMRAP"
- **Classic** (line 949): "Format: AMRAP (${time.wodDuration} min) OR Rounds For Time"
- **Long** (line 954): "Format: Chipper OR high-volume Rounds OR AMRAP"

**Fix:** Update to reflect library distribution and not default to AMRAP

### 3. **Example Over-Representation** (Multiple locations)
AMRAP examples appear more frequently than other formats:
- Line 947: Quick workout example uses AMRAP
- Line 951: Classic workout example uses AMRAP  
- Line 956: Long workout example uses AMRAP
- Line 1175-1176: Two AMRAP examples in "EXAMPLES OF GOOD DESCRIPTIONS"
- Line 1180: Another AMRAP example
- Line 1185: Warm-up example uses AMRAP format

**Fix:** Balance examples to match library distribution (more EMOM and For Time examples)

### 4. **Name Example Bias** (Line 1089)
Example name includes "AMRAP Mayhem":
```
"name": "WOD name (e.g., 'Fran-Style Burner', 'AMRAP Mayhem', 'Hero WOD: The Grinder')"
```

**Fix:** Remove AMRAP from name examples or balance with other formats

### 5. **Multiple Explicit AMRAP Instructions**
The prompt has many explicit instructions about AMRAP format (lines 960, 964, 1060, 1130, 1194), making it more prominent than other formats.

**Fix:** Balance instructions across all formats

## Recommended Fixes

1. **Reorder format list** to match library distribution
2. **Update time-based logic** to not default to AMRAP
3. **Balance examples** - More EMOM and For Time examples
4. **Remove AMRAP from name examples** or balance with other formats
5. **Add explicit instruction** to match library distribution when selecting format




