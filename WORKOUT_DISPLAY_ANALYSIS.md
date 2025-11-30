# Workout Display Analysis

This document breaks down how each workout block type is displayed in the app, based on the code in `fitness-frontend/src/pages/WorkoutGeneration.tsx`.

## Overview

The workout is structured with blocks of type: `'warm-up' | 'skill' | 'wod' | 'cooldown'`. Each block is rendered with distinct styling, icons, and content presentation.

---

## 1. WARM-UP BLOCK (`'warm-up'`)

### Visual Identity
- **Icon**: 🔥 (line 732)
- **Colors** (lines 748-753):
  - Background: `withAlpha(accent, 0.12)` - Light accent color at 12% opacity
  - Border: `withAlpha(accent, 0.35)` - Accent color at 35% opacity
  - Text: `accentDark` - Dark variant of accent color

### Block Structure (lines 952-1097)
1. **Header Section** (lines 962-993):
   - Icon (🔥) at 32px size
   - Block name (`block.blockName`) as heading
   - Duration badge showing `{block.duration} min` in a rounded pill
   - Border separator below header

2. **Description** (lines 1012-1024):
   - If `block.description` exists:
     - Background: `withAlpha(colors.border, 0.15)`
     - Padding: `12px`
     - Border radius: `8px`
     - Font size: `14px`
     - Line height: `1.5`
     - Displays full description text

3. **Exercises List** (lines 1026-1096):
   - Container background: `withAlpha(textColor, 0.08)` (lighter background)
   - Padding: `16px`
   - Border radius: `12px`
   - Each exercise displays:
     - **Main line** (line 1065): Exercise name with reps/weight formatted
     - **Description** (lines 1068-1072): Only shown if `block.blockType !== 'wod'` and `exercise.description` exists
       - Font size: `12px`
       - Color: `mutedColor`
     - **Instructions**: NOT shown for warm-up blocks (only for WOD blocks)

### Exercise Formatting (lines 1034-1059)
- Uses `formatExerciseWithReps()` helper to format exercise name with reps
- Adds sets/reps pattern if available: `{sets}x{reps}`
- Adds duration if present: `{duration}s`
- Adds weight if available: `@ {weight}kg` (or as-is if already includes 'kg')
- Skips weight for monostructural movements (run, row, bike) when weight is "bodyweight"

---

## 2. STRENGTH/SKILL BLOCK (`'skill'`)

### Visual Identity
- **Icon**: 🎯 (line 733)
- **Colors** (lines 754-755):
  - Uses **neutral** colors (same as default):
    - Background: `withAlpha(textColor, 0.05)` - Very subtle background
    - Border: `withAlpha(textColor, 0.12)` - Subtle border
    - Text: `textColor` - Standard text color

### Block Structure
1. **Header Section** (same as warm-up):
   - Icon (🎯) at 32px size
   - Block name (`block.blockName`)
   - Duration badge: `{block.duration} min`
   - Border separator

2. **Description** (lines 1012-1024):
   - Same styling as warm-up block
   - Background: `withAlpha(colors.border, 0.15)`
   - Displays `block.description` if available

3. **Exercises List**:
   - Container background: `withAlpha(textColor, 0.08)` (same as warm-up)
   - Same exercise formatting as warm-up
   - **Key difference**: Shows `exercise.description` (lines 1068-1072) since `block.blockType !== 'wod'`
   - **Does NOT show** detailed instructions with RX/Scaled/Beginner breakdowns (only WOD blocks show this)

### Exercise Display
- Exercise name with reps/weight
- Exercise description (if available)
- No scaling instructions (RX/Scaled/Beginner)

---

## 3. MAIN WORKOUT (WOD) BLOCK (`'wod'`)

### Visual Identity
- **Icon**: 💪 (line 734)
- **Colors** (lines 756-761):
  - Background: `withAlpha(accent, 0.2)` - Stronger accent color at 20% opacity
  - Border: `accent` - Full accent color (most prominent border)
  - Text: `accentDark` - Dark variant of accent color

### Block Structure
1. **Header Section** (lines 962-993):
   - Icon (💪) at 32px size
   - Block name (`block.blockName`)
   - **WOD Format** (lines 976-980): Special display if `block.wodFormat` exists
     - Font size: `13px`
     - Color: `mutedColor`
     - Format: `Format: {block.wodFormat}`
     - Font weight: `600`
   - Duration badge: `{block.duration} min`

