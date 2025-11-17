import { DataSource, DataSourceOptions } from 'typeorm';
import { env } from './env';

// Base configuration shared between SQLite and PostgreSQL
const baseConfig = {
  synchronize: env.NODE_ENV === 'development', // Only auto-sync in dev
  logging: env.NODE_ENV === 'development',
  entities: ['src/entities/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
};

// SQLite configuration (for development)
const sqliteConfig: DataSourceOptions = {
  type: 'better-sqlite3',
  database: env.DB_FILE || 'telegram_fitness.db',
  ...baseConfig,
};

// PostgreSQL configuration (for production)
const postgresConfig: DataSourceOptions = {
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  ...baseConfig,
};

// Select configuration based on environment
const dbConfig = env.DB_TYPE === 'postgres' ? postgresConfig : sqliteConfig;

export const AppDataSource = new DataSource(dbConfig);

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established successfully');
    console.log(`📊 Database type: ${env.DB_TYPE}`);
    if (env.DB_TYPE === 'postgres') {
      console.log(`🗄️  PostgreSQL: ${env.DB_USERNAME}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_DATABASE}`);
    } else {
      console.log(`🗄️  SQLite: ${env.DB_FILE}`);
    }
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    throw error;
  }
};

