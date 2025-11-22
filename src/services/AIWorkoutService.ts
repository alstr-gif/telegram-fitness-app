import OpenAI from 'openai';
import { env } from '../config/env';
import { FitnessLevel, FitnessGoal } from '../entities/User';
import { LibraryWorkoutService } from './LibraryWorkoutService';

export interface WorkoutGenerationRequest {
  fitnessLevel: FitnessLevel;
  primaryGoal: FitnessGoal;
  preferredDays: string[];
  duration: number;
  availableEquipment?: string[];
  injuries?: string;
  weeksCount?: number;
}

export interface GeneratedExercise {
  name: string;
  description: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'balance';
  sets?: number;
  reps?: number;
  duration?: number;
  weight?: number;
  restTime?: number;
  instructions: string;
  muscleGroups: string[];
  order: number;
}

export interface GeneratedWorkout {
  name: string;
  description: string;
  dayOfWeek: string;
  duration: number;
  focus: string;
  exercises: GeneratedExercise[];
}

export interface GeneratedWorkoutPlan {
  name: string;
  description: string;
  workouts: GeneratedWorkout[];
  totalWeeks: number;
}

export class AIWorkoutService {
  private openai: OpenAI;
  private libraryService: LibraryWorkoutService;

  constructor() {
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
    this.libraryService = new LibraryWorkoutService();
  }

  /**
   * Check if the model supports response_format json_object
   * Only newer GPT-4 models reliably support it
   * For safety, we'll parse JSON from text response instead
   */
  private supportsJsonObjectFormat(model: string): boolean {
    // Disable json_object format for now - parse from text instead
    // This works reliably across all models
    return false;
  }

  async generateWorkoutPlan(
    request: WorkoutGenerationRequest
  ): Promise<GeneratedWorkoutPlan> {
    try {
      // Get library workouts for AI inspiration
      const libraryExamples = await this.libraryService.getFormattedForAI(6);
      const prompt = this.buildPrompt(request, libraryExamples);
      
      const completionConfig: any = {
        model: env.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert CrossFit coach and functional fitness trainer specializing in high-intensity, varied workouts.

Your expertise includes:
- Creating challenging CrossFit-style WODs (Workout of the Day)
- Combining gymnastics, weightlifting, and metabolic conditioning
- Designing AMRAPs, EMOMs, For Time workouts, and Chipper-style programming
- Mixing different movement patterns and energy systems
- Scaling workouts appropriately for different fitness levels
- Ensuring proper warm-up and cool-down sequences

Always create intense, varied, and fun workouts that challenge athletes while keeping them safe.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 4000,
      };

      // Only add response_format if model supports it
      if (this.supportsJsonObjectFormat(env.OPENAI_MODEL)) {
        completionConfig.response_format = { type: 'json_object' };
      }

      const completion = await this.openai.chat.completions.create(completionConfig);

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response from OpenAI');
      }

      const workoutPlan = this.parseAIResponse(responseContent);
      return workoutPlan;
    } catch (error: any) {
      console.error('Error generating workout plan with AI:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(error.message || 'Failed to generate workout plan');
    }
  }

