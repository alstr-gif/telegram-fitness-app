# 🏋️ Telegram Fitness App

AI-powered fitness coaching application built with Telegram Mini App, featuring personalized workout plan generation using OpenAI GPT-4.

## 🌟 Features

- ✅ **AI-Powered Workout Plans**: Generate personalized workout plans using OpenAI GPT-4
- ✅ **Telegram Bot Integration**: Interact with users via Telegram
- ✅ **User Profile Management**: Track fitness level, goals, and preferences
- ✅ **Progressive Workout Scheduling**: Smart workout distribution across weeks
- ✅ **Exercise Tracking**: Detailed exercise instructions with sets, reps, and rest times
- ✅ **REST API**: Full REST API for frontend integration
- ✅ **PostgreSQL Database**: Reliable data persistence with TypeORM
- ✅ **TypeScript**: Type-safe backend development

## 🏗️ Architecture

### Backend Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with TypeORM
- **AI**: OpenAI GPT-4 API
- **Bot**: Telegram Bot API
- **Authentication**: JWT (ready for implementation)

### Project Structure
```
telegram-fitness-app/
├── src/
│   ├── config/           # Configuration files (database, env)
│   ├── controllers/      # Request handlers
│   ├── entities/         # TypeORM entities (database models)
│   ├── middlewares/      # Express middlewares
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   │   ├── AIWorkoutService.ts      # OpenAI integration
│   │   ├── UserService.ts           # User management
│   │   ├── WorkoutPlanService.ts    # Workout logic
│   │   └── TelegramBotService.ts    # Telegram bot
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Helper functions
│   ├── app.ts            # Express app setup
│   └── index.ts          # Entry point
├── .env.example          # Environment variables template
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- OpenAI API Key (from [OpenAI Platform](https://platform.openai.com))

### Setup Steps

1. **Clone the repository**
   ```bash
   cd telegram-fitness-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb telegram_fitness_db
   
   # Or use psql
   psql -U postgres
   CREATE DATABASE telegram_fitness_db;
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your credentials:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_DATABASE=telegram_fitness_db
   
   # OpenAI
   OPENAI_API_KEY=sk-your_openai_api_key_here
   OPENAI_MODEL=gpt-4
   
   # Telegram
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   
   # JWT
   JWT_SECRET=your_secure_random_secret_key
   ```

5. **Run database migrations**
   ```bash
   npm run migration:run
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## 🤖 Telegram Bot Setup

### Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the bot token and add it to your `.env` file

### Bot Commands

- `/start` - Start the bot and see welcome message
- `/setup` - Configure fitness profile
- `/generate` - Generate a new workout plan
- `/workouts` - View upcoming workouts
- `/help` - Show help message

## 🔌 API Endpoints

### Health Check
```
GET /api/health
```

### User Endpoints
```
GET    /api/users/:telegramId              # Get user profile
PUT    /api/users/:telegramId              # Update user profile
GET    /api/users/:telegramId/complete     # Check if profile is complete
GET    /api/users                          # Get all users
```

### Workout Endpoints
```
POST   /api/workouts/:telegramId/generate         # Generate AI workout plan
GET    /api/workouts/:telegramId/plans            # Get all user plans
GET    /api/workouts/:telegramId/active           # Get active plan
GET    /api/workouts/:telegramId/upcoming         # Get upcoming workouts
GET    /api/workouts/plans/:planId                # Get plan by ID
PATCH  /api/workouts/plans/:planId/status         # Update plan status
POST   /api/workouts/workout/:workoutId/complete  # Mark workout complete
DELETE /api/workouts/plans/:planId                # Delete plan
```

## 🗄️ Database Schema

### Tables
- **users** - User profiles and fitness preferences
- **workout_plans** - Generated workout plans
- **workouts** - Individual workout sessions
- **exercises** - Exercise details for each workout

### Entity Relationships
```
User (1) ──→ (Many) WorkoutPlan
WorkoutPlan (1) ──→ (Many) Workout
Workout (1) ──→ (Many) Exercise
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Environment Variables for Production
Make sure to set:
- `NODE_ENV=production`
- Secure `JWT_SECRET`
- Production database credentials
- Valid `TELEGRAM_WEBHOOK_URL` for webhook mode

## 📝 Scripts

```bash
npm run dev              # Start development server with hot reload
npm run build            # Build TypeScript to JavaScript
npm start                # Start production server
npm run watch            # Watch TypeScript files for changes
npm run migration:generate  # Generate new migration
npm run migration:run    # Run pending migrations
npm run migration:revert    # Revert last migration
```

## 🧪 Testing

### Test API with cURL

**Generate Workout Plan:**
```bash
curl -X POST http://localhost:3000/api/workouts/123456789/generate \
  -H "Content-Type: application/json" \
  -d '{"weeksCount": 2}'
```

**Get User Profile:**
```bash
curl http://localhost:3000/api/users/123456789
```

**Update User Profile:**
```bash
curl -X PUT http://localhost:3000/api/users/123456789 \
  -H "Content-Type: application/json" \
  -d '{
    "fitnessLevel": "intermediate",
    "primaryGoal": "build_muscle",
    "preferredWorkoutDays": ["monday", "wednesday", "friday"],
    "preferredDuration": 60
  }'
```

## 🔐 Security Considerations

- [ ] Implement JWT authentication for API endpoints
- [ ] Add rate limiting to prevent abuse
- [ ] Validate and sanitize all user inputs
- [ ] Use HTTPS in production
- [ ] Implement proper CORS policies
- [ ] Store sensitive data encrypted
- [ ] Regular security audits

## 🛠️ Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql -U postgres -d telegram_fitness_db
```

### TypeScript Build Errors
```bash
# Clean build
rm -rf dist/
npm run build
```

### Bot Not Responding
- Check bot token is correct in `.env`
- Ensure bot is not already running elsewhere
- Check bot has proper permissions

## 📚 Documentation

- [TypeORM Documentation](https://typeorm.io/)
- [Express.js Documentation](https://expressjs.com/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [OpenAI API Reference](https://platform.openai.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

ISC

## 👨‍💻 Author

Built with ❤️ for fitness enthusiasts

---

**Note**: This is a backend-first implementation. Frontend development will follow in the next phase.

