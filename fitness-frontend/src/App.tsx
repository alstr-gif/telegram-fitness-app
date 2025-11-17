import { useEffect, useMemo, useState } from 'react';
import { useTelegram } from './hooks/useTelegram';
import { authService } from './services/auth';
import { resultsService } from './services/results';
import { paymentService } from './services/payment';
import { WorkoutGeneration } from './pages/WorkoutGeneration';
import { getColorScheme } from './utils/colors';
import './App.css';

/**
 * Helper function to format exercise name with reps, removing duplicates
 * Prevents showing "50 reps 50 Box Jumps" -> should show just "50 Box Jumps"
 */
const formatExerciseWithReps = (name: string, reps?: string | number | null): string => {
  if (!reps) return name;
  
  const repsStr = String(reps).trim();
  const repsNum = parseInt(repsStr, 10);
  
  // If reps is not a valid number, just add it as-is
  if (isNaN(repsNum)) {
    // Check if reps string already appears in name
    const nameLower = name.toLowerCase();
    const repsLower = repsStr.toLowerCase();
    if (nameLower.includes(repsLower)) {
      return name;
    }
    return `${repsStr} ${name}`;
  }
  
  // Check if name starts with the same number as reps
  // Match number at the very start of the name
  const nameMatch = name.match(/^(\d+)/);
  
  if (nameMatch) {
    const nameNumber = parseInt(nameMatch[1], 10);
    // If the number at the start matches reps, return the name as-is
    if (nameNumber === repsNum) {
      return name;
    }
  }
  
  // Also check if reps appears anywhere in the name as a word boundary
  const nameLower = name.toLowerCase();
  const repsLower = repsStr.toLowerCase();
  
  // Use word boundary to match standalone number (not part of larger number)
  const escapedReps = repsLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const repsRegex = new RegExp(`\\b${escapedReps}\\b`, 'i');
  
  if (repsRegex.test(nameLower)) {
    return name;
  }
  
  // If no match found, add reps before name
  return `${repsStr} ${name}`;
};

type View = 'home' | 'workout' | 'statistics';