  private buildPrompt(request: WorkoutGenerationRequest, libraryExamples?: string): string {
    const {
      fitnessLevel,
      primaryGoal,
      preferredDays,
      duration,
      availableEquipment,
      injuries,
      weeksCount = 2,
    } = request;

    return `Create a CrossFit-style ${weeksCount}-week workout plan with high-intensity, varied programming:

**User Profile:**
- Fitness Level: ${fitnessLevel}
- Primary Goal: ${primaryGoal}
- Preferred Workout Days: ${preferredDays.join(', ')}
- Workout Duration: ${duration} minutes per session
- Available Equipment: ${availableEquipment?.join(', ') || 'bodyweight only'}
${injuries ? `- Injuries/Limitations: ${injuries}` : ''}

**Requirements:**
1. Create CrossFit-style WODs ONLY for these days: ${preferredDays.join(', ')}
2. Each workout should be approximately ${duration} minutes total
3. Include ${weeksCount} weeks of varied programming (${preferredDays.length} workouts per week)
4. Use CrossFit methodology: constantly varied, high-intensity, functional movements
5. Mix movement domains in each workout:
   - Gymnastics (pull-ups, push-ups, handstands, muscle-ups, etc.)
   - Weightlifting (squats, deadlifts, cleans, snatches, presses)
   - Metabolic conditioning (rowing, running, burpees, box jumps, double-unders)
6. Vary workout formats:
   - AMRAP (As Many Rounds As Possible) - e.g., "20 min AMRAP of: 10 wall balls, 8 KB swings, 6 box jumps"
   - EMOM (Every Minute On the Minute) - e.g., "12 min EMOM: 10 wall balls + 8 KB swings"
   - For Time - e.g., "For Time: 21-15-9 reps of thrusters and pull-ups"
   - Chipper - e.g., "For Time: 50-40-30-20-10 of different movements"
   - Rounds for Time - e.g., "5 Rounds For Time: 400m run, 15 burpees, 20 sit-ups"
7. Each workout should have 6-12 exercises/movements
8. Include proper warm-up (5-10 movements) and cool-down/stretching
9. Specify intensity, rounds, time domains, and scaling options
10. Focus on functional fitness and the user's goal: ${primaryGoal}
11. Use proper CrossFit terminology and rep schemes

**CrossFit WOD Examples for Inspiration:**

${libraryExamples || 'Use standard CrossFit formats: AMRAP, EMOM, For Time, Chipper, Rounds'}

**Additional WOD Styles to Consider:**
- Named benchmarks (Fran, Helen, Diane)
- Hero WODs (Murph, DT)
- Strength + MetCon combinations
- Olympic lifting complexes
- Bodyweight AMRAPs

**Output Format (MUST be valid JSON):**
{
  "name": "Plan name based on goal",
  "description": "Brief description of the plan approach",
  "totalWeeks": ${weeksCount},
  "workouts": [
    {
      "name": "WOD name (e.g., 'Fran', 'Helen', or descriptive like 'Metcon Mayhem')",
      "description": "Workout structure and format (AMRAP/EMOM/For Time/Rounds)",
      "dayOfWeek": "monday/tuesday/etc (lowercase)",
      "duration": ${duration},
      "focus": "Movement domain mix (e.g., 'Gymnastics + MetCon', 'Weightlifting + Cardio')",
      "exercises": [
        {
          "name": "Movement name (CrossFit terminology preferred)",
          "description": "What it is and what it targets",
          "type": "strength/cardio/flexibility/balance",
          "sets": null,
          "reps": "Use varied rep schemes: 21-15-9, 10-8-6, max reps, etc.",
          "duration": "For timed movements (e.g., 200m run, 1 min plank)",
          "weight": "Specify if applicable (e.g., 43/29 kg, bodyweight, etc.)",
          "restTime": "Minimal rest in CrossFit - specify if needed",
          "instructions": "Detailed form cues, scaling options, and safety notes",
          "muscleGroups": ["full body preferred", "multiple groups"],
          "order": 1
        }
      ]
    }
  ]
}

**IMPORTANT WORKOUT DESIGN GUIDELINES:**
- Create workouts with 8-15 movements combining different domains
- Use varied rep schemes (not just 3x10): 21-15-9, 5x5, AMRAP, EMOM, etc.
- Include complex movements: thrusters, burpees, wall balls, box jumps, KB swings
- Mix high-skill and low-skill movements
- Alternate pulling/pushing, upper/lower body
- Include a "buy-in" and "cash-out" when appropriate
- Warm-up should prepare for specific movements in WOD
- Cool-down should include stretching for worked muscles
- **ALWAYS use KILOGRAMS (kg) for weights, NOT pounds**
- Use metric: kg for weights, cm for heights, meters for distances

Example workout structure:
Warm-up (5-10 min): Dynamic stretches, movement prep
Main WOD (${duration - 15} min): Complex, varied, intense
Cool-down (5-10 min): Static stretching, mobility

Generate creative, challenging, and FUN CrossFit-style workouts!

Generate a comprehensive, safe, and effective workout plan following these specifications exactly.`;
  }

  private parseAIResponse(content: string): GeneratedWorkoutPlan {
    try {
      console.log('=== AI Response (first 500 chars) ===');
      console.log(content.substring(0, 500));
      console.log('=== End AI Response Preview ===');

      // Clean up any markdown formatting
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      console.log('Attempting to parse JSON...');
      const parsed = JSON.parse(cleanContent);
      console.log('JSON parsed successfully!');
      console.log('Parsed structure:', { 
        hasName: !!parsed.name, 
        hasWorkouts: !!parsed.workouts, 
        workoutsCount: parsed.workouts?.length 
      });

      // Validate the structure
      if (!parsed.name || !parsed.workouts || !Array.isArray(parsed.workouts)) {
        console.error('Invalid structure:', {
          name: parsed.name,
          workoutsIsArray: Array.isArray(parsed.workouts),
          workoutsLength: parsed.workouts?.length
        });
        throw new Error('Invalid workout plan structure');
      }

      return {
        name: parsed.name,
        description: parsed.description || '',
        workouts: parsed.workouts,
        totalWeeks: parsed.totalWeeks || 2,
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.error('Raw content (full):', content);
      throw new Error('Failed to parse AI workout plan');
    }
  }
}

