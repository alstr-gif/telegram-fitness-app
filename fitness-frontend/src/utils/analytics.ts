/**
 * Telegram Mini Apps Analytics SDK Integration
 * 
 * This file initializes and provides utilities for the Telegram Mini Apps Analytics SDK.
 * 
 * To get your API key and identifier:
 * 1. Go to https://builders.ton.org
 * 2. Register your project
 * 3. Navigate to Analytics tab
 * 4. Copy your API key and Analytics Identifier
 * 
 * Set in your environment variables:
 * VITE_TON_ANALYTICS_API_KEY=your-api-key-here
 * VITE_TON_ANALYTICS_IDENTIFIER=your-analytics-identifier
 */

import TelegramAnalytics from '@telegram-apps/analytics';

let analyticsInitialized = false;

/**
 * Initialize Analytics SDK
 * @param apiKey - Analytics API key from TON Builders
 * @param identifier - Analytics Identifier (project name) from TON Builders
 * @returns Promise that resolves when initialization is complete
 */
export const initializeAnalytics = async (apiKey?: string, identifier?: string): Promise<void> => {
  if (analyticsInitialized) {
    console.warn('Analytics SDK already initialized');
    return;
  }

  // Get API key from parameter or environment variable
  const key = apiKey || import.meta.env.VITE_TON_ANALYTICS_API_KEY;
  const appName = identifier || import.meta.env.VITE_TON_ANALYTICS_IDENTIFIER;

  if (!key) {
    console.warn('⚠️ Analytics API key not provided. Analytics will not be initialized.');
    return;
  }

  if (!appName) {
    console.warn('⚠️ Analytics Identifier not provided. Analytics will not be initialized.');
    return;
  }

  try {
    // Initialize Telegram Analytics SDK
    // Must await this before rendering the app
    await TelegramAnalytics.init({
      token: key,
      appName: appName,
      env: 'PROD', // Use 'PROD' for mainnet, 'STG' for staging
    });
    
    analyticsInitialized = true;
  } catch (error) {
    console.error('❌ Failed to initialize Analytics SDK:', error);
    throw error; // Re-throw so caller knows it failed
  }
};

/**
 * Track an event
 * Note: Most events are tracked automatically by the SDK.
 * This function is kept for logging purposes and future manual tracking if needed.
 * @param eventName - Name of the event
 * @param eventData - Additional event data
 */
export const trackEvent = (eventName: string, eventData?: Record<string, any>): void => {
  if (!analyticsInitialized) {
    console.warn('Analytics not initialized. Call initializeAnalytics() first.');
    return;
  }

  // Note: Telegram Analytics SDK tracks most events automatically
  // This is for logging and potential future manual tracking
  // If manual tracking is needed in the future, it can be added here
  // The SDK automatically tracks: app launches, TON Connect interactions, etc.
};

/**
 * Track user registration/login
 */
export const trackUserLogin = (telegramId: string): void => {
  trackEvent('user_login', { telegramId });
};

/**
 * Track workout generation
 */
export const trackWorkoutGeneration = (workoutId: string): void => {
  trackEvent('workout_generated', { workoutId });
};

/**
 * Track workout completion
 */
export const trackWorkoutCompletion = (workoutId: string): void => {
  trackEvent('workout_completed', { workoutId });
};

/**
 * Track wallet connection
 */
export const trackWalletConnection = (walletAddress: string): void => {
  trackEvent('wallet_connected', { walletAddress });
};

/**
 * Track payment transaction
 */
export const trackPayment = (amount: string, transactionHash: string): void => {
  trackEvent('payment_completed', { amount, transactionHash });
};

/**
 * Check if analytics is initialized
 */
export const isAnalyticsInitialized = (): boolean => {
  return analyticsInitialized;
};
