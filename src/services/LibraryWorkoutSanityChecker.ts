import OpenAI from 'openai';
import { env } from '../config/env';

interface SanityCheckContext {
  request?: {
    timeChoice: string;
    trainingType: string;
    goalType: string;
    gearType: string;
    fitnessLevel?: string;
  };
}

export class LibraryWorkoutSanityChecker {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  async review(workout: any, context?: SanityCheckContext): Promise<any | null> {
    try {
      const prompt = this.buildPrompt(workout, context);

      const completion = await this.openai.chat.completions.create({
        model: env.OPENAI_MODEL,
        temperature: 0.2,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are an experienced CrossFit coach and quality reviewer. Your role is to sanity-check existing workouts for clarity, consistency with CrossFit methodology, and formatting rules.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        return null;
      }

      let cleanContent = responseContent.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      const parsed = JSON.parse(cleanContent);

      if (!parsed?.blocks || !Array.isArray(parsed.blocks)) {
        return null;
      }

      return parsed;
    } catch (error) {
      console.error('Library workout sanity check failed:', error);
      return null;
    }
  }

  private buildPrompt(workout: any, context?: SanityCheckContext): string {
    const requestInfo = context?.request
      ? `
Current user preferences (for context, do not drastically change movements):
- Time Choice: ${context.request.timeChoice}
- Training Type: ${context.request.trainingType}
- Goal Type: ${context.request.goalType}
- Gear Type: ${context.request.gearType}
${context.request.fitnessLevel ? `- Fitness Level: ${context.request.fitnessLevel}` : ''}`
      : '';

    return `You will receive a CrossFit session already structured as JSON with four blocks (warm-up, skill, wod, cool-down).

Your job:
1. Validate clarity, formatting, and methodology.
2. Make only minimal adjustments needed to fix inconsistencies (e.g., duplicated reps, missing AMRAP time, @ bodyweight on monostructural, scaling outside WOD, unclear descriptions).
3. Keep the identity and intent of the workout. Do NOT invent new movements unless necessary to fix a clear problem.
4. Ensure total duration is 60 minutes (10 warm-up, 10-25 skill depending on WOD duration, WOD aligned with user's time choice, 10 cool-down).
5. Make sure WOD description starts with explicit format (e.g., "20 min AMRAP", "For Time:", "5 Rounds For Time:") and matches the block data.
6. Warm-up and cool-down movements should be listed with one movement per line, no scaling/form cues there.
7. Only the WOD block can include scaling instructions. If instructions exist elsewhere, move them or remove appropriately.
8. Remove "@ bodyweight" from mono-structural movements (run/row/bike/ski erg/echo bike) and ensure those movements include distance or calories.
9. Deduplicate repetitions in movement names (e.g., avoid "20 reps 20 Burpees").
10. Maintain consistent CrossFit terminology and keep intensity/volume appropriate.

${requestInfo}

Return a JSON object with the same schema you received (name, description, duration, focus, blocks with blockType/blockName/duration/exercises). If the workout is already good, return it unchanged.

Here is the existing workout JSON:

${JSON.stringify(workout, null, 2)}`;
  }
}


