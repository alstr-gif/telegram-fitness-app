# Bulk Import Workouts Guide

This guide shows you the **most effective ways** to add 100+ workouts to your library quickly.

## 🎯 Quick Start

### Option 1: JSON Import (Recommended)

**Best for**: Structured data, easy validation, version control

1. **Prepare JSON file**:
```bash
# Use the template
cp workouts-template.json my-workouts.json
# Edit my-workouts.json with your workouts
```

2. **Import**:
```bash
ts-node src/utils/importWorkoutsFromJSON.ts my-workouts.json
```

3. **Dry run first** (test without importing):
```bash
ts-node src/utils/importWorkoutsFromJSON.ts my-workouts.json --dry-run
```

### Option 2: CSV Import

**Best for**: Spreadsheet workflows, large datasets, non-technical users

1. **Prepare CSV file**:
   - Open `workouts-template.csv` in Excel/Google Sheets
   - Add your workouts (one per row)
   - Movements and arrays should be pipe-separated (`|`)

2. **Import**:
```bash
ts-node src/utils/importWorkoutsFromCSV.ts my-workouts.csv
```

---

## 📋 JSON Format Details

### Required Fields

```json
{
  "name": "Workout Name",
  "type": "AMRAP",  // or "EMOM", "For Time", "Chipper", "Rounds", "Tabata", "Custom"
  "description": "Brief description",
  "movements": [
    "5 Pull-ups",
    "10 Push-ups",
    "15 Squats"
  ]
}
```

### Recommended Fields

```json
{
  "duration": 20,           // minutes
  "notes": "Scaling options",
  "intensity": "intermediate",  // "beginner", "intermediate", "advanced"
  "equipmentNeeded": "bodyweight",  // "bodyweight", "dumbbells", "fullgym"
  "movementDomains": ["gymnastics", "cardio"],  // array
  "tags": ["benchmark", "short"],  // array
  "rxWeight": "43/29 kg",
  "targetTime": "Sub 12 minutes",
  "isBenchmark": false,
  "isHeroWOD": false
}
```

### Auto-Inferred Fields

If you don't provide these, they'll be **automatically inferred**:

- `intensity`: Based on duration, rep counts, movement complexity
- `equipmentNeeded`: Based on movements (barbell → fullgym, KB → dumbbells, etc.)
- `movementDomains`: Based on movement types
- `tags`: Based on duration, type, and name

**Example minimal workout**:
```json
{
  "name": "Simple AMRAP",
  "type": "AMRAP",
  "duration": 15,
  "description": "15 min AMRAP",
  "movements": ["10 Push-ups", "15 Air Squats"]
}
```
All other fields will be auto-filled!

---

## 📊 CSV Format Details

### Required Columns

- `name`
- `type`
- `description`
- `movements` (pipe-separated: `Movement 1|Movement 2|Movement 3`)

### Array Columns (pipe-separated)

- `movements`: `"5 Pull-ups|10 Push-ups|15 Squats"`
- `movementDomains`: `"gymnastics|cardio"`
- `tags`: `"benchmark|short"`

### Example CSV Row

```csv
"Fran","For Time",10,"21-15-9 reps","21-15-9 Thrusters (43/29 kg)|21-15-9 Pull-ups","Scale weight","intermediate","fullgym","weightlifting|gymnastics","benchmark|short","43/29 kg","Sub 5 minutes",true,false
```

---

## 🚀 Workflow Recommendations

### For 100+ Workouts:

1. **Prepare in Spreadsheet** (Google Sheets/Excel)
   - Easy to copy/paste
   - Formulas for metadata
   - Bulk editing
   - Export as CSV

2. **Validate with Dry Run**:
   ```bash
   ts-node src/utils/importWorkoutsFromJSON.ts workouts.json --dry-run
   ```
   - Shows what will be imported
   - Highlights errors
   - No database changes

3. **Import in Batches**:
   - Split into files of 20-50 workouts
   - Import one at a time
   - Check for duplicates
   - Verify results

### Recommended Spreadsheet Setup

| Column | Description | Example |
|--------|-------------|---------|
| name | Workout name | "Fran" |
| type | Workout format | "For Time" |
| duration | Minutes | 10 |
| description | Brief description | "21-15-9 reps for time" |
| movements | Pipe-separated | "21-15-9 Thrusters\|21-15-9 Pull-ups" |
| notes | Scaling/notes | "Scale weight if needed" |
| intensity | beginner/intermediate/advanced | "intermediate" |
| equipmentNeeded | bodyweight/dumbbells/fullgym | "fullgym" |
| movementDomains | Pipe-separated | "weightlifting\|gymnastics" |
| tags | Pipe-separated | "benchmark\|short" |
| rxWeight | Prescribed weight | "43/29 kg" |
| targetTime | Target completion | "Sub 5 minutes" |
| isBenchmark | true/false | true |
| isHeroWOD | true/false | false |

