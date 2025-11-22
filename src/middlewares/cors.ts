import cors from 'cors';
import { env } from '../config/env';

// Validate CORS configuration on module load (production only)
if (env.NODE_ENV === 'production') {
  if (env.CORS_ORIGIN.length === 0) {
    console.error('❌ CRITICAL: CORS_ORIGIN must be configured in production');
    console.error('   Set CORS_ORIGIN environment variable with production frontend URL(s)');
    process.exit(1);
  }
  
  const hasLocalhost = env.CORS_ORIGIN.some(origin => 
    origin.includes('localhost') || origin.includes('127.0.0.1')
  );
  if (hasLocalhost) {
    console.error('❌ CRITICAL: CORS_ORIGIN must not include localhost in production');
    process.exit(1);
  }
}

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin');
      callback(null, true);
      return;
    }

    console.log(`🔍 CORS: Checking origin: ${origin}`);
    console.log(`🔍 CORS: Allowed origins:`, env.CORS_ORIGIN);

    // In production, only allow configured origins
    if (env.NODE_ENV === 'production') {
      if (env.CORS_ORIGIN.includes(origin)) {
        console.log(`✅ CORS: Allowing request from: ${origin}`);
        callback(null, true);
      } else {
        console.warn(`❌ CORS: Blocked request from origin: ${origin}`);
        console.warn(`   Configured origins:`, env.CORS_ORIGIN);
        // Return false instead of error to avoid 500
        callback(null, false);
      }
    } else {
      // Development: allow configured origins or any origin
      if (env.CORS_ORIGIN.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow in development
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200, // Some legacy browsers (IE11) choke on 204
});