2. **Description** (lines 995-1011):
   - **Special formatting for WOD blocks**:
     - Background: `withAlpha(colors.border, 0.18)` - Slightly stronger than other blocks
     - Padding: `12px 14px`
     - Border radius: `10px`
     - Font size: `14px`
     - Font weight: `600` (bold)
     - Line height: `1.5`
     - **Multi-line support**: Splits description by `\n` and displays each line
     - First line gets `8px` bottom margin, subsequent lines get `4px`

3. **Exercises List** (lines 1026-1096):
   - **Container background**: `surface` (different from other blocks - uses full surface color)
   - Padding: `16px`
   - Border radius: `12px`
   - Each exercise displays:
     - **Main line** (line 1065): Exercise name with reps/weight formatted
     - **Instructions with Scaling** (lines 1073-1085): **UNIQUE TO WOD BLOCKS**
       - Only shown if `block.blockType === 'wod'` and `exercise.instructions` exists
       - Parses instructions to extract RX/Scaled/Beginner versions
       - Displays each version with:
         - Version label (RX/Scaled/Beginner) in bold with `accentDark` color
         - Content after the label
       - Font size: `12px`
       - Color: `mutedColor`
     - **Description** (lines 1086-1090): Shows `exercise.description` if available
       - Font size: `12px`
       - Color: `mutedColor`

### Exercise Formatting
- Same as other blocks (name, reps, weight, duration)
- **Additional**: Shows detailed scaling instructions (RX/Scaled/Beginner) parsed from `exercise.instructions`

### Special WOD Features
- **WOD Tagline** (lines 783-794): Extracted and displayed in the workout header
  - Combines duration and format (e.g., "25 min AMRAP")
  - Normalizes format strings (For Time, AMRAP, EMOM)
- **Instructions Parsing** (lines 914-944): Extracts scaling options from exercise instructions
  - Looks for "RX:", "Scaled:", "Beginner:" patterns
  - Creates structured display of each version

---

## 4. COOLDOWN BLOCK (`'cooldown'`)

### Visual Identity
- **Icon**: 🧘 (line 735)
- **Colors** (lines 762-767):
  - Background: `withAlpha(accent, 0.1)` - Light accent at 10% opacity
  - Border: `withAlpha(accent, 0.3)` - Accent color at 30% opacity
  - Text: `accentDark` - Dark variant of accent color

### Block Structure
1. **Header Section** (same as other blocks):
   - Icon (🧘) at 32px size
   - Block name (`block.blockName`)
   - Duration badge: `{block.duration} min`
   - Border separator

2. **Description** (lines 1012-1024):
   - Same styling as warm-up/skill blocks
   - Background: `withAlpha(colors.border, 0.15)`
   - Displays `block.description` if available

3. **Exercises List**:
   - Container background: `withAlpha(textColor, 0.08)` (same as warm-up/skill)
   - Same exercise formatting as warm-up/skill
   - Shows `exercise.description` (since `block.blockType !== 'wod'`)
   - **Does NOT show** detailed instructions with scaling

### Exercise Display
- Exercise name with reps/weight
- Exercise description (if available)
- No scaling instructions

---

## Common Block Container Styling

All blocks share the same outer container (lines 952-961):
```tsx
{
  backgroundColor: withAlpha(colors.bg, 0.4),
  border: `2px solid ${withAlpha(colors.border, 0.5)}`,
  borderRadius: '16px',
  padding: '24px',
  boxShadow: '0 6px 18px rgba(0, 0, 0, 0.12)',
}
```

## Key Differences Summary

| Feature | Warm-up | Skill | WOD | Cooldown |
|---------|---------|-------|-----|----------|
| **Icon** | 🔥 | 🎯 | 💪 | 🧘 |
| **Border Opacity** | 35% | 12% | 100% | 30% |
| **Background Opacity** | 12% | 5% | 20% | 10% |
| **Exercise Container BG** | Light (8%) | Light (8%) | Surface | Light (8%) |
| **Shows WOD Format** | ❌ | ❌ | ✅ | ❌ |
| **Shows Scaling Instructions** | ❌ | ❌ | ✅ | ❌ |
| **Shows Exercise Description** | ✅ | ✅ | ✅ | ✅ |
| **Description Font Weight** | Normal | Normal | **Bold (600)** | Normal |
| **Multi-line Description** | Single | Single | **Multi-line** | Single |

## Code References

- Block rendering: `fitness-frontend/src/pages/WorkoutGeneration.tsx` lines 909-1100
- Icon mapping: lines 730-738
- Color mapping: lines 740-771
- Exercise formatting: lines 1033-1093
- Instructions parsing: lines 914-944
- WOD description formatting: lines 995-1011




