# 🤖 Telegram Bot User Guide

## Overview

The Telegram Fitness Bot provides a complete interactive experience for setting up your fitness profile and generating personalized AI-powered workout plans.

---

## Getting Started

### 1. Find Your Bot

Search for your bot in Telegram using the username you set with @BotFather.

### 2. Start the Bot

Click **START** or send `/start`

You'll see a welcome message with quick action buttons:
- ⚙️ Setup Profile
- 💪 Generate Workout Plan
- 📅 My Workouts

---

## Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `/start` | Start the bot and show main menu | Always available |
| `/setup` | Configure your fitness profile | Use when first starting or to update profile |
| `/generate` | Generate a new AI workout plan | Requires completed profile |
| `/workouts` | View your upcoming workouts | Shows next 7 workouts |
| `/help` | Show command help | Shows all available commands |

---

## Profile Setup Wizard

### Complete 6-Step Interactive Setup

The `/setup` command launches an interactive wizard that guides you through:

#### Step 1: Fitness Level 💪

**Question:** "What's your current fitness level?"

**Options:**
- 🟢 **Beginner** - New to working out or returning after a long break
- 🟡 **Intermediate** - Regular exercise routine for 6+ months
- 🔴 **Advanced** - Experienced athlete or training for years

**How it works:**
- Click your fitness level
- Selection is confirmed
- Automatically proceeds to next step

---

#### Step 2: Primary Goal 🎯

**Question:** "What's your primary fitness goal?"

**Options:**
- 🔥 **Lose Weight** - Focus on calorie burn and fat loss
- 💪 **Build Muscle** - Hypertrophy and strength training
- 🏃 **Increase Endurance** - Cardio and stamina improvement
- ⚡ **Strength Training** - Maximum strength development
- 🎯 **General Fitness** - Balanced overall health

**How it works:**
- Click your primary goal
- Selection is confirmed
- Proceeds to workout days selection

---

#### Step 3: Workout Days 📅

**Question:** "Which days would you like to work out?"

**Options:**
- 📅 Monday
- 📅 Tuesday
- 📅 Wednesday
- 📅 Thursday
- 📅 Friday
- 📅 Saturday
- 📅 Sunday
- ✅ Done

**How it works:**
- Click to toggle days (you can select multiple)
- Each selection shows current selected days
- Click **Done** when finished
- Must select at least one day

**Example:**
```
Selected days: Monday, Wednesday, Friday
```

---

#### Step 4: Session Duration ⏱️

**Question:** "How long do you want each workout to be?"

**Options:**
- ⏱️ **20 minutes** - Quick, efficient workouts
- ⏱️ **30 minutes** - Standard session length
- ⏱️ **45 minutes** - Comprehensive workout
- ⏱️ **60 minutes** - Full hour training
- ⏱️ **90 minutes** - Extended session

**How it works:**
- Click your preferred duration
- Selection is confirmed
- Proceeds to equipment selection

---

#### Step 5: Available Equipment 🏋️

**Question:** "What equipment do you have available?"

**Options:**
- 🏋️ **Dumbbells**
- 🏋️ **Barbell**
- 🎽 **Resistance Bands**
- 🏃 **Treadmill**
- 🚴 **Stationary Bike**
- 💺 **Bench**
- 🤸 **Pull-up Bar**
- ⭕ **Kettlebell**
- 🚫 **No Equipment** (bodyweight only)
- ✅ Done

**How it works:**
- Click to toggle equipment (multiple selections allowed)
- Each selection shows current equipment list
- Selecting "No Equipment" clears all other selections
- Click **Done** when finished
- If nothing selected, defaults to bodyweight exercises

**Example:**
```
Selected equipment: dumbbells, bench, resistance_bands
```

---

#### Step 6: Injuries or Limitations 🏥

**Question:** "Do you have any injuries or limitations?"

**Options:**
- ✅ **No injuries** - I'm all clear
- ⏭️ **Skip this step** - Don't specify

**Or Type Your Answer:**
- Send a text message with your injuries/limitations
- Example: "Lower back pain, no jumping exercises"

**How it works:**
- Click "No injuries" if you're injury-free
- Click "Skip" if you prefer not to specify
- Or type details of any injuries or limitations
- Information helps AI avoid problematic exercises

---

### Profile Completion

After completing all 6 steps, you'll see a summary:

```
🎉 Profile setup complete!

📋 Your Profile:
• Fitness Level: intermediate
• Goal: build_muscle
• Workout Days: monday, wednesday, friday
• Duration: 45 minutes
• Equipment: dumbbells, bench, resistance_bands
• Injuries: None

You can now generate your personalized workout plan!
Use /generate to get started.
```

**Button:** 💪 Generate Workout Plan

---

## Generating Workout Plans

### Prerequisites

✅ Complete profile setup (all 6 steps)

### How to Generate

1. Send `/generate` command
2. Or click "Generate Workout Plan" button

### Generation Process

```
🤖 Generating your personalized workout plan...

This may take a moment.
```

**What happens:**
- AI analyzes your profile
- Creates 2-week progressive plan
- Schedules workouts on your preferred days
- Tailors exercises to your equipment
- Adjusts difficulty to your fitness level
- Considers your goals and injuries

### Plan Confirmation

```
✅ Your workout plan is ready!

📋 **4-Week Muscle Building Program**
Progressive strength training plan designed for intermediate 
lifters focusing on hypertrophy and muscle growth.

📅 Total Workouts: 12
📆 Duration: 45 minutes per session

Use /workouts to see your upcoming workouts!
```

