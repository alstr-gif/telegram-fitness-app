#!/usr/bin/env ts-node
/**
 * Production Environment Validation Script
 * 
 * Validates that all required environment variables are set correctly
 * for production deployment. Run this before deploying to production.
 * 
 * Usage:
 *   NODE_ENV=production npm run validate:production
 * 
 * Note: Set NODE_ENV=production before running to validate production config
 */

// Force production mode for validation (override any existing value)
process.env.NODE_ENV = 'production';

import { env, validateEnv } from '../src/config/env';

const validateProduction = () => {
  console.log('🔍 Validating production environment configuration...\n');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}\n`);

  // validateEnv will exit with code 1 if validation fails
  // If it passes, we continue to show summary
  validateEnv();
  
  // If we get here, validation passed
  console.log('\n✅ All production validations passed!');
  console.log('\n📋 Configuration Summary:');
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Database Type: ${env.DB_TYPE}`);
  console.log(`   API URL: ${env.API_URL}`);
  console.log(`   CORS Origins: ${env.CORS_ORIGIN.length > 0 ? env.CORS_ORIGIN.join(', ') : 'None configured'}`);
  console.log(`   Database: ${env.DB_USERNAME}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_DATABASE}`);
  console.log(`   Telegram Bot: ${env.TELEGRAM_BOT_TOKEN ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   OpenAI API: ${env.OPENAI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   JWT Secret: ${env.JWT_SECRET.length >= 32 ? '✅ Strong (' + env.JWT_SECRET.length + ' chars)' : '❌ Weak'}`);
  console.log('\n🚀 Ready for production deployment!\n');
};

// Run validation
validateProduction();

