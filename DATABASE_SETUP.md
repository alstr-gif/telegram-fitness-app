# 🗄️ Database Configuration Guide

## Overview

The Telegram Fitness App supports both **SQLite** (for development) and **PostgreSQL** (for production).

---

## Quick Start

### Development (SQLite) - Default

SQLite is configured by default for easy local development:

```env
DB_TYPE=sqlite
DB_FILE=telegram_fitness.db
```

**Advantages:**
- ✅ No installation required
- ✅ Zero configuration
- ✅ Perfect for development
- ✅ Database stored as a file

**Just run:**
```bash
npm run dev
```

Database file will be created automatically!

---

## Production (PostgreSQL)

### Step 1: Install PostgreSQL

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from [postgresql.org](https://www.postgresql.org/download/)

### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE telegram_fitness_db;

# Create user (optional)
CREATE USER fitness_app WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE telegram_fitness_db TO fitness_app;

# Exit
\q
```

### Step 3: Configure Environment

Update your `.env` file:

```env
# Database Configuration
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
DB_DATABASE=telegram_fitness_db

# Comment out SQLite config
# DB_FILE=telegram_fitness.db
```

### Step 4: Install PostgreSQL Driver

The `pg` package is already included in dependencies:

```bash
npm install
```

### Step 5: Start Application

```bash
npm run dev
```

You should see:
```
✅ Database connection established successfully
📊 Database type: postgres
🗄️  PostgreSQL: postgres@localhost:5432/telegram_fitness_db
```

---

## Database Configuration Details

### Environment Variables

| Variable | SQLite | PostgreSQL | Description |
|----------|--------|------------|-------------|
| `DB_TYPE` | `sqlite` | `postgres` | Database type |
| `DB_FILE` | Required | - | SQLite file path |
| `DB_HOST` | - | Required | PostgreSQL host |
| `DB_PORT` | - | Required | PostgreSQL port (default: 5432) |
| `DB_USERNAME` | - | Required | PostgreSQL username |
| `DB_PASSWORD` | - | Required | PostgreSQL password |
| `DB_DATABASE` | - | Required | Database name |

### Auto-Sync vs Migrations

**Development (`NODE_ENV=development`):**
```typescript
synchronize: true  // Auto-creates/updates tables
```
- Tables created automatically
- Schema changes applied on restart
- Perfect for rapid development
- ⚠️ **Never use in production!**

**Production (`NODE_ENV=production`):**
```typescript
synchronize: false  // Use migrations instead
```
- Safer database updates
- Version-controlled schema changes
- Prevents accidental data loss

---

## Production Deployment

### Cloud PostgreSQL Options

#### 1. **Railway.app** (Easiest)
```env
DB_TYPE=postgres
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=xxx
DB_DATABASE=railway
```

#### 2. **Heroku Postgres**
```bash
# Get DATABASE_URL from Heroku
heroku config:get DATABASE_URL

# Parse and set individual variables
DB_TYPE=postgres
DB_HOST=ec2-xxx.compute-1.amazonaws.com
DB_PORT=5432
DB_USERNAME=xxx
DB_PASSWORD=xxx
DB_DATABASE=xxx
```

#### 3. **DigitalOcean Managed Database**
```env
DB_TYPE=postgres
DB_HOST=db-postgresql-xxx.ondigitalocean.com
DB_PORT=25060
DB_USERNAME=doadmin
DB_PASSWORD=xxx
DB_DATABASE=defaultdb
```

#### 4. **AWS RDS**
```env
DB_TYPE=postgres
DB_HOST=your-db.xxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=xxx
DB_DATABASE=telegram_fitness_db
```

### SSL Configuration

For production PostgreSQL with SSL:

```typescript
// In database.ts (already configured)
ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
```

---

## Database Migrations

### When to Use Migrations

✅ Production deployments
✅ Team collaboration
✅ Reversible schema changes
✅ Version-controlled database changes

### Creating Migrations

```bash
# Generate migration from entity changes
npm run migration:generate -- -n AddUserFields

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

### Example Migration

```bash
# 1. Update entity (e.g., add field to User.ts)
# 2. Generate migration
npm run migration:generate -- -n AddAgeToUser

# 3. Review generated migration in src/migrations/
# 4. Run migration
npm run migration:run
```

---

## Connection Pooling

### For High Traffic

Update `database.ts`:

```typescript
const postgresConfig: DataSourceOptions = {
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
  
  // Add connection pooling
  extra: {
    max: 20,              // Maximum pool size
    min: 5,               // Minimum pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  ...baseConfig,
};
```

---

## Backup & Restore

### PostgreSQL Backup

```bash
# Backup database
pg_dump -U postgres telegram_fitness_db > backup.sql

# Backup with compression
pg_dump -U postgres telegram_fitness_db | gzip > backup.sql.gz

# Restore database
psql -U postgres telegram_fitness_db < backup.sql
```

### SQLite Backup

```bash
# Simply copy the file
cp telegram_fitness.db telegram_fitness.db.backup

# Or use SQLite command
sqlite3 telegram_fitness.db ".backup telegram_fitness.db.backup"
```

---

## Monitoring

### Check Database Connection

```bash
# Test endpoint
curl http://localhost:3000/api/health

# Should return database status
```

### PostgreSQL Monitoring

```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Database size
SELECT pg_size_pretty(pg_database_size('telegram_fitness_db'));

-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Troubleshooting

### "Database connection failed"

**SQLite:**
- Check `DB_FILE` path is writable
- Ensure parent directory exists

**PostgreSQL:**
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `.env`
- Test connection: `psql -U postgres -d telegram_fitness_db`
- Check firewall allows port 5432

### "Password authentication failed"

```bash
# Reset PostgreSQL password
psql -U postgres
ALTER USER postgres PASSWORD 'new_password';
```

### "Database does not exist"

```bash
# Create database
createdb telegram_fitness_db

# Or in psql
psql -U postgres
CREATE DATABASE telegram_fitness_db;
```

### "Too many connections"

- Increase PostgreSQL max_connections
- Implement connection pooling
- Check for connection leaks

### "SSL connection required"

Add to `.env`:
```env
# For cloud PostgreSQL
DB_SSL=true
```

Then update `database.ts`:
```typescript
ssl: env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
```

---

## Performance Tips

### 1. Indexes

Add indexes to frequently queried fields:

```typescript
@Entity('users')
@Index(['telegramId']) // Add index
export class User {
  @Column({ unique: true, type: 'bigint' })
  telegramId: string;
}
```

### 2. Query Optimization

```typescript
// Bad: Loads all workouts
const plans = await planRepository.find({ relations: ['workouts'] });

// Good: Only load what you need
const plans = await planRepository.find({
  select: ['id', 'name', 'status'],
  relations: ['workouts'],
  where: { status: 'active' }
});
```

### 3. Connection Pooling

Enable for PostgreSQL in production (see above)

### 4. Logging

Disable in production:
```typescript
logging: env.NODE_ENV === 'development'
```

---

## Migration from SQLite to PostgreSQL

### Option 1: Export/Import

```bash
# 1. Export from SQLite
sqlite3 telegram_fitness.db .dump > data.sql

# 2. Clean up for PostgreSQL
sed -i 's/AUTOINCREMENT/SERIAL/g' data.sql

# 3. Import to PostgreSQL
psql -U postgres -d telegram_fitness_db < data.sql
```

### Option 2: Let TypeORM Recreate

```bash
# 1. Export data manually (if needed)
# 2. Switch DB_TYPE to postgres in .env
# 3. Start app (synchronize will create tables)
# 4. Import data if needed
```

---

## Current Configuration

The app is configured to:

✅ **Default to SQLite** for easy development
✅ **Support PostgreSQL** for production
✅ **Auto-sync in development** for rapid iteration
✅ **Use migrations in production** for safety
✅ **Log queries in development** for debugging
✅ **Support SSL connections** for cloud databases

**Switch between databases by changing `DB_TYPE` in `.env`!**

---

**Database ready for development and production! 🗄️**