function App() {
  const { user, isReady, WebApp, themeParams } = useTelegram();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('home');
  const [userTelegramId, setUserTelegramId] = useState<string>('');
  const [workoutCount, setWorkoutCount] = useState(0);
  const [workoutResults, setWorkoutResults] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);
  
  // Get color scheme
  const colorScheme = useMemo(() => getColorScheme(themeParams), [themeParams]);
  const primaryTextColor = colorScheme.text;
  const secondaryTextColor = colorScheme.muted;

  const withAlpha = (hex: string, alpha: number) => {
    const cleaned = hex.replace('#', '');
    if (cleaned.length !== 6) return hex;
    const r = parseInt(cleaned.substring(0, 2), 16);
    const g = parseInt(cleaned.substring(2, 4), 16);
    const b = parseInt(cleaned.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const backgroundColor = colorScheme.background;
  const surfaceColor = colorScheme.light;
  const accentColor = colorScheme.primary;
  const accentDark = colorScheme.dark;
  const buttonTextColor = colorScheme.buttonText;
  const softBorderColor = withAlpha(primaryTextColor, 0.1);

  const getDisplayName = () => user?.first_name || user?.username || 'Athlete';
  const userDisplayName = getDisplayName();

  const statsContainerStyle = {
    width: '100vw',
    maxWidth: '100vw',
    padding: '16px',
    boxSizing: 'border-box' as const,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  } as const;

  const statsHeaderStyle = {
    background: `linear-gradient(135deg, ${accentColor} 0%, ${accentDark} 100%)`,
    color: buttonTextColor,
    borderRadius: '18px',
    padding: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: `0 8px 24px ${withAlpha(accentColor, 0.35)}`,
  } as const;

  const statsListWrapperStyle = {
    backgroundColor: withAlpha(primaryTextColor, 0.05),
    borderRadius: '18px',
    border: `1px solid ${withAlpha(primaryTextColor, 0.08)}`,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  } as const;


  useEffect(() => {
    const authenticate = async () => {
      if (!isReady) return;

      try {
        const token = authService.getToken();
        
        if (token) {
          try {
          const verifyResult = await authService.verifyToken();
          // Extract telegramId from verify result
          if (verifyResult.user?.telegramId) {
            setUserTelegramId(verifyResult.user.telegramId);
          } else if (user) {
            setUserTelegramId(user.id.toString());
          } else {
            setUserTelegramId('999999999');
          }
          setIsAuthenticated(true);
          } catch (verifyError) {
            // Token invalid or expired, clear it and proceed to login
            console.log('Token verification failed, clearing token and logging in...');
            authService.logout();
            // Fall through to login flow
            if (user) {
              const response = await authService.login({
                telegramId: user.id.toString(),
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                photoUrl: user.photo_url,
              });
              
              authService.saveToken(response.token);
              setUserTelegramId(user.id.toString());
              setIsAuthenticated(true);
            } else {
              // Browser testing fallback
              const response = await authService.login({
                telegramId: '999999999',
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
              });
              
              authService.saveToken(response.token);
              setUserTelegramId('999999999');
              setIsAuthenticated(true);
            }
          }
        } else if (user) {
          const response = await authService.login({
            telegramId: user.id.toString(),
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            photoUrl: user.photo_url,
          });
          
          authService.saveToken(response.token);
          setUserTelegramId(user.id.toString());
          setIsAuthenticated(true);
        } else {
          // Browser testing fallback
          const response = await authService.login({
            telegramId: '999999999',
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User',
          });
          
          authService.saveToken(response.token);
          setUserTelegramId('999999999');
          setIsAuthenticated(true);
        }
      } catch (error: any) {
        console.error('Authentication failed:', error);
        const errorMessage = error?.message || error?.response?.data?.error || 'Authentication failed';
        
        // Check if it's a connection error
        if (errorMessage.includes('Backend server is not running') || 
            error?.code === 'ECONNREFUSED' ||
            error?.message?.includes('Network Error')) {
          setError('⚠️ Backend server is not running. Please start the backend server:\n\nnpm run dev\n\n(in the project root directory)');
        } else {
          setError(`Authentication failed: ${errorMessage}`);
        }
      } finally {
        setLoading(false);
      }
    };

    authenticate();
  }, [isReady, user]);

  // Fetch workout count
  useEffect(() => {
    const fetchWorkoutCount = async () => {
      if (!isAuthenticated || !userTelegramId) return;

        try {
        const results = await resultsService.getUserResults(userTelegramId);
        setWorkoutCount(results.length);
        setWorkoutResults(results); // Store results for statistics view
        } catch (error) {
        console.error('Error fetching workout count:', error);
        setWorkoutCount(0);
      }
    };

    fetchWorkoutCount();
  }, [isAuthenticated, userTelegramId]);

  const handleShowStatistics = async () => {
    // If we already have results, use them; otherwise fetch
    if (workoutResults.length === 0 && userTelegramId) {
      setLoadingStats(true);
      try {
        const results = await resultsService.getUserResults(userTelegramId);
        setWorkoutResults(results);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoadingStats(false);
      }
    }
    setCurrentView('statistics');
  };

  const handleBackToHome = async () => {
    setCurrentView('home');
    // Refresh workout count when returning to home
    if (userTelegramId) {
      try {
        const results = await resultsService.getUserResults(userTelegramId);
        setWorkoutCount(results.length);
        setWorkoutResults(results); // Update results for statistics view too
      } catch (error) {
        console.error('Error fetching workout count:', error);
      }
    }
  };


  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: `3px solid ${withAlpha(primaryTextColor, 0.1)}`,
            borderTopColor: accentColor,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '16px', color: secondaryTextColor }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor
      }}>
        <div style={{ textAlign: 'center', padding: '20px', backgroundColor: surfaceColor, borderRadius: '16px', border: `1px solid ${softBorderColor}`, maxWidth: '400px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: primaryTextColor }}>
            🏋️ Fitness App
          </h1>
          <p style={{ marginTop: '16px', color: '#ef4444', whiteSpace: 'pre-line', fontSize: '14px', lineHeight: '1.6' }}>
            {error || 'Authentication failed. Please try again.'}
          </p>
          {error?.includes('Backend server') && (
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: withAlpha('#fbbf24', 0.1), borderRadius: '8px', fontSize: '12px', color: secondaryTextColor }}>
              <strong>Quick Fix:</strong><br />
              Open a terminal in the project root and run:<br />
              <code style={{ backgroundColor: withAlpha(primaryTextColor, 0.1), padding: '2px 6px', borderRadius: '4px' }}>npm run dev</code>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Statistics View
  if (currentView === 'statistics') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor }}>
        <div style={statsContainerStyle}>
          <div style={statsHeaderStyle}>
            <button
              onClick={handleBackToHome}
              className="pressable"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                border: 'none',
                color: buttonTextColor,
                borderRadius: '999px',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ← Home
            </button>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '14px', opacity: 0.85 }}>Performance History</div>
              <h1 style={{ fontSize: '20px', fontWeight: '700', margin: '4px 0 0 0' }}>
                My Statistics
              </h1>
            </div>
            <div style={{ width: '80px', textAlign: 'right', fontSize: '13px', opacity: 0.8 }}>
              {workoutResults.length} logs
            </div>
          </div>

          <div style={statsListWrapperStyle}>
            {loadingStats ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                padding: '32px'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  border: `3px solid ${withAlpha(primaryTextColor, 0.1)}`,
                  borderTopColor: accentColor,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <div style={{ fontSize: '13px', color: secondaryTextColor }}>Loading your history...</div>
              </div>
            ) : workoutResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: secondaryTextColor }}>
                <p style={{ fontSize: '14px', margin: 0 }}>No workout results yet</p>
                <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>Log a workout to see your progress here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {workoutResults.map((result) => {
                  const date = new Date(result.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });
                  
                  // Format result based on workout type
                  let resultText = '';
                  if (result.timeSeconds) {
                    const minutes = Math.floor(result.timeSeconds / 60);
                    const seconds = result.timeSeconds % 60;
                    resultText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                  } else if (result.rounds !== null && result.rounds !== undefined) {
                    resultText = `${result.rounds} rounds`;
                    if (result.reps) {
                      resultText += ` + ${result.reps} reps`;
                    }
                  }

                  const version = result.additionalData?.rxOrScaled || '';
                  const isExpanded = expandedWorkoutId === result.id;
                  
                  // Build complete workout description
                  let workoutBeforeWod = '';
                  let workoutAfterWod = '';
                  let wodBlockContent = '';
                  const fullData = result.fullWorkoutData;
                  
                  if (fullData) {
                    // Include workout type and main description
                    if (fullData.type) {
                      workoutBeforeWod += `${fullData.type}\n\n`;
                    }
                    
                    // Include workout description if available
                    if (fullData.description) {
                      workoutBeforeWod += `${fullData.description}\n\n`;
                    }
                    
                    // Include workout focus if available
                    if (fullData.focus) {
                      workoutBeforeWod += `Focus: ${fullData.focus}\n\n`;
                    }
                    
                    // Include all blocks and exercises with movements
                    let foundWod = false;
                    if (fullData.blocks && fullData.blocks.length > 0) {
                      fullData.blocks.forEach((block: any, blockIndex: number) => {
                        if (block.exercises && block.exercises.length > 0) {
                          let blockContent = '';
                          
                          // Include block name
                          if (block.blockName || block.name) {
                            blockContent += `${block.blockName || block.name}:\n`;
                          }
                          
                          // For warm-up, include description with time/rounds info
                          if (block.blockType === 'warm-up' && block.description) {
                            blockContent += `${block.description}\n\n`;
                          }
                          
                          // For cool-down, include description (without time instructions)
                          if (block.blockType === 'cooldown' && block.description) {
                            blockContent += `${block.description}\n\n`;
                          }
                          
                          block.exercises.forEach((ex: any, exIndex: number) => {
                            let exerciseLine = '';
                            if (ex.name) {
                              // For warm-up and cool-down, show reps before movement name (column format)
                              if (block.blockType === 'warm-up' || block.blockType === 'cooldown') {
                                if (ex.reps) {
                                  // Use helper function to format exercise with reps (removes duplicates)
                                  exerciseLine = formatExerciseWithReps(ex.name, ex.reps);
                                } else if (ex.duration) {
                                  // Check if duration value is already in the name to avoid duplication
                                  const durationStr = String(ex.duration).toLowerCase();
                                  const nameStr = String(ex.name).toLowerCase();
                                  if (!nameStr.includes(durationStr)) {
                                    exerciseLine = `${ex.duration} ${ex.name}`;
                                  } else {
                                    exerciseLine = ex.name;
                                  }
                                } else {
                                  exerciseLine = ex.name;
                                }
                              } else {
                                // For WOD and skill blocks, use standard format
                                // Check if movement is mono-structural (running, rowing, bike erg, ski erg, assault bike, echo bike)
                                const isMonostructural = (name: string) => {
                                  const nameLower = String(name).toLowerCase();
                                  return nameLower.includes('run') || 
                                         nameLower.includes('row') || 
                                         nameLower.includes('bike erg') || 
                                         nameLower.includes('ski erg') || 
                                         nameLower.includes('assault bike') || 
                                         nameLower.includes('echo bike');
                                };
                                
                                exerciseLine = ex.name;
                                
                                // Add sets and reps if available (check for duplication first)
                                if (ex.sets && ex.reps) {
                                  // Check if sets and reps are already in the name
                                  const setsRepsPattern = `${ex.sets}x${ex.reps}`;
                                  const nameStr = String(ex.name).toLowerCase();
                                  if (!nameStr.includes(setsRepsPattern.toLowerCase())) {
                                    exerciseLine += ` - ${ex.sets}x${ex.reps}`;
                                  }
                                } else if (ex.reps) {
                                  // Use helper function to check if reps already in name
                                  const formattedName = formatExerciseWithReps(ex.name, ex.reps);
                                  // Only add reps if the formatted name is different (means reps were added)
                                  if (formattedName !== ex.name) {
                                    exerciseLine += ` - ${ex.reps}`;
                                  }
                                } else if (ex.duration) {
                                  exerciseLine += ` - ${ex.duration}s`;
                                }
                                
                                // Add weight if available (but skip bodyweight for mono-structural movements)
                                if (ex.weight) {
                                  const weightStr = String(ex.weight).toLowerCase();
                                  // Skip "bodyweight" for mono-structural movements
                                  if (weightStr === 'bodyweight' && isMonostructural(ex.name)) {
                                    // Don't add weight for mono-structural movements
                                  } else if (weightStr.includes('kg')) {
                                    // Already has kg, just show as is
                                    exerciseLine += ` @ ${String(ex.weight)}`;
                                  } else {
                                    const numericWeight = Number(weightStr);
                                    if (!isNaN(numericWeight) && numericWeight > 0) {
                                      // Valid numeric weight, add kg
                                      exerciseLine += ` @ ${ex.weight}kg`;
                                    } else if (weightStr !== 'bodyweight') {
                                      // Non-numeric weight (but not bodyweight for mono-structural), show it without kg
                                      exerciseLine += ` @ ${String(ex.weight)}`;
                                    }
                                  }
                                }
                              }
                              
                              blockContent += exerciseLine;
                              if (exIndex < block.exercises.length - 1) {
                                blockContent += '\n';
                              }
                            }
                          });
                          
                          // Store WOD block separately
                          if (block.blockType === 'wod') {
                            wodBlockContent = blockContent;
                            foundWod = true;
                          } else if (!foundWod) {
                            workoutBeforeWod += blockContent + (blockIndex < fullData.blocks.length - 1 ? '\n\n' : '');
                          } else {
                            workoutAfterWod += blockContent + (blockIndex < fullData.blocks.length - 1 ? '\n\n' : '');
                          }
                        }
                      });
                    }
                    
                    // Include time cap if available
                    if (fullData.timeCap) {
                      workoutAfterWod += `\nTime Cap: ${fullData.timeCap}`;
                    }
                    
                    // If no WOD block was found, extract from the first block
                    if (!foundWod && fullData.blocks && fullData.blocks.length > 0) {
                      const mainBlock = fullData.blocks.find((b: any) => b.blockType === 'wod') || 
                                        fullData.blocks.find((b: any) => b.blockName) || 
                                        fullData.blocks[0];
                      if (mainBlock?.exercises && mainBlock.exercises.length > 0) {
                        mainBlock.exercises.forEach((ex: any, exIndex: number) => {
                          let exerciseLine = '';
                          if (ex.name) {
                            exerciseLine = ex.name;
                            
                            // Check for duplication before adding sets/reps
                            if (ex.sets && ex.reps) {
                              const setsRepsPattern = `${ex.sets}x${ex.reps}`;
                              const nameStr = String(ex.name).toLowerCase();
                              if (!nameStr.includes(setsRepsPattern.toLowerCase())) {
                                exerciseLine += ` - ${ex.sets}x${ex.reps}`;
                              }
                            } else if (ex.reps) {
                              // Use helper function to check if reps already in name
                              const formattedName = formatExerciseWithReps(ex.name, ex.reps);
                              // Only add "reps" if the formatted name is different (means reps were added)
                              if (formattedName !== ex.name) {
                                exerciseLine += ` - ${ex.reps} reps`;
                              }
                            } else if (ex.duration) {
                              exerciseLine += ` - ${ex.duration}s`;
                            }
                            
                            if (ex.weight) {
                              const weightStr = String(ex.weight).toLowerCase();
                              if (weightStr.includes('kg')) {
                                exerciseLine += ` @ ${String(ex.weight)}`;
                              } else {
                                const numericWeight = Number(weightStr);
                                if (!isNaN(numericWeight) && numericWeight > 0) {
                                  exerciseLine += ` @ ${ex.weight}kg`;
                                } else {
                                  exerciseLine += ` @ ${String(ex.weight)}`;
                                }
                              }
                            }
                            
                            wodBlockContent += exerciseLine;
                            if (exIndex < mainBlock.exercises.length - 1) {
                              wodBlockContent += '\n';
                            }
                          }
                        });
                      }
                    }
                  }

                  return (
                    <div
                      key={result.id}
                      style={{
                        border: `1px solid ${softBorderColor}`,
                        borderRadius: '16px',
                        padding: '16px',
                        backgroundColor: surfaceColor,
                        boxShadow: `0 8px 22px ${withAlpha(primaryTextColor, 0.06)}`,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', color: secondaryTextColor }}>{date}</span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {version && (
                            <span style={{
                              fontSize: '11px',
                              color: version === 'RX' ? accentDark : secondaryTextColor,
                              fontWeight: '500',
                              padding: '2px 8px',
                              backgroundColor: version === 'RX' ? withAlpha(accentColor, 0.15) : withAlpha(primaryTextColor, 0.08),
                              border: `1px solid ${version === 'RX' ? accentColor : withAlpha(primaryTextColor, 0.1)}`,
                              borderRadius: '4px'
                            }}>
                              {version}
                            </span>
                          )}
                          {result.liked !== null && result.liked !== undefined && (
                            <span style={{
                              fontSize: '14px',
                              opacity: result.liked ? 1 : 0.4
                            }}>
                              {result.liked ? '👍' : '👎'}
                            </span>
                          )}
                        </div>
                      </div>
                      <h3 
                        onClick={() => {
                          if (workoutBeforeWod || wodBlockContent || workoutAfterWod) {
                            setExpandedWorkoutId(isExpanded ? null : result.id);
                          }
                        }}
                        style={{ 
                          fontSize: '15px', 
                          fontWeight: '600', 
                          color: primaryTextColor, 
                          margin: '0 0 6px 0',
                          cursor: (workoutBeforeWod || wodBlockContent || workoutAfterWod) ? 'pointer' : 'default'
                        }}
                      >
                        {result.workoutName}
                      </h3>
                      {isExpanded && (workoutBeforeWod || wodBlockContent || workoutAfterWod) && (
                        <>
                          {workoutBeforeWod && (
                            <div style={{
                              padding: '12px',
                              backgroundColor: withAlpha(primaryTextColor, 0.05),
                              borderRadius: '6px',
                              marginBottom: '6px'
                            }}>
                              <pre style={{ 
                                fontSize: '11px', 
                                color: secondaryTextColor, 
                                margin: 0, 
                                lineHeight: '1.6',
                                whiteSpace: 'pre-wrap',
                                fontFamily: 'system-ui, -apple-system, sans-serif'
                              }}>
                                {workoutBeforeWod}
                              </pre>
                            </div>
                          )}
                          {wodBlockContent && (
                            <div style={{
                              padding: '10px',
                              backgroundColor: withAlpha(accentColor, 0.12),
                              borderRadius: '6px',
                              marginBottom: workoutAfterWod ? '12px' : '6px',
                              border: version ? `2px solid ${accentColor}` : `1px solid ${withAlpha(primaryTextColor, 0.08)}`,
                            }}>
                              <div style={{
                                fontSize: '10px',
                                color: accentDark,
                                fontWeight: '600',
                                marginBottom: '6px'
                              }}>
                                MAIN WORKOUT
                              </div>
                              <pre style={{ 
                                fontSize: '11px', 
                                color: secondaryTextColor, 
                                margin: 0, 
                                lineHeight: '1.6',
                                whiteSpace: 'pre-wrap',
                                fontFamily: 'system-ui, -apple-system, sans-serif'
                              }}>
                                {wodBlockContent}
                              </pre>
                            </div>
                          )}
                          {workoutAfterWod && (
                            <div style={{
                              padding: '12px',
                              backgroundColor: withAlpha(primaryTextColor, 0.05),
                              borderRadius: '6px',
                              marginBottom: '6px'
                            }}>
                              <pre style={{ 
                                fontSize: '11px', 
                                color: secondaryTextColor, 
                                margin: 0, 
                                lineHeight: '1.6',
                                whiteSpace: 'pre-wrap',
                                fontFamily: 'system-ui, -apple-system, sans-serif'
                              }}>
                                {workoutAfterWod}
                              </pre>
                            </div>
                          )}
                        </>
                      )}
                      {resultText && (
                        <p style={{ fontSize: '13px', color: accentDark, fontWeight: '500', margin: '0 0 6px 0' }}>
                          {resultText}
                        </p>
                      )}
                      {result.userNotes && (
                        <p style={{ fontSize: '12px', color: secondaryTextColor, margin: 0 }}>
                          {result.userNotes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Workout Generation View
  if (currentView === 'workout') {
  return (
      <div style={{ minHeight: '100vh', backgroundColor }}>
        <WorkoutGeneration 
          telegramId={userTelegramId}
          onBack={handleBackToHome}
          colorScheme={colorScheme}
          userName={userDisplayName}
        />
      </div>
    );
  }

  // Home View
  return (
    <div style={{ minHeight: '100vh', backgroundColor }}>
      <div style={{ maxWidth: '448px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          backgroundColor: colorScheme.background,
          color: primaryTextColor,
          padding: '20px'
        }}>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0, marginBottom: '4px' }}>
            🔥 Welcome, {user?.first_name || user?.username || 'Athlete'}!
          </h1>
          <p style={{ color: secondaryTextColor, margin: 0, fontSize: '13px', lineHeight: '1.4' }}>
            Every day is a new chance to move, grow, and feel amazing.
            <br />
            Let's make today count 💥
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '12px' }}>
          {/* Text on background */}
            <h2 style={{
            fontSize: '19px',
              fontWeight: 'bold',
              color: primaryTextColor,
              marginTop: 0,
            marginBottom: '6px',
              textAlign: 'center'
            }}>
            READY FOR FUN?
            </h2>
            <p style={{
            fontSize: '12px',
              color: secondaryTextColor,
            marginBottom: '12px',
              textAlign: 'center',
            lineHeight: '1.4'
            }}>
            Get a personalized, AI-powered, scalable workout made just for you — fun, furious, and effective 💪
            </p>
            
          {/* Button */}
            <button 
              className="pressable"
              onClick={() => setCurrentView('workout')}
              style={{
                width: '100%',
                backgroundColor: colorScheme.button,
                color: colorScheme.buttonText,
              padding: '14px',
                borderRadius: '12px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
              fontSize: '18px',
                boxShadow: `0 4px 12px ${colorScheme.primary}40`,
              }}
            >
            SHOW ME TODAY'S FUN
        </button>

          {/* Community Block */}
          {/* Text on background */}
          <h2 style={{
            fontSize: '19px',
            fontWeight: 'bold',
            color: primaryTextColor,
            marginTop: '32px',
            marginBottom: '6px',
            textAlign: 'center'
          }}>
            JOIN OUR COMMUNITY
          </h2>
          <p style={{
            fontSize: '12px',
            color: secondaryTextColor,
            marginBottom: '12px',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            You're not training alone — connect with other athletes, share wins, and get daily motivation, tips & challenges 🏆
          </p>
          
          {/* Button */}
          <button 
            className="pressable"
            onClick={() => {
              if (WebApp?.openTelegramLink) {
                WebApp.openTelegramLink('https://t.me/livingtopeak');
              } else {
                window.open('https://t.me/livingtopeak', '_blank');
              }
            }}
            style={{
              width: '100%',
              backgroundColor: colorScheme.button,
              color: colorScheme.buttonText,
              padding: '14px',
              borderRadius: '12px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              boxShadow: `0 4px 12px ${colorScheme.primary}40`,
            }}
          >
            JOIN OUR COMMUNITY
          </button>

          {/* Support Block */}
          {/* Text on background */}
          <h2 style={{
            fontSize: '19px',
                    fontWeight: 'bold',
                      color: primaryTextColor,
            marginTop: '32px',
            marginBottom: '6px',
            textAlign: 'center'
          }}>
            SUPPORT US
          </h2>
                  <p style={{
                    fontSize: '12px',
            color: secondaryTextColor,
            marginBottom: '12px',
                    textAlign: 'center',
            lineHeight: '1.4'
          }}>
            We believe fitness should be free and fun. If you enjoy your workouts, send us a few Stars — it helps us grow 🌱
          </p>
          
          {/* Button */}
          <button 
            className="pressable"
            onClick={async () => {
              try {
                if (!userTelegramId) {
                  console.error('Telegram ID not available');
                  return;
                }

                // Create invoice for 10 stars (default amount)
                const invoice = await paymentService.createInvoice({
                  telegramId: userTelegramId,
                  amount: 10, // Default to 10 stars
                });

                // Open invoice using Telegram WebApp
                if (WebApp?.openInvoice) {
                  WebApp.openInvoice(invoice.invoiceUrl, (status) => {
                    if (status === 'paid') {
                      // Payment successful
                      if (WebApp?.showAlert) {
                        WebApp.showAlert('Thank you for your support! 🌟 Your contribution helps us grow and improve the app.');
                      }
                    } else if (status === 'failed') {
                      // Payment failed
                      if (WebApp?.showAlert) {
                        WebApp.showAlert('Payment failed. Please try again.');
                      }
                    } else if (status === 'cancelled') {
                      // Payment cancelled - no action needed
                    }
                  });
                } else {
                  // Fallback: open invoice URL in new window (for browser testing)
                  window.open(invoice.invoiceUrl, '_blank');
                }
              } catch (error) {
                console.error('Error creating invoice:', error);
                if (WebApp?.showAlert) {
                  WebApp.showAlert('Failed to create payment. Please try again later.');
                } else {
                  alert('Failed to create payment. Please try again later.');
                }
              }
            }}
            style={{
              width: '100%',
              backgroundColor: colorScheme.button,
              color: colorScheme.buttonText,
              padding: '14px',
              borderRadius: '12px',
                  fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              boxShadow: `0 4px 12px ${colorScheme.primary}40`,
            }}
          >
            GIVE US BACK
          </button>

          {/* Workout Count Text */}
          <p style={{
                    fontSize: '14px',
                    color: primaryTextColor,
                    textAlign: 'center',
            marginTop: '32px',
            fontWeight: '500'
                  }}>
            🚀 You've crushed {workoutCount} {workoutCount === 1 ? 'workout' : 'workouts'} — keep going!
                  </p>

          {/* Statistics Button */}
              <button
            className="pressable"
            onClick={handleShowStatistics}
                style={{
                  width: '100%',
              backgroundColor: 'transparent',
              color: colorScheme.text,
              padding: '10px',
                  borderRadius: '8px',
              fontWeight: '500',
              border: `1px solid ${colorScheme.border}33`,
                  cursor: 'pointer',
              fontSize: '14px',
              marginTop: '3px',
            }}
              >
            SHOW ME MY STATS
              </button>
        </div>
      </div>

    </div>
  );
}

export default App;
