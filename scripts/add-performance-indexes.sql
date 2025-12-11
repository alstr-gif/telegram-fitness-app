-- Performance Indexes for Workout Generation Optimization
-- Run this script on your database to improve query performance

-- Indexes for workout_results queries (used in getUserFeedbackSummary and getRecentWorkoutHistory)
-- These queries filter by userId and order by createdAt DESC
CREATE INDEX IF NOT EXISTS idx_workout_results_user_created 
  ON workout_results(userId, createdAt DESC);

-- Index for workout_results queries filtering by userId and date range
CREATE INDEX IF NOT EXISTS idx_workout_results_user_date 
  ON workout_results(userId, createdAt);

-- Index for library_workouts queries (used in getRandomForAI and findMatchingWorkouts)
-- Popularity-based queries and active status filtering
CREATE INDEX IF NOT EXISTS idx_library_workouts_active_popular 
  ON library_workouts(isActive, popularityScore DESC);

-- Index for library_workouts equipment filtering
CREATE INDEX IF NOT EXISTS idx_library_workouts_equipment 
  ON library_workouts(equipmentNeeded) 
  WHERE isActive = true;

-- Index for library_workouts type filtering
CREATE INDEX IF NOT EXISTS idx_library_workouts_type 
  ON library_workouts(type) 
  WHERE isActive = true;

-- Index for workout_plans queries (used in getUserPlans and getActivePlan)
CREATE INDEX IF NOT EXISTS idx_workout_plans_user_status 
  ON workout_plans(userId, status, createdAt DESC);

-- Index for workouts queries (used in getUpcomingWorkouts)
CREATE INDEX IF NOT EXISTS idx_workouts_plan_scheduled 
  ON workouts(planId, scheduledDate, status);

-- Note: For PostgreSQL, these indexes will be created automatically
-- For SQLite, run this script manually:
-- sqlite3 telegram_fitness.db < scripts/add-performance-indexes.sql