**Export from spreadsheet**:
- Google Sheets: File → Download → CSV
- Excel: File → Save As → CSV UTF-8

---

## ⚡ Quick Bulk Import Script

Create a batch import script:

```bash
#!/bin/bash
# Import multiple JSON files

for file in workouts/*.json; do
  echo "Importing $file..."
  ts-node src/utils/importWorkoutsFromJSON.ts "$file"
done
```

---

## 🔍 Validation & Error Handling

The import scripts automatically:

- ✅ **Validate** all required fields
- ✅ **Check duplicates** (by name)
- ✅ **Infer missing metadata**
- ✅ **Report errors** clearly
- ✅ **Skip invalid workouts** (doesn't stop on errors)

### Example Error Output

```
⚠️  Skipped workouts: 2

Skipped workouts (with errors):
  5. "Invalid WOD": name is required
  12. "Duplicate WOD": Duplicate workout: "Fran" already exists in database

✅ Valid workouts: 98
💾 Importing 98 workouts...
```

---

## 💡 Pro Tips

### 1. Use Spreadsheet Formulas

In Google Sheets/Excel, use formulas to auto-fill:

- **Intensity formula** (based on duration):
  ```
  =IF(B2>40,"advanced",IF(B2<20,"beginner","intermediate"))
  ```

- **Equipment formula** (based on movements):
  ```
  =IF(SEARCH("barbell",E2),"fullgym",IF(SEARCH("kettlebell",E2),"dumbbells","bodyweight"))
  ```

### 2. Template Workout Library

Create common workout templates:

```json
{
  "name": "{{NAME}}",
  "type": "AMRAP",
  "duration": 20,
  "description": "20 minute AMRAP",
  "movements": ["{{MOVEMENT1}}", "{{MOVEMENT2}}", "{{MOVEMENT3}}"]
}
```

Find/replace `{{PLACEHOLDER}}` with actual values.

### 3. Split Large Files

For 100+ workouts, split into batches:

```bash
# Split JSON array into smaller files
jq -c '.[:20]' large-file.json > batch1.json
jq -c '.[20:40]' large-file.json > batch2.json
# ... etc
```

### 4. Source Your Workouts

Good sources:
- CrossFit.com main site WODs
- Your own custom workouts
- Competition workouts
- Partner/team workouts
- Hero WODs database

---

## 📈 Import Statistics

After import, you'll see:

```
✅ Successfully imported 150 workouts!

📊 Summary:
   - Benchmarks: 25
   - Hero WODs: 10
   - Beginner: 30
   - Intermediate: 80
   - Advanced: 40
   - Bodyweight: 50
   - Dumbbells: 30
   - Full Gym: 70
```

---

## 🛠️ Troubleshooting

### "Duplicate workout" errors

Solution: The script skips duplicates automatically. To override:
1. Remove duplicates from database first
2. Or rename the workout in your import file

### "Invalid type" errors

Valid types:
- `AMRAP`
- `EMOM`
- `For Time`
- `Chipper`
- `Rounds`
- `Tabata`
- `Custom`

### "File not found"

Use absolute paths or paths relative to project root:
```bash
ts-node src/utils/importWorkoutsFromJSON.ts ./my-workouts.json
```

---

## ✅ Best Practices Summary

1. **Start small**: Test with 5-10 workouts first
2. **Use dry-run**: Always test before importing
3. **Validate data**: Check JSON/CSV format before import
4. **Batch imports**: Split large files into manageable chunks
5. **Check duplicates**: Review skipped workouts
6. **Verify results**: Query database after import

---

## 📝 Quick Reference

```bash
# JSON Import
ts-node src/utils/importWorkoutsFromJSON.ts workouts.json
ts-node src/utils/importWorkoutsFromJSON.ts workouts.json --dry-run

# CSV Import
ts-node src/utils/importWorkoutsFromCSV.ts workouts.csv
ts-node src/utils/importWorkoutsFromCSV.ts workouts.csv --dry-run

# Verify imports
sqlite3 telegram_fitness.db "SELECT COUNT(*) FROM library_workouts;"
sqlite3 telegram_fitness.db "SELECT name, type FROM library_workouts ORDER BY createdAt DESC LIMIT 10;"
```

---

**The most effective way**: Use **spreadsheet → CSV export → CSV import**. It's fast, visual, and handles large datasets easily!










