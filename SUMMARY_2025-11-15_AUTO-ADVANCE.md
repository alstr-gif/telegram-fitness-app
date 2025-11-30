## Highlights (2025-11-15)

1. **Warm-up & UI polish**
   - Swapped warm-up emoji to 🏃‍♂️, removed the hero-card fire icon.
   - Loading screen redesigned to Telegram-style gradient card with spinner, user greeting, and info chips.
   - Implemented username personalization + centered “Generating” label.

2. **Bias controls**
   - Verified AMRAP bias fixes in the prompt and increased inspiration pool from 4 to 6 workouts per request.
   - Library sampler now resamples to skip Cindy-style 5-10-15 workouts.

3. **Selection flow overhaul**
   - Question buttons auto-advance after selection (no “Next” buttons).
   - Added 800 ms delay so the blue selection state is visible before moving on.
   - Gear selection now triggers generation directly with validation safeguards.

4. **Misc improvements**
   - Removed header divider on the welcome screen.
   - Documented why dynamic Telegram emoji can’t be embedded; reverted custom runner animation as requested.

Overall, the onboarding flow is faster and feels more native, while backend adjustments keep workout variety aligned with the library mix.



