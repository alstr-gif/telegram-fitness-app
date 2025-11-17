/**
 * Bulk Import Workouts from CSV File
 * 
 * Usage:
 *   ts-node src/utils/importWorkoutsFromCSV.ts path/to/workouts.csv
 * 
 * CSV Format (with headers):
 * name,type,duration,description,movements,notes,intensity,equipmentNeeded,movementDomains,tags,rxWeight,targetTime,isBenchmark,isHeroWOD
 * 
 * Movements should be pipe-separated (|) in the CSV
 * Arrays (movementDomains, tags) should be pipe-separated (|)
 * 
 * Example CSV row:
 * "Fran","For Time",10,"21-15-9 reps","21-15-9 Thrusters (43/29 kg)|21-15-9 Pull-ups","Scale weight","intermediate","fullgym","weightlifting|gymnastics","benchmark|short","43/29 kg","Sub 5 minutes",true,false
 */

import * as fs from 'fs';
import * as path from 'path';
import { AppDataSource } from '../config/database';
import { LibraryWorkoutService } from '../services/LibraryWorkoutService';
import { LibraryWorkout, IntensityLevel, EquipmentNeeded, WorkoutType } from '../entities/LibraryWorkout';
import { importWorkoutsFromJSON } from './importWorkoutsFromJSON';

/**
 * Parse CSV line (handles quoted values with commas)
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current); // Last field

  return values.map(v => v.trim().replace(/^"|"$/g, ''));
}

/**
 * Convert CSV row to workout JSON
 */
function csvRowToWorkout(headers: string[], row: string[]): any {
  const workout: any = {};

  headers.forEach((header, index) => {
    const value = row[index]?.trim();
    if (!value || value === '') return;

    switch (header.toLowerCase()) {
      case 'name':
        workout.name = value;
        break;
      case 'type':
        workout.type = value;
        break;
      case 'duration':
        workout.duration = parseInt(value) || undefined;
        break;
      case 'description':
        workout.description = value;
        break;
      case 'movements':
        workout.movements = value.split('|').map(m => m.trim()).filter(m => m);
        break;
      case 'notes':
        workout.notes = value;
        break;
      case 'intensity':
        workout.intensity = value;
        break;
      case 'equipmentneeded':
        workout.equipmentNeeded = value;
        break;
      case 'movementdomains':
        workout.movementDomains = value.split('|').map(d => d.trim()).filter(d => d);
        break;
      case 'tags':
        workout.tags = value.split('|').map(t => t.trim()).filter(t => t);
        break;
      case 'rxweight':
        workout.rxWeight = value;
        break;
      case 'targettime':
        workout.targetTime = value;
        break;
      case 'isbenchmark':
        workout.isBenchmark = value.toLowerCase() === 'true' || value === '1';
        break;
      case 'isherowod':
        workout.isHeroWOD = value.toLowerCase() === 'true' || value === '1';
        break;
    }
  });

  return workout;
}

/**
 * Main import function
 */
async function importWorkoutsFromCSV(filePath: string, dryRun: boolean = false) {
  console.log('🚀 Starting bulk workout import from CSV...\n');

  try {
    // Read CSV file
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${fullPath}`);
    }

    console.log(`📖 Reading CSV file: ${fullPath}\n`);
    const fileContent = fs.readFileSync(fullPath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');

    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row');
    }

    // Parse headers
    const headers = parseCSVLine(lines[0]);
    console.log(`📋 CSV Headers: ${headers.join(', ')}\n`);

    // Convert CSV rows to JSON format
    const workouts: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      if (row.length !== headers.length) {
        console.warn(`⚠️  Row ${i + 1} has ${row.length} columns, expected ${headers.length}. Skipping...`);
        continue;
      }

      const workout = csvRowToWorkout(headers, row);
      if (workout.name) {
        workouts.push(workout);
      }
    }

    console.log(`📝 Converted ${workouts.length} CSV rows to workouts\n`);

    // Use JSON import function (convert to JSON first)
    const tempJsonPath = path.join(path.dirname(fullPath), '.temp_workouts.json');
    fs.writeFileSync(tempJsonPath, JSON.stringify(workouts, null, 2));

    try {
      await importWorkoutsFromJSON(tempJsonPath, dryRun);
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempJsonPath)) {
        fs.unlinkSync(tempJsonPath);
      }
    }

  } catch (error) {
    console.error('❌ CSV import failed:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: ts-node src/utils/importWorkoutsFromCSV.ts <csv-file> [--dry-run]');
    console.log('\nExample:');
    console.log('  ts-node src/utils/importWorkoutsFromCSV.ts workouts.csv');
    console.log('  ts-node src/utils/importWorkoutsFromCSV.ts workouts.csv --dry-run');
    console.log('\nCSV Format:');
    console.log('  Header row with: name,type,duration,description,movements,notes,intensity,equipmentNeeded,movementDomains,tags,rxWeight,targetTime,isBenchmark,isHeroWOD');
    console.log('  Movements and arrays should be pipe-separated (|)');
    process.exit(1);
  }

  const filePath = args[0];
  const dryRun = args.includes('--dry-run');

  importWorkoutsFromCSV(filePath, dryRun)
    .then(() => {
      console.log('\n✅ CSV import script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ CSV import script failed:', error);
      process.exit(1);
    });
}

export { importWorkoutsFromCSV };










