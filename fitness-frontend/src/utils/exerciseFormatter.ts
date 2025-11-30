/**
 * Exercise Data Formatting Utility
 * 
 * Provides structured formatting for exercise data to improve
 * maintainability and type safety.
 */

export interface ExerciseDetail {
  label: string;
  value: string;
}

export interface FormattedExercise {
  name: string;
  displayName: string;
  details: ExerciseDetail[];
  description?: string;
  instructions?: string;
  hasWeight: boolean;
  hasScaling: boolean;
}

/**
 * Formats exercise name with reps, removing duplicates
 * Prevents showing "50 reps 50 Box Jumps" -> should show just "50 Box Jumps"
 */
const formatExerciseWithReps = (name: string, reps?: string | number | null): string => {
  if (!reps) return name;
  
  const repsStr = String(reps).trim();
  const repsNum = parseInt(repsStr, 10);
  
  // If reps is not a valid number, just add it as-is
  if (isNaN(repsNum)) {
    const nameLower = name.toLowerCase();
    const repsLower = repsStr.toLowerCase();
    if (nameLower.includes(repsLower)) {
      return name;
    }
    return `${repsStr} ${name}`;
  }
  
  // Check if name starts with the same number as reps
  const nameMatch = name.match(/^(\d+)/);
  
  if (nameMatch) {
    const nameNumber = parseInt(nameMatch[1], 10);
    if (nameNumber === repsNum) {
      return name;
    }
  }
  
  // Check if reps appears anywhere in the name as a word boundary
  const nameLower = name.toLowerCase();
  const repsLower = repsStr.toLowerCase();
  const escapedReps = repsLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const repsRegex = new RegExp(`\\b${escapedReps}\\b`, 'i');
  
  if (repsRegex.test(nameLower)) {
    return name;
  }
  
  return `${repsStr} ${name}`;
};

/**
 * Checks if an exercise is monostructural (run, row, bike, etc.)
 */
const isMonoStructural = (name: string): boolean => {
  const lower = name.toLowerCase();
  return lower.includes('run') || 
         lower.includes('row') || 
         lower.includes('bike erg') || 
         lower.includes('ski erg') || 
         lower.includes('assault bike') || 
         lower.includes('echo bike');
};

/**
 * Extracts RX weight from instructions string
 */
const extractRxWeight = (instructions?: string): string | null => {
  if (!instructions) return null;
  const match = instructions.match(/RX\s*[:\-]\s*([^\.\n]+)/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
};

/**
 * Formats an exercise into a structured format
 */
export const formatExercise = (exercise: any): FormattedExercise => {
  const displayName = formatExerciseWithReps(exercise.name, exercise.reps);
  const details: ExerciseDetail[] = [];
  
  // Handle sets and reps
  if (exercise.sets && exercise.reps) {
    details.push({ 
      label: 'Sets × Reps', 
      value: `${exercise.sets} × ${exercise.reps}` 
    });
  } else if (exercise.reps && !displayName.toLowerCase().includes(String(exercise.reps).toLowerCase())) {
    details.push({ 
      label: 'Reps', 
      value: String(exercise.reps) 
    });
  }
  
  // Handle duration
  if (exercise.duration) {
    details.push({ 
      label: 'Duration', 
      value: `${exercise.duration}s` 
    });
  }
  
  // Handle weight
  const weightStr = exercise.weight ? String(exercise.weight) : null;
  const rxFromInstructions = extractRxWeight(exercise.instructions);
  const shouldSkipWeight = weightStr && weightStr.toLowerCase() === 'bodyweight' && isMonoStructural(exercise.name);
  
  if (!shouldSkipWeight) {
    if (weightStr) {
      const weightDisplay = weightStr.includes('kg') || isNaN(Number(weightStr)) 
        ? weightStr 
        : `${weightStr}kg`;
      details.push({ 
        label: 'Weight', 
        value: weightDisplay 
      });
    } else if (rxFromInstructions) {
      details.push({ 
        label: 'Weight', 
        value: rxFromInstructions 
      });
    }
  }
  
  return {
    name: exercise.name,
    displayName,
    details,
    description: exercise.description,
    instructions: exercise.instructions,
    hasWeight: !!(weightStr || rxFromInstructions) && !shouldSkipWeight,
    hasScaling: !!(exercise.instructions && (
      /RX\s*[:\s]/i.test(exercise.instructions) ||
      /Scaled\s*[:\s]/i.test(exercise.instructions) ||
      /Beginner\s*[:\s]/i.test(exercise.instructions)
    )),
  };
};




