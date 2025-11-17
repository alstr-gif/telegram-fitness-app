import { useState, useEffect, useRef } from 'react';
import { workoutService } from '../services/workout';
import { resultsService, type LogResultData } from '../services/results';
import type { ColorScheme } from '../utils/colors';
import { formatExercise } from '../utils/exerciseFormatter';
import { ExerciseCard } from '../components/ExerciseCard';

// Exercise formatting moved to utils/exerciseFormatter.ts

interface WorkoutGenerationProps {
  telegramId: string;
  onBack: () => void;
  colorScheme: ColorScheme;
  userName?: string;
}

type Step = 'time' | 'training' | 'goal' | 'gear' | 'generating' | 'result' | 'logging';

export const WorkoutGeneration = ({ telegramId, onBack, colorScheme, userName }: WorkoutGenerationProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('time');
  const [animatingButton, setAnimatingButton] = useState<string | null>(null);
  const transitionDelay = 400;
  const pendingTimeout = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (pendingTimeout.current) {
        clearTimeout(pendingTimeout.current);
      }
    };
  }, []);

  const scheduleStepChange = (nextStep: Step) => {
    if (pendingTimeout.current) {
      clearTimeout(pendingTimeout.current);
    }
    pendingTimeout.current = window.setTimeout(() => {
      setCurrentStep(nextStep);
      setAnimatingButton(null);
      pendingTimeout.current = null;
    }, transitionDelay);
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workout, setWorkout] = useState<any>(null);
  const [previousStats, setPreviousStats] = useState<any>(null);
  const [showLogForm, setShowLogForm] = useState(false);
  const [loggedResultId, setLoggedResultId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);
  const [savedResult, setSavedResult] = useState<any>(null);
  
  // User selections
  const [timeChoice, setTimeChoice] = useState<'quick' | 'classic' | 'long' | null>(null);
  const [trainingType, setTrainingType] = useState<'lifting' | 'gymnastics' | 'cardio' | 'mixed' | null>(null);
  const [goalType, setGoalType] = useState<'strength' | 'conditioning' | 'skill' | 'balanced' | null>(null);
  const [gearType, setGearType] = useState<'bodyweight' | 'dumbbells' | 'fullgym' | null>(null);
  
  // Result logging
  const [resultTime, setResultTime] = useState('');
  const [resultRounds, setResultRounds] = useState('');
  const [resultReps, setResultReps] = useState('');
  const [resultWeight, setResultWeight] = useState('');
  const [resultScaling, setResultScaling] = useState<'RX' | 'Scaled' | 'Beginner'>('RX');
  const [resultNotes, setResultNotes] = useState('');
  
  // Phase 3: Collapsible scaling instructions state
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set());

  const accent = colorScheme.primary;
  const accentDark = colorScheme.dark;
  const accentLight = colorScheme.light;
  const surface = colorScheme.light || '#ffffff';
  const textColor = colorScheme.text;
  const mutedColor = colorScheme.muted;
  const buttonTextColor = colorScheme.buttonText;
  const contentMaxWidth = '100vw';

  const withAlpha = (hex: string, alpha: number) => {
    const cleaned = hex.replace('#', '');
    if (cleaned.length !== 6) return hex;
    const r = parseInt(cleaned.substring(0, 2), 16);
    const g = parseInt(cleaned.substring(2, 4), 16);
    const b = parseInt(cleaned.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const hexToRgb = (hex: string) => {
    const cleaned = hex.replace('#', '');
    if (cleaned.length !== 6) return null;
    return [
      parseInt(cleaned.substring(0, 2), 16),
      parseInt(cleaned.substring(2, 4), 16),
      parseInt(cleaned.substring(4, 6), 16),
    ];
  };

  const getLuminance = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 1;
    const [r, g, b] = rgb.map((value) => {
      const channel = value / 255;
      return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const isDarkTheme = getLuminance(colorScheme.background) < 0.5;

  const inputBackground = isDarkTheme
    ? withAlpha('#ffffff', 0.12)
    : withAlpha(textColor, 0.08);
  const inputBorderColor = isDarkTheme
    ? withAlpha('#ffffff', 0.3)
    : withAlpha(textColor, 0.18);
  const inputTextColor = isDarkTheme ? '#ffffff' : textColor;

  const getWodSummary = (block: any, fallbackDescription: string) => {
    if (!block) return fallbackDescription;
    if (!block.description) return fallbackDescription;
    const lines = block.description.split('\n').map((line: string) => line.trim()).filter(Boolean);
    if (lines.length === 0) return fallbackDescription;
    const headline = lines[0];
    const summary = lines.slice(1).join(' ').trim();
    return summary || headline;
  };

  const getTimeMinutes = () => {
    switch(timeChoice) {
      case 'quick': return 15;
      case 'classic': return 25;
      case 'long': return 45;
      default: return 25;
    }
  };

  const handleGenerate = async (overrideGearType?: 'bodyweight' | 'dumbbells' | 'fullgym') => {
    const resolvedGear = overrideGearType || gearType;

    if (!timeChoice || !trainingType || !goalType || !resolvedGear) {
      setError('Please complete all selections before generating a workout.');
      setCurrentStep('time');
      return;
    }

    setCurrentStep('generating');
    setLoading(true);
    setError(null);

    try {
      const singleWorkout = await workoutService.generateSingleWorkout({
        timeChoice,
        trainingType,
        goalType,
        gearType: resolvedGear,
      }, telegramId);
      
      setWorkout(singleWorkout);
      setCurrentStep('result');
    } catch (err: any) {
      console.error('Workout generation error:', err);
      setError(err.response?.data?.error || 'Failed to generate workout. Try again!');
      setCurrentStep('time');
    } finally {
      setLoading(false);
    }
  };

  // Load previous stats when workout is generated
  useEffect(() => {
    const loadStats = async () => {
      if (workout && workout.name) {
        try {
          const stats = await resultsService.getWorkoutStats(telegramId, workout.name);
          if (stats.attempts > 0) {
            setPreviousStats(stats);
          }
        } catch (err) {
          console.log('No previous stats available');
        }
      }
    };
    loadStats();
  }, [workout, telegramId]);

  const handleFeedback = async (liked: boolean) => {
    try {
      setFeedbackGiven(liked); // Set visual state immediately
      
      if (loggedResultId) {
        // Update existing result with feedback
        await resultsService.updateFeedback(loggedResultId, liked);
      }
      // If no loggedResultId exists yet, we'll wait for user to log their result
      // and the feedback will be saved in state until then
    } catch (err) {
      console.error('Error saving feedback:', err);
      setFeedbackGiven(null); // Reset on error
    }
  };

  const handleLogResult = async () => {
    setLoading(true);
    try {
      const wodBlock = workout.blocks?.find((b: any) => b.blockType === 'wod');
      
      const data: LogResultData = {
        workoutName: workout.name,
        workoutType: wodBlock?.wodFormat || 'Unknown',
        fullWorkoutData: workout,
        additionalData: {
          rxOrScaled: resultScaling,
          notes: resultNotes,
        },
      };

      // Add result based on type
      if (resultTime) {
        const [min, sec] = resultTime.split(':').map(Number);
        data.timeSeconds = (min * 60) + (sec || 0);
      }
      if (resultRounds) data.rounds = parseInt(resultRounds);
      if (resultReps) data.reps = parseInt(resultReps);
      if (resultWeight) data.weight = parseFloat(resultWeight);
      if (resultNotes) data.userNotes = resultNotes;
      
      // Include feedback if user gave it before logging
      if (feedbackGiven !== null) {
        data.liked = feedbackGiven;
      }

      const result = await resultsService.logResult(telegramId, data);
      setLoggedResultId(result.id);
      
      // If feedback was given before logging, update it now
      if (feedbackGiven !== null) {
        await resultsService.updateFeedback(result.id, feedbackGiven);
      }
      
      // Save what was logged for display
      setSavedResult({
        time: resultTime,
        rounds: resultRounds,
        reps: resultReps,
        weight: resultWeight,
        scaling: resultScaling,
        notes: resultNotes,
      });
      
      setShowLogForm(false);
    } catch (err: any) {
      console.error('Error logging result:', err);
      alert('Failed to log result. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (pendingTimeout.current) {
      clearTimeout(pendingTimeout.current);
      pendingTimeout.current = null;
    }
    setWorkout(null);
    setPreviousStats(null);
    setShowLogForm(false);
    setLoggedResultId(null);
    setFeedbackGiven(null);
    setSavedResult(null);
    setTimeChoice(null);
    setTrainingType(null);
    setGoalType(null);
    setGearType(null);
    setCurrentStep('time');
    setAnimatingButton(null);
    setError(null);
    setResultTime('');
    setResultRounds('');
    setResultReps('');
    setResultWeight('');
    setResultScaling('RX');
    setResultNotes('');
  };

  const handleTimeSelection = (choice: 'quick' | 'classic' | 'long') => {
    setError(null);
    setAnimatingButton(`time-${choice}`);
    setTimeChoice(choice);
    scheduleStepChange('training');
  };

  const handleTrainingSelection = (type: 'lifting' | 'gymnastics' | 'cardio' | 'mixed') => {
    setError(null);
    setAnimatingButton(`training-${type}`);
    setTrainingType(type);
    scheduleStepChange('goal');
  };

  const handleGoalSelection = (goal: 'strength' | 'conditioning' | 'skill' | 'balanced') => {
    setError(null);
    setAnimatingButton(`goal-${goal}`);
    setGoalType(goal);
    scheduleStepChange('gear');
  };

  const handleGearSelection = (gear: 'bodyweight' | 'dumbbells' | 'fullgym') => {
    setError(null);
    setAnimatingButton(`gear-${gear}`);
    setGearType(gear);
    if (pendingTimeout.current) {
      clearTimeout(pendingTimeout.current);
    }
    pendingTimeout.current = window.setTimeout(() => {
      handleGenerate(gear);
      setAnimatingButton(null);
      pendingTimeout.current = null;
    }, transitionDelay);
  };

  const buttonStyle = (isSelected: boolean, buttonId?: string) => {
    const isAnimating = buttonId && animatingButton === buttonId;
    return {
      padding: '14px 16px',
      borderRadius: '12px',
      border: '2px solid',
      borderColor: isSelected ? accent : withAlpha(textColor, 0.15),
      backgroundColor: isSelected ? accent : withAlpha(textColor, 0.08),
      color: isSelected ? buttonTextColor : textColor,
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: isAnimating ? 'none' : 'all 0.2s',
      width: '100%',
      textAlign: 'left' as const,
      touchAction: 'manipulation' as const,
      animation: isAnimating ? 'scaleLift 0.3s ease-out forwards' : 'none',
      transform: isAnimating ? undefined : 'scale(1) translateY(0)',
    };
  };

  const stepContainerStyle = {
    padding: '12px 16px',
    width: '100vw',
    margin: 0,
    color: textColor,
    boxSizing: 'border-box' as const,
    maxWidth: '100vw',
  } as const;

  const resultContainerStyle = {
    padding: '12px 16px',
    width: '100vw',
    maxWidth: contentMaxWidth,
    margin: 0,
    boxSizing: 'border-box' as const,
    color: textColor,
  } as const;

  const backButtonStyle = {
            background: 'none',
            border: 'none',
    color: accent,
            cursor: 'pointer',
            fontSize: '15px',
            padding: '6px 0',
            marginBottom: '12px',
    fontWeight: 600,
  } as const;

  // Question 1: Time
  if (currentStep === 'time') {
    return (
      <div style={stepContainerStyle}>
        <button 
          onClick={onBack}
          style={backButtonStyle}
        >
          ← Back
        </button>

        <div style={{
          backgroundColor: accentLight,
          padding: '12px',
          borderRadius: '12px',
          marginBottom: '16px',
          borderLeft: `4px solid ${accent}`,
        }}>
          <div style={{ fontWeight: '600', color: accentDark, marginBottom: '3px', fontSize: '12px' }}>
            Question 1 of 4
          </div>
          <div style={{ color: accent, fontSize: '12px' }}>
            Let's build your perfect workout
          </div>
        </div>

        <h2 style={{ margin: '0 0 10px 0', color: textColor, fontSize: '22px', lineHeight: '1.3' }}>
          What time domain you want to attack today?
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
          <button
            className="pressable"
            onClick={() => handleTimeSelection('quick')}
            style={buttonStyle(timeChoice === 'quick', 'time-quick')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>⏱️ Quick one</span>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>10–15 min</span>
            </div>
          </button>

          <button
            className="pressable"
            onClick={() => handleTimeSelection('classic')}
            style={buttonStyle(timeChoice === 'classic', 'time-classic')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>⚡ Classic session</span>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>20–30 min</span>
            </div>
          </button>

          <button
            className="pressable"
            onClick={() => handleTimeSelection('long')}
            style={buttonStyle(timeChoice === 'long', 'time-long')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🏋️ Long grind</span>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>40+ min</span>
            </div>
          </button>
        </div>

      </div>
    );
  }

  // Question 2: Training Type
  if (currentStep === 'training') {
    return (
      <div style={stepContainerStyle}>
        <button 
          onClick={() => setCurrentStep('time')}
          style={backButtonStyle}
        >
          ← Back
        </button>

        <div style={{
          backgroundColor: accentLight,
          padding: '12px',
          borderRadius: '12px',
          marginBottom: '16px',
          borderLeft: `4px solid ${accent}`,
        }}>
          <div style={{ fontWeight: '600', color: accentDark, marginBottom: '3px', fontSize: '12px' }}>
            Question 2 of 4
          </div>
          <div style={{ color: accent, fontSize: '12px' }}>
            Choose your training style
          </div>
        </div>

        <h2 style={{ margin: '0 0 10px 0', color: textColor, fontSize: '22px', lineHeight: '1.3' }}>
          What kind of training are you up for today?
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
          <button
            className="pressable"
            onClick={() => handleTrainingSelection('lifting')}
            style={buttonStyle(trainingType === 'lifting', 'training-lifting')}
          >
            🏋️ Lift heavy things
          </button>

          <button
            className="pressable"
            onClick={() => handleTrainingSelection('gymnastics')}
            style={buttonStyle(trainingType === 'gymnastics', 'training-gymnastics')}
          >
            🤸 Move your body
          </button>

          <button
            className="pressable"
            onClick={() => handleTrainingSelection('cardio')}
            style={buttonStyle(trainingType === 'cardio', 'training-cardio')}
          >
            🏃 Build your engine
          </button>

          <button
            className="pressable"
            onClick={() => handleTrainingSelection('mixed')}
            style={buttonStyle(trainingType === 'mixed', 'training-mixed')}
          >
            🔁 Mix it up!
          </button>
        </div>

      </div>
    );
  }

  // Question 3: Goal
  if (currentStep === 'goal') {
    return (
      <div style={stepContainerStyle}>
        <button 
          onClick={() => setCurrentStep('training')}
          style={backButtonStyle}
        >
          ← Back
        </button>

        <div style={{
          backgroundColor: accentLight,
          padding: '12px',
          borderRadius: '12px',
          marginBottom: '16px',
          borderLeft: `4px solid ${accent}`,
        }}>
          <div style={{ fontWeight: '600', color: accentDark, marginBottom: '3px', fontSize: '12px' }}>
            Question 3 of 4
          </div>
          <div style={{ color: accent, fontSize: '12px' }}>
            Define your focus
          </div>
        </div>

        <h2 style={{ margin: '0 0 10px 0', color: textColor, fontSize: '22px', lineHeight: '1.3' }}>
          What's your main goal for today's session?
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
          <button
            className="pressable"
            onClick={() => handleGoalSelection('strength')}
            style={buttonStyle(goalType === 'strength', 'goal-strength')}
          >
            💪 Get stronger
          </button>

          <button
            className="pressable"
            onClick={() => handleGoalSelection('conditioning')}
            style={buttonStyle(goalType === 'conditioning', 'goal-conditioning')}
          >
            🔥 Go all out
          </button>

          <button
            className="pressable"
            onClick={() => handleGoalSelection('skill')}
            style={buttonStyle(goalType === 'skill', 'goal-skill')}
          >
            🧠 Master a skill
          </button>

          <button
            className="pressable"
            onClick={() => handleGoalSelection('balanced')}
            style={buttonStyle(goalType === 'balanced', 'goal-balanced')}
          >
            ⚖️ Balanced grind
          </button>
        </div>

      </div>
    );
  }

  // Question 4: Gear
  if (currentStep === 'gear') {
    return (
      <div style={stepContainerStyle}>
        <button 
          onClick={() => setCurrentStep('goal')}
          style={backButtonStyle}
        >
          ← Back
        </button>

        <div style={{
          backgroundColor: accentLight,
          padding: '12px',
          borderRadius: '12px',
          marginBottom: '16px',
          borderLeft: `4px solid ${accent}`,
        }}>
          <div style={{ fontWeight: '600', color: accentDark, marginBottom: '3px', fontSize: '12px' }}>
            Question 4 of 4
          </div>
          <div style={{ color: accent, fontSize: '12px' }}>
            Final step - almost there!
          </div>
        </div>

        <h2 style={{ margin: '0 0 10px 0', color: textColor, fontSize: '22px', lineHeight: '1.3' }}>
          What gear do you have today?
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
          <button
            className="pressable"
            onClick={() => handleGearSelection('bodyweight')}
            style={buttonStyle(gearType === 'bodyweight', 'gear-bodyweight')}
          >
            🙌 Just me — bodyweight only
          </button>

          <button
            className="pressable"
            onClick={() => handleGearSelection('dumbbells')}
            style={buttonStyle(gearType === 'dumbbells', 'gear-dumbbells')}
          >
            🏠 Dumbbells / kettlebells
          </button>

          <button
            className="pressable"
            onClick={() => handleGearSelection('fullgym')}
            style={buttonStyle(gearType === 'fullgym', 'gear-fullgym')}
          >
            🏋️ Full gym setup
          </button>
        </div>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: withAlpha('#ef4444', 0.12),
            color: '#b91c1c',
            borderRadius: '8px',
            marginTop: '16px',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}
      </div>
    );
  }

  // Generating Screen
  if (currentStep === 'generating' || loading) {
    const getTimeLabel = () => {
      switch(timeChoice) {
        case 'quick': return 'quick';
        case 'classic': return 'classic';
        case 'long': return 'long grind';
      }
    };

    const getTrainingLabel = () => {
      switch(trainingType) {
        case 'lifting': return 'weightlifting';
        case 'gymnastics': return 'gymnastics';
        case 'cardio': return 'conditioning';
        case 'mixed': return 'mixed';
      }
    };

    const getGearLabel = () => {
      switch(gearType) {
        case 'bodyweight': return 'Bodyweight only';
        case 'dumbbells': return 'DB / KB friendly';
        case 'fullgym': return 'Full gym access';
      }
    };

    const totalSteps = 5;
    const currentStepIndex = 5;
    const progress = `${(currentStepIndex / totalSteps) * 100}%`;

    return (
      <div style={{
        ...stepContainerStyle,
        textAlign: 'center',
        padding: '32px 16px 48px',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: isDarkTheme
          ? `linear-gradient(150deg, ${withAlpha(accentDark, 0.4)}, ${withAlpha('#0f172a', 0.9)})`
          : `linear-gradient(150deg, ${withAlpha(accent, 0.12)}, ${withAlpha('#f4f7fb', 0.9)})`,
      }}>
        <div style={{
          width: '100%',
          maxWidth: '360px',
          padding: '24px',
          borderRadius: '24px',
          backgroundColor: isDarkTheme ? withAlpha('#0b1a2b', 0.9) : withAlpha('#ffffff', 0.9),
          boxShadow: `0 20px 60px ${withAlpha('#000000', isDarkTheme ? 0.35 : 0.18)}`,
          backdropFilter: 'blur(14px)',
          border: `1px solid ${withAlpha(isDarkTheme ? '#1e293b' : '#d5dceb', 0.6)}`,
        }}>
          <div style={{ marginBottom: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: withAlpha(textColor, 0.7) }}>
              Generating
            </div>
            <div style={{
              marginTop: '8px',
              width: '100%',
              height: '6px',
              borderRadius: '999px',
              backgroundColor: withAlpha(textColor, 0.08),
              overflow: 'hidden',
            }}>
              <div style={{
                width: progress,
                height: '100%',
                borderRadius: '999px',
                background: `linear-gradient(90deg, ${accent}, ${accentDark})`,
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>

          <div style={{ position: 'relative', padding: '28px 0 22px' }}>
            <div style={{
              width: '88px',
              height: '88px',
              margin: '0 auto',
              borderRadius: '50%',
              background: isDarkTheme
                ? withAlpha(accent, 0.15)
                : withAlpha(accent, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 25px ${withAlpha(accent, 0.35)}`,
            }}>
              <div style={{
                width: '58px',
                height: '58px',
                borderRadius: '50%',
                border: `4px solid ${withAlpha(textColor, 0.12)}`,
                borderTopColor: accent,
                borderRightColor: accent,
                animation: 'spin 0.9s linear infinite',
              }} />
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '18px',
            }}>
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: accent,
                    opacity: 0.4,
                    animation: `telegramDots 1.2s ease-in-out ${dot * 0.15}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>

          <h3 style={{ color: textColor, margin: '0 0 10px 0', fontSize: '22px' }}>
            Hang tight, {userName || 'Athlete'}!
          </h3>
          <p style={{ color: mutedColor, margin: '0 0 18px 0', lineHeight: '1.6', fontSize: '14px' }}>
            Crafting a <strong>{getTimeLabel()}</strong> <strong>{getTrainingLabel()}</strong> plan
            tuned for <strong>{goalType}</strong> work.
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '14px',
            borderRadius: '16px',
            backgroundColor: withAlpha(isDarkTheme ? '#1e293b' : '#eef4ff', isDarkTheme ? 0.8 : 1),
          }}>
            <div style={{ fontSize: '13px', color: withAlpha(textColor, 0.75), display: 'flex', justifyContent: 'space-between' }}>
              <span>⏱️ Time domain</span>
              <strong>{getTimeMinutes()} min</strong>
            </div>
            <div style={{ fontSize: '13px', color: withAlpha(textColor, 0.75), display: 'flex', justifyContent: 'space-between' }}>
              <span>🏋️ Training gear</span>
              <strong>{getGearLabel()}</strong>
            </div>
          </div>

          <p style={{ color: withAlpha(textColor, 0.45), fontSize: '13px', marginTop: '20px' }}>
            Most workouts arrive in 10–15 seconds.
          </p>
        </div>
      </div>
    );
  }

  // Result Screen
  if (currentStep === 'result' && workout) {
    const getBlockIcon = (blockType: string) => {
      switch(blockType) {
        case 'warm-up': return '🏃‍♂️';
        case 'skill': return '🎯';
        case 'wod': return '💪';
        case 'cooldown': return '🧘';
        default: return '📋';
      }
    };

    const getBlockColor = (blockType: string) => {
      switch(blockType) {
        case 'warm-up':
          // Warmer orange-red for warm-up - use accent with slight orange tint if possible
          // For better theme compatibility, we'll use a warmer version of accent
          const warmUpBase = accent; // Use accent as base for theme consistency
          return {
            bg: withAlpha(warmUpBase, 0.15),
            border: withAlpha(warmUpBase, 0.4),
            text: accentDark,
          };
        case 'skill':
          // Distinct styling for skill - slightly different from neutral
          // Use a slightly different shade of accent for distinction
          const skillBase = accent;
          return {
            bg: withAlpha(skillBase, 0.12),
            border: withAlpha(skillBase, 0.3),
            text: accentDark,
          };
        case 'wod':
          return {
            bg: withAlpha(accent, 0.25),
            border: accent,
            text: accentDark,
          };
        case 'cooldown':
          // Calming styling for cooldown
          const cooldownBase = accent;
          return {
            bg: withAlpha(cooldownBase, 0.12),
            border: withAlpha(cooldownBase, 0.35),
            text: accentDark,
          };
        default:
          return {
            bg: withAlpha(textColor, 0.05),
            border: withAlpha(textColor, 0.12),
            text: textColor,
          };
      }
    };

    const wodBlock = workout.blocks?.find((b: any) => b.blockType === 'wod');
    const normalizeFormat = (format?: string) => {
      if (!format) return '';
      const trimmed = format.trim();
      if (/for time/i.test(trimmed)) return 'For Time';
      if (/amrap/i.test(trimmed)) return 'AMRAP';
      if (/emom/i.test(trimmed)) return 'EMOM';
      return trimmed;
    };

    const wodTagline = (() => {
      if (wodBlock) {
        const format = normalizeFormat(wodBlock.wodFormat || (wodBlock.description || '').split('\n')[0]);
        const durationPart = wodBlock.duration ? `${wodBlock.duration} min` : '';
        const parts = [durationPart, format].filter(Boolean);
        if (parts.length > 0) {
          return parts.join(' ').trim();
        }
      }
      const fallback = (workout.description || '').split('\n').map((line: string) => line.trim()).filter(Boolean)[0];
      return fallback || '';
    })();

    // Calculate actual total session duration from all blocks
    const totalSessionDuration = workout.blocks 
      ? workout.blocks.reduce((sum: number, block: any) => sum + (block.duration || 0), 0)
      : 60; // Fallback to 60 if no blocks
 
    return (
      <div style={resultContainerStyle}>
        <button 
          onClick={onBack}
          style={backButtonStyle}
        >
          ← Back to Home
        </button>

        <div style={{
          background: `linear-gradient(135deg, ${accent} 0%, ${accentDark} 100%)`,
          color: buttonTextColor,
          padding: '24px',
          borderRadius: '16px',
          marginBottom: '20px',
          textAlign: 'center',
          boxShadow: `0 10px 30px ${withAlpha(accent, 0.35)}`,
        }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: 'bold' }}>
            {workout.name}
          </h2>
          {wodTagline && (
            <div style={{ margin: '0 0 12px 0', opacity: 0.9, fontSize: '15px', fontWeight: 600 }}>
              {wodTagline}
            </div>
          )}
          <div style={{
            display: 'inline-block',
            padding: '8px 16px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
          }}>
            ⏱️ Total Session: {totalSessionDuration} {totalSessionDuration === 1 ? 'minute' : 'minutes'}
          </div>
        </div>

        {/* Workout Summary After Logging */}
        {savedResult ? (
          <div style={{
            backgroundColor: surface,
            border: `2px solid ${withAlpha(textColor, 0.1)}`,
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '20px',
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: textColor, fontSize: '20px', fontWeight: 'bold' }}>
              Today's Workout Summary
            </h3>
            
            <div style={{
              padding: '16px',
              backgroundColor: withAlpha(textColor, 0.05),
              borderRadius: '12px',
              marginBottom: '16px',
            }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: textColor, marginBottom: '8px' }}>
                {workout.name}
              </div>
              <div style={{ fontSize: '14px', color: mutedColor, lineHeight: '1.6' }}>
                {workout.description}
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '12px',
            }}>
              <div style={{
                padding: '14px',
                backgroundColor: withAlpha(accent, 0.12),
                borderRadius: '10px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>⏱️</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: accentDark }}>
                  {totalSessionDuration}
                </div>
                <div style={{ fontSize: '12px', color: mutedColor }}>Minutes</div>
              </div>
              <div style={{
                padding: '14px',
                backgroundColor: withAlpha(accent, 0.12),
                borderRadius: '10px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>🔥</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: accentDark, marginTop: '6px' }}>
                  {workout.blocks?.find((b: any) => b.blockType === 'wod')?.wodFormat || 'WOD'}
                </div>
                <div style={{ fontSize: '12px', color: mutedColor }}>Format</div>
              </div>
              <div style={{
                padding: '14px',
                backgroundColor: feedbackGiven === true ? withAlpha(accent, 0.2) : feedbackGiven === false ? withAlpha('#ef4444', 0.18) : withAlpha(textColor, 0.05),
                borderRadius: '10px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                  {feedbackGiven === true ? '👍' : feedbackGiven === false ? '👎' : '💭'}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: feedbackGiven === true ? accentDark : feedbackGiven === false ? '#991b1b' : mutedColor, marginTop: '6px' }}>
                  {feedbackGiven === true ? 'Loved it' : feedbackGiven === false ? 'Disliked' : 'No feedback'}
                </div>
                <div style={{ fontSize: '12px', color: mutedColor }}>Rating</div>
              </div>
            </div>
          </div>
        ) : null}

        {!savedResult && workout.blocks && workout.blocks.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: savedResult ? '20px' : '0' }}>
            {/* Phase 3: Block Progress Indicator - Dynamic Duration-Based */}
            {workout.blocks.length > 1 && (() => {
              // Calculate total duration for proportional sizing
              const totalDuration = workout.blocks.reduce((sum: number, block: any) => sum + (block.duration || 0), 0);
              
              return (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: withAlpha(textColor, 0.05),
                  borderRadius: '12px',
                  marginBottom: '12px',
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: mutedColor,
                    marginBottom: '8px',
                    fontWeight: '600',
                  }}>
                    Workout Structure
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '6px',
                    alignItems: 'center',
                  }}>
                    {workout.blocks.map((block: any, idx: number) => {
                      const blockColors = getBlockColor(block.blockType);
                      const blockIcon = getBlockIcon(block.blockType);
                      const blockDuration = block.duration || 0;
                      // Calculate width percentage based on duration
                      const durationPercentage = totalDuration > 0 ? (blockDuration / totalDuration) * 100 : 100 / workout.blocks.length;
                      // Minimum width to ensure icons are visible (at least 8% or proportional, whichever is larger)
                      const minWidth = 8;
                      const widthPercentage = Math.max(durationPercentage, minWidth);
                      
                      return (
                        <div
                          key={idx}
                          style={{
                            flex: `0 0 ${widthPercentage}%`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            minWidth: '40px', // Ensure minimum space for icon
                          }}
                          title={`${block.blockName} - ${blockDuration} min`}
                        >
                          <div style={{
                            width: '100%',
                            height: '4px',
                            backgroundColor: blockColors.border,
                            borderRadius: '2px',
                            opacity: 0.6,
                          }} />
                          <div style={{
                            fontSize: '16px',
                            marginTop: '2px',
                          }}>
                            {blockIcon}
                          </div>
                          <div style={{
                            fontSize: '10px',
                            color: mutedColor,
                            marginTop: '2px',
                            fontWeight: '600',
                          }}>
                            {blockDuration}min
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
            
            {workout.blocks.map((block: any, blockIndex: number) => {
              const colors = getBlockColor(block.blockType);

              const parseInstructions = (instructions: string) => {
                const lines: { version: string; content: string }[] = [];
                const rxIndex = instructions.search(/\bRX\s*[:\s]/i);
                const scaledIndex = instructions.search(/\bScaled\s*[:\s]/i);
                const beginnerIndex = instructions.search(/\bBeginner\s*[:\s]/i);

                if (rxIndex !== -1) {
                  const rxMatch = instructions.substring(rxIndex).match(/RX\s*[:\s]+\s*/i);
                  const start = rxIndex + (rxMatch?.[0]?.length || 3);
                  const end = scaledIndex !== -1 ? scaledIndex : (beginnerIndex !== -1 ? beginnerIndex : instructions.length);
                  let content = instructions.substring(start, end).trim().replace(/\.$/, '');
                  if (content) lines.push({ version: 'RX', content });
                }

                if (scaledIndex !== -1) {
                  const scaledMatch = instructions.substring(scaledIndex).match(/Scaled\s*[:\s]+\s*/i);
                  const start = scaledIndex + (scaledMatch?.[0]?.length || 7);
                  const end = beginnerIndex !== -1 ? beginnerIndex : instructions.length;
                  let content = instructions.substring(start, end).trim().replace(/\.$/, '');
                  if (content) lines.push({ version: 'Scaled', content });
                }

                if (beginnerIndex !== -1) {
                  const beginnerMatch = instructions.substring(beginnerIndex).match(/Beginner\s*[:\s]+\s*/i);
                  const start = beginnerIndex + (beginnerMatch?.[0]?.length || 9);
                  let content = instructions.substring(start).trim().replace(/\.$/, '');
                  if (content) lines.push({ version: 'Beginner', content });
                }

                return lines.length > 0 ? lines : [{ version: '', content: instructions }];
              };

              return (
                <div
                  key={blockIndex}
                  style={{
                    backgroundColor: withAlpha(colors.bg, 0.4),
                    border: `2px solid ${withAlpha(colors.border, 0.5)}`,
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.12)',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px',
                    paddingBottom: '16px',
                    borderBottom: `2px solid ${withAlpha(colors.border, 0.4)}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <span style={{ fontSize: '36px' }}>{getBlockIcon(block.blockType)}</span>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 6px 0', color: colors.text, fontSize: '20px', fontWeight: 'bold' }}>
                          {block.blockName}
                        </h3>
                        {block.wodFormat && (
                          <div style={{ fontSize: '13px', color: mutedColor, fontWeight: '600' }}>
                            Format: {block.wodFormat}
                          </div>
                        )}
                        {block.exercises && block.exercises.length > 0 && (
                          <div style={{ fontSize: '12px', color: mutedColor, marginTop: '4px' }}>
                            {block.exercises.length} {block.exercises.length === 1 ? 'exercise' : 'exercises'}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{
                      backgroundColor: colors.border,
                      color: buttonTextColor,
                      padding: '10px 18px',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: 'bold',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minWidth: '70px',
                    }}>
                      <div style={{ fontSize: '18px', marginBottom: '2px' }}>⏱️</div>
                      <div>{block.duration} min</div>
                    </div>
                  </div>

                  {block.description && (
                    <div style={{
                      padding: '14px 16px',
                      backgroundColor: withAlpha(colors.border, 0.15),
                      borderRadius: '10px',
                      marginBottom: '18px',
                      fontSize: '14px',
                      color: colors.text,
                      lineHeight: '1.6',
                      fontWeight: block.blockType === 'wod' ? '600' : '500',
                    }}>
                      {block.description.split('\n').map((line: string, idx: number) => (
                        <div key={idx} style={{ marginBottom: idx === 0 ? '0' : '6px' }}>
                          {line}
                        </div>
                      ))}
                    </div>
                  )}

                  {block.exercises && block.exercises.length > 0 && (
                    <div style={{
                      padding: '16px',
                      backgroundColor: block.blockType === 'wod' 
                        ? withAlpha(colors.border, 0.1)
                        : withAlpha(textColor, 0.06),
                      borderRadius: '12px',
                      border: `1px solid ${withAlpha(colors.border, 0.15)}`,
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {block.exercises.map((exercise: any, exIndex: number) => {
                          return (
                            <ExerciseCard
                              key={exIndex}
                              exercise={exercise}
                              index={exIndex}
                              blockType={block.blockType}
                              colors={colors}
                              textColor={textColor}
                              mutedColor={mutedColor}
                              accent={accent}
                              accentDark={accentDark}
                              surface={surface}
                              buttonTextColor={buttonTextColor}
                              withAlpha={withAlpha}
                              formatExercise={formatExercise}
                              parseInstructions={parseInstructions}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : workout.exercises && workout.exercises.length > 0 ? (
          <div style={{ marginTop: savedResult ? '20px' : '0' }}>
            <h4 style={{ color: textColor, marginBottom: '16px', fontSize: '20px', fontWeight: 'bold' }}>
                Today's WOD ({workout.exercises.length} movements)
              </h4>
              {workout.exercises.map((exercise: any, index: number) => (
                <div
                  key={index}
                  style={{
                  backgroundColor: surface,
                  border: `2px solid ${withAlpha(textColor, 0.1)}`,
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    {index + 1}. {exercise.name}
                  </div>
                </div>
              ))}
            </div>
        ) : null}

        {/* Previous Stats Display */}
        {!savedResult && previousStats && previousStats.attempts > 0 && (
          <div style={{
            backgroundColor: withAlpha(accent, 0.1),
            border: `1px solid ${withAlpha(accent, 0.35)}`,
            borderRadius: '12px',
            padding: '16px',
            marginTop: '20px',
          }}>
            <div style={{ fontWeight: '600', color: accentDark, marginBottom: '12px', fontSize: '15px' }}>
              📊 Your Previous Results ({previousStats.attempts} {previousStats.attempts === 1 ? 'attempt' : 'attempts'}):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
              {previousStats.bestTime && (
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: surface, borderRadius: '8px', border: `1px solid ${withAlpha(textColor, 0.08)}` }}>
                  <div style={{ fontSize: '11px', color: mutedColor, marginBottom: '4px' }}>Best Time</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: accentDark }}>
                    {Math.floor(previousStats.bestTime / 60)}:{String(previousStats.bestTime % 60).padStart(2, '0')}
                  </div>
                </div>
              )}
              {previousStats.bestRounds && (
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: surface, borderRadius: '8px', border: `1px solid ${withAlpha(textColor, 0.08)}` }}>
                  <div style={{ fontSize: '11px', color: mutedColor, marginBottom: '4px' }}>Best Rounds</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: accentDark }}>
                    {previousStats.bestRounds} {previousStats.lastResult?.reps ? `+${previousStats.lastResult.reps}` : ''}
                  </div>
                </div>
              )}
              {previousStats.bestWeight && (
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: surface, borderRadius: '8px', border: `1px solid ${withAlpha(textColor, 0.08)}` }}>
                  <div style={{ fontSize: '11px', color: mutedColor, marginBottom: '4px' }}>Best Weight</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: accentDark }}>
                    {previousStats.bestWeight} kg
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feedback & Log Result Section */}
        {!showLogForm && !savedResult ? (
          <div style={{ marginTop: '24px' }}>
            {/* Like/Dislike */}
            <div style={{
              backgroundColor: withAlpha(textColor, 0.08),
              border: `2px solid ${withAlpha(textColor, 0.14)}`,
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '16px',
            }}>
              <div style={{ marginBottom: '12px', fontSize: '15px', fontWeight: '600', color: textColor }}>
                How was this workout?
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <button
                  onClick={() => handleFeedback(true)}
                  disabled={feedbackGiven !== null}
                  className="pressable"
                  style={{
                    padding: '12px',
                    backgroundColor: feedbackGiven === true ? accent : withAlpha(textColor, 0.08),
                    color: feedbackGiven === true ? buttonTextColor : textColor,
                    border: `1px solid ${feedbackGiven === true ? accent : withAlpha(textColor, 0.12)}`,
                    borderRadius: '14px',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: feedbackGiven !== null ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: feedbackGiven === false ? 0.45 : 1,
                  }}
                >
                  <span role="img" aria-label="thumbs up">👍</span>
                  <span>Great Fit</span>
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  disabled={feedbackGiven !== null}
                  className="pressable"
                  style={{
                    padding: '12px',
                    backgroundColor: feedbackGiven === false ? withAlpha('#ef4444', 0.18) : withAlpha(textColor, 0.08),
                    color: feedbackGiven === false ? '#ffffff' : textColor,
                    border: `1px solid ${feedbackGiven === false ? '#ef4444' : withAlpha(textColor, 0.12)}`,
                    borderRadius: '14px',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: feedbackGiven !== null ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: feedbackGiven === true ? 0.45 : 1,
                  }}
                >
                  <span role="img" aria-label="thumbs down">👎</span>
                  <span>Not My Style</span>
                </button>
              </div>
              {feedbackGiven !== null && (
                <div style={{
                  marginTop: '14px',
                  padding: '12px',
                  backgroundColor: feedbackGiven ? withAlpha(accent, 0.16) : withAlpha('#ef4444', 0.16),
                  borderRadius: '10px',
                  fontSize: '13px',
                  color: feedbackGiven ? accentDark : '#b91c1c',
                  textAlign: 'center',
                  fontWeight: '600',
                }}>
                  {feedbackGiven ? 'Saved! We’ll show you more like this.' : 'Got it! We’ll switch things up next time.'}
                </div>
              )}
            </div>

            {/* Log Result Button */}
            <button
              className="pressable"
              onClick={() => setShowLogForm(true)}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: accent,
                color: buttonTextColor,
                border: 'none',
                borderRadius: '12px',
                fontSize: '17px',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '16px',
                boxShadow: `0 4px 12px ${withAlpha(accent, 0.25)}`,
              }}
            >
              📝 Log My Result
            </button>
          </div>
        ) : null}

        {/* Log Result Form */}
        {showLogForm && !savedResult && (
          <div style={{
            backgroundColor: withAlpha(textColor, 0.08),
            border: `2px solid ${withAlpha(accent, 0.35)}`,
            borderRadius: '16px',
            padding: '24px',
            marginTop: '24px',
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: textColor, fontSize: '20px', fontWeight: 'bold' }}>
              📝 Log Your Result
            </h3>

            {/* Scaling Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: textColor }}>
                Which version did you do?
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['RX', 'Scaled', 'Beginner'] as const).map(scale => (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => setResultScaling(scale)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: '2px solid',
                      borderColor: resultScaling === scale ? accent : inputBorderColor,
                      backgroundColor: resultScaling === scale ? accent : inputBackground,
                      color: resultScaling === scale ? buttonTextColor : inputTextColor,
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    {scale}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic fields based on WOD type */}
            {(() => {
              const wodBlock = workout.blocks?.find((b: any) => b.blockType === 'wod');
              const format = (wodBlock?.wodFormat || '').toLowerCase();
              const description = (wodBlock?.description || workout.description || '').toLowerCase();
              const isForTime = format.includes('time') || description.includes('for time') || description.includes('21-15-9');
              const isAMRAP = format.includes('amrap') || description.includes('amrap') || description.includes('as many');
              const inputStyle = {
                width: '100%',
                padding: '12px',
                border: `2px solid ${inputBorderColor}`,
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'inherit',
                backgroundColor: inputBackground,
                color: inputTextColor,
              } as const;

              const labelStyle = {
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '8px',
                color: textColor,
              } as const;
              
              return (
                <>
                  {isForTime && (
                    <div style={{ marginBottom: '16px' }}>
                      <label style={labelStyle}>
                        Your Time (MM:SS)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 8:45"
                        value={resultTime}
                        onChange={(e) => setResultTime(e.target.value)}
                        style={inputStyle}
                      />
                      <div style={{ fontSize: '12px', color: mutedColor, marginTop: '4px' }}>
                        Format: Minutes:Seconds (e.g., 7:45)
                      </div>
                    </div>
                  )}

                  {isAMRAP && (
                    <>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>
                          Rounds Completed
                        </label>
                        <input
                          type="number"
                          placeholder="e.g., 12"
                          value={resultRounds}
                          onChange={(e) => setResultRounds(e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>
                          Additional Reps (optional)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g., 7"
                          value={resultReps}
                          onChange={(e) => setResultReps(e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                    </>
                  )}
                </>
              );
            })()}

            {(goalType === 'strength' || workout.name?.toLowerCase().includes('max')) && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: textColor }}>
                  Weight Achieved (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g., 100"
                  value={resultWeight}
                  onChange={(e) => setResultWeight(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${inputBorderColor}`,
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    backgroundColor: inputBackground,
                    color: inputTextColor,
                  }}
                />
              </div>
            )}

            {/* Notes */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: textColor }}>
                Notes (optional)
              </label>
              <textarea
                placeholder="How did it feel? Any modifications?"
                value={resultNotes}
                onChange={(e) => setResultNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `2px solid ${inputBorderColor}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  minHeight: '80px',
                  resize: 'vertical' as const,
                  backgroundColor: inputBackground,
                  color: inputTextColor,
                }}
              />
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowLogForm(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: inputBackground,
                  color: inputTextColor,
                  border: `2px solid ${inputBorderColor}`,
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogResult}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: loading ? withAlpha(textColor, 0.2) : accent,
                  color: buttonTextColor,
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Saving...' : 'Save Result'}
              </button>
            </div>
          </div>
        )}

        {/* Saved Result Summary */}
        {savedResult && (
          <div style={{
            backgroundColor: withAlpha(textColor, 0.08),
            border: `2px solid ${accent}`,
            borderRadius: '16px',
            padding: '24px',
            marginTop: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: buttonTextColor }}>
              <div style={{ fontSize: '40px' }}>✅</div>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                  Result Logged!
                </h3>
                <div style={{ fontSize: '13px', opacity: 0.85 }}>
                  Great work crushing that WOD!
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: surface,
              borderRadius: '12px',
              padding: '16px',
            }}>
              <div style={{ fontSize: '15px', fontWeight: 'bold', color: textColor, marginBottom: '12px' }}>
                Your Performance:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {savedResult.time && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${withAlpha(textColor, 0.08)}` }}>
                    <span style={{ color: mutedColor, fontSize: '14px' }}>⏱️ Time:</span>
                    <span style={{ fontWeight: 'bold', color: textColor, fontSize: '16px' }}>{savedResult.time}</span>
                  </div>
                )}
                {savedResult.rounds && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${withAlpha(textColor, 0.08)}` }}>
                    <span style={{ color: mutedColor, fontSize: '14px' }}>🔄 Rounds:</span>
                    <span style={{ fontWeight: 'bold', color: textColor, fontSize: '16px' }}>
                      {savedResult.rounds}{savedResult.reps ? ` + ${savedResult.reps}` : ''}
                    </span>
                  </div>
                )}
                {savedResult.weight && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${withAlpha(textColor, 0.08)}` }}>
                    <span style={{ color: mutedColor, fontSize: '14px' }}>⚖️ Weight:</span>
                    <span style={{ fontWeight: 'bold', color: textColor, fontSize: '16px' }}>{savedResult.weight} kg</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${withAlpha(textColor, 0.08)}` }}>
                  <span style={{ color: mutedColor, fontSize: '14px' }}>📊 Version:</span>
                  <span style={{ fontWeight: 'bold', color: textColor, fontSize: '14px' }}>{savedResult.scaling}</span>
                </div>
                {savedResult.notes && (
                  <div style={{ padding: '12px', backgroundColor: withAlpha(textColor, 0.05), borderRadius: '8px', marginTop: '8px' }}>
                    <div style={{ fontSize: '12px', color: mutedColor, marginBottom: '4px' }}>📝 Your Notes:</div>
                    <div style={{ fontSize: '14px', color: textColor, lineHeight: '1.5', fontStyle: 'italic' }}>
                      "{savedResult.notes}"
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button
            className="pressable"
            onClick={handleReset}
            style={{
              flex: 1,
              padding: '16px',
              backgroundColor: surface,
              color: accent,
              border: `2px solid ${accent}`,
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            🔄 New Workout
          </button>

          <button
            className="pressable"
            onClick={onBack}
            style={{
              flex: 1,
              padding: '16px',
              backgroundColor: accent,
              color: buttonTextColor,
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: `0 4px 12px ${withAlpha(accent, 0.25)}`,
            }}
          >
            ✅ Done
          </button>
        </div>
      </div>
    );
  }

  return null;
};
