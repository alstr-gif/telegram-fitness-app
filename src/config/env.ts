import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  API_URL: string;
  
  // Database
  DB_TYPE: 'sqlite' | 'postgres';
  DB_FILE?: string; // For SQLite
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
  
  // JWT
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  
  // OpenAI
  OPENAI_API_KEY: string;
  OPENAI_MODEL: string;
  
  // Telegram
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_WEBHOOK_URL?: string;
  TELEGRAM_FRONTEND_URL?: string;
  
  // CORS
  CORS_ORIGIN: string[];
}

const getEnvConfig = (): EnvConfig => {
  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000'),
    API_URL: process.env.API_URL || 'http://localhost:3000',
    
    DB_TYPE: (process.env.DB_TYPE as 'sqlite' | 'postgres') || 'sqlite',
    DB_FILE: process.env.DB_FILE || 'telegram_fitness.db',
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT || '5432'),
    DB_USERNAME: process.env.DB_USERNAME || 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_DATABASE: process.env.DB_DATABASE || 'telegram_fitness_db',
    
    JWT_SECRET: process.env.JWT_SECRET || 'change_this_secret',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4',
    
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
    TELEGRAM_WEBHOOK_URL: process.env.TELEGRAM_WEBHOOK_URL,
    TELEGRAM_FRONTEND_URL: process.env.TELEGRAM_FRONTEND_URL,
    
    CORS_ORIGIN: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  };
};

export const env = getEnvConfig();

// Validate required environment variables
export const validateEnv = (): void => {
  const isProduction = env.NODE_ENV === 'production';
  const errors: string[] = [];

  // Basic required variables (all environments)
  const required = ['TELEGRAM_BOT_TOKEN', 'OPENAI_API_KEY', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key] || process.env[key] === '');
  
  if (missing.length > 0) {
    if (isProduction) {
      errors.push(`Missing required environment variables: ${missing.join(', ')}`);
    } else {
      console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
      console.warn('⚠️  Please check your .env file');
    }
  }

  // Production-specific validations
  if (isProduction) {
    // Database type must be PostgreSQL in production
    if (env.DB_TYPE !== 'postgres') {
      errors.push('CRITICAL: Production must use PostgreSQL (DB_TYPE=postgres), not SQLite');
    }

    // Database credentials required in production
    const dbRequired = ['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE'];
    const missingDb = dbRequired.filter(key => !process.env[key] || process.env[key] === '');
    if (missingDb.length > 0) {
      errors.push(`Missing database configuration: ${missingDb.join(', ')}`);
    }

    // Database password strength
    if (!env.DB_PASSWORD || env.DB_PASSWORD.length < 8) {
      errors.push('DB_PASSWORD must be at least 8 characters long');
    }

    // JWT secret validation
    if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters long');
    }
    if (env.JWT_SECRET === 'change_this_secret') {
      errors.push('JWT_SECRET must be changed from default value');
    }

    // Telegram bot token validation
    if (!env.TELEGRAM_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN === 'test-token-placeholder') {
      errors.push('TELEGRAM_BOT_TOKEN must be set to production token');
    } else {
      // Validate Telegram bot token format: digits:alphanumeric
      const tokenPattern = /^\d+:[A-Za-z0-9_-]+$/;
      if (!tokenPattern.test(env.TELEGRAM_BOT_TOKEN)) {
        errors.push('TELEGRAM_BOT_TOKEN format is invalid (expected format: digits:alphanumeric)');
      }
    }

    // OpenAI API key validation
    if (!env.OPENAI_API_KEY || !env.OPENAI_API_KEY.startsWith('sk-')) {
      errors.push('OPENAI_API_KEY must be a valid OpenAI API key (starts with sk-)');
    }

    // API URL validation
    if (env.API_URL.includes('localhost') || env.API_URL.includes('127.0.0.1')) {
      errors.push('API_URL must be production URL, not localhost');
    }
    if (!env.API_URL.startsWith('https://')) {
      errors.push('API_URL must use HTTPS in production');
    }

    // CORS origin validation
    if (env.CORS_ORIGIN.length === 0) {
      errors.push('CORS_ORIGIN must be set in production');
    } else {
      const hasLocalhost = env.CORS_ORIGIN.some(origin => 
        origin.includes('localhost') || origin.includes('127.0.0.1')
      );
      if (hasLocalhost) {
        errors.push('CORS_ORIGIN must not include localhost in production');
      }
      const hasHttps = env.CORS_ORIGIN.some(origin => origin.startsWith('https://'));
      if (!hasHttps) {
        errors.push('CORS_ORIGIN must use HTTPS URLs in production');
      }
    }
  } else {
    // Development warnings (non-blocking)
    if (env.JWT_SECRET === 'change_this_secret') {
      console.warn('⚠️  JWT_SECRET is using default value. Change it for production!');
    }
    if (env.TELEGRAM_BOT_TOKEN === 'test-token-placeholder') {
      console.warn('⚠️  TELEGRAM_BOT_TOKEN is using placeholder. Set real token for production!');
    }
  }

  // Fail fast in production if any errors
  if (errors.length > 0) {
    console.error('❌ CRITICAL: Environment validation failed:');
    errors.forEach(error => console.error(`   - ${error}`));
    console.error('\n❌ Application cannot start with invalid configuration.');
    console.error('   Please fix the issues above and try again.\n');
    process.exit(1);
  }

  // Success message in production
  if (isProduction) {
    console.log('✅ Production environment validation passed');
  }
};
