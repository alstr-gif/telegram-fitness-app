import 'reflect-metadata';
import { createApp } from './app';
import { initializeDatabase } from './config/database';
import { env, validateEnv } from './config/env';
import { TelegramBotService } from './services/TelegramBotService';

const startServer = async (): Promise<void> => {
  try {
    // Check if another instance is already running
    const net = require('net');
    const checkPort = (port: number): Promise<boolean> => {
      return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(port, () => {
          server.once('close', () => resolve(false));
          server.close();
        });
        server.on('error', () => resolve(true));
      });
    };

    const portInUse = await checkPort(env.PORT);
    if (portInUse) {
      console.error(`❌ Port ${env.PORT} is already in use!`);
      console.error('❌ Please stop the existing instance before starting a new one.');
      console.error('   Run: pkill -f "ts-node src/index.ts" or pkill -f "nodemon"');
      process.exit(1);
    }

    // Validate environment variables
    validateEnv();

    // Initialize database
    console.log('🔄 Initializing database...');
    await initializeDatabase();

    // Create Express app
    const app = createApp();

    // Start Express server
    const server = app.listen(env.PORT, () => {
      console.log('✅ Server is running');
      console.log(`📡 Port: ${env.PORT}`);
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
      console.log(`🔗 API URL: ${env.API_URL}`);
      console.log(`📖 API Documentation: ${env.API_URL}/api/health`);
    });

    // Initialize Telegram Bot (disabled for testing)
    if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_BOT_TOKEN !== 'test-token-placeholder') {
      console.log('🤖 Starting Telegram bot...');
      const telegramBot = new TelegramBotService();
      telegramBot.start();
    } else {
      console.log('ℹ️  Telegram bot disabled for testing. API is ready!');
    }

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('🛑 SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('🛑 SIGINT received. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