---

## Viewing Workouts

### Command: `/workouts`

Shows your next 7 upcoming workouts.

**Example Output:**

```
📅 **Your Upcoming Workouts:**

🏋️ **Upper Body Strength**
📆 Monday, Jan 15
⏱️ 45 minutes | 🎯 Chest & Back
💪 8 exercises

🏋️ **Lower Body Power**
📆 Wednesday, Jan 17
⏱️ 45 minutes | 🎯 Legs & Glutes
💪 7 exercises

🏋️ **Full Body Conditioning**
📆 Friday, Jan 19
⏱️ 45 minutes | 🎯 Full Body
💪 9 exercises
```

---

## Interactive Features

### Buttons and Quick Actions

Throughout the bot, you can:
- ✅ Click buttons instead of typing commands
- 🔄 Navigate back and forth in setup
- 💬 Get instant feedback on selections
- 🎯 Access features with one tap

### State Management

The bot remembers:
- ✅ Your current setup step
- ✅ Your selections so far
- ✅ Your profile preferences
- ✅ Your active workout plans

### Multi-Selection

For days and equipment:
- Click multiple times to select/deselect
- See live updates of your selections
- No limit on number of selections
- Must click "Done" to proceed

---

## Tips & Best Practices

### 1. Be Honest About Fitness Level

- **Beginner**: Choose if returning after >6 months off
- **Intermediate**: Regular training for 6+ months
- **Advanced**: Experienced athlete or competitive

### 2. Set Realistic Workout Days

- Start with 3-4 days per week
- Allow rest days for recovery
- Consider your actual schedule
- You can always regenerate with more days

### 3. Choose Appropriate Duration

- Beginners: Start with 30 minutes
- Include warm-up and cool-down time
- Be realistic about available time
- Quality over quantity

### 4. List All Available Equipment

- Include even basic equipment
- More options = more exercise variety
- "No Equipment" is perfectly fine
- Bodyweight exercises are effective

### 5. Report All Injuries

- Include old injuries that flare up
- Mention any limitations
- Better safe than sorry
- AI will adapt exercises accordingly

---

## Updating Your Profile

### How to Update

1. Send `/setup` again
2. Go through the wizard
3. New settings overwrite old ones

**When to Update:**
- ✅ Fitness level improves
- ✅ Goals change
- ✅ New equipment acquired
- ✅ Injuries heal or occur
- ✅ Schedule changes

---

## Workout Plan Management

### Active Plan

- Only one plan can be active at a time
- Generating a new plan creates a new active plan
- Previous plans are saved with "completed" status

### Plan Duration

- Default: 2 weeks
- Can be customized in future updates
- Progressive difficulty across weeks

### Workout Status

Each workout can be:
- 📅 **Scheduled** - Not yet started
- 🏋️ **In Progress** - Currently doing
- ✅ **Completed** - Finished
- ⏭️ **Skipped** - Missed

---

## Troubleshooting

### "Please complete your fitness profile first"

**Solution:**
- Send `/setup`
- Complete all 6 steps
- Then try `/generate` again

### "Please select at least one workout day"

**Solution:**
- In Step 3, click at least one day
- Then click "Done"

### "You don't have any upcoming workouts"

**Solution:**
- Send `/generate` to create a plan
- Or check if all workouts are completed
- May need to create a new plan

### Setup Wizard Got Stuck

**Solution:**
- Send `/setup` to restart
- Start fresh from Step 1
- Complete all steps in order

### Bot Not Responding

**Solution:**
- Check bot is running (server side)
- Try `/start` to reconnect
- Contact administrator if persists

---

## Example User Flow

### Complete Journey

```
1. User: /start
   Bot: Shows welcome + buttons

2. User: Clicks "Setup Profile"
   Bot: Step 1 - Select fitness level

3. User: Clicks "Intermediate"
   Bot: Step 2 - Select primary goal

4. User: Clicks "Build Muscle"
   Bot: Step 3 - Select workout days

5. User: Clicks Monday, Wednesday, Friday, Done
   Bot: Step 4 - Select duration

6. User: Clicks "45 minutes"
   Bot: Step 5 - Select equipment

7. User: Clicks Dumbbells, Bench, Done
   Bot: Step 6 - Any injuries?

8. User: Clicks "No injuries"
   Bot: Shows profile summary + Generate button

9. User: Clicks "Generate Workout Plan"
   Bot: Generating... Success! Plan ready

10. User: /workouts
    Bot: Shows next 7 workouts with details
```

---

## Advanced Features

### Coming Soon

- 🔄 Workout completion tracking
- 📊 Progress analytics
- 📸 Progress photos
- 🏆 Achievement badges
- 👥 Social sharing
- 🍎 Nutrition integration

---

## Privacy & Data

### What We Store

- Telegram ID (for identification)
- Profile preferences (fitness level, goals, etc.)
- Workout plans and history
- Optional: injuries/limitations

### What We Don't Store

- Telegram password
- Payment information
- Personal messages
- Location data

### Data Usage

- Used only for workout generation
- Never shared with third parties
- Can be deleted on request
- Compliant with privacy regulations

---

## Support

### Need Help?

- Use `/help` for quick command reference
- Re-run `/setup` if profile needs updating
- Check documentation for detailed guides
- Contact support if bot malfunctions

---

**Ready to start your fitness journey? Send `/start` now! 💪**



