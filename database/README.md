# Database Setup Guide

This directory contains the PostgreSQL database schema and seed data for the Bible Verse Programmatic SEO system.

## 📋 Files

- **schema.sql** - Complete database schema with all tables, indexes, and relationships
- **seed-verses.sql** - Initial seed data (50 topics, 100 top verses, intent pages)
- **connection-test.js** - Node.js script to test database connection and verify setup
- **README.md** - This file

## 🗄️ Database Structure

### Core Tables
- `verses` - 31,102 Bible verses in multiple translations
- `topics` - Hierarchical topic taxonomy (500+ topics)
- `verse_topics` - Many-to-many verse-topic relationships
- `cross_references` - Related verse connections
- `intent_pages` - Intent-based pages (weddings, tattoos, etc.)
- `generated_content` - AI-generated page content
- `faqs` - Frequently asked questions for each page

### User Tables (for future features)
- `users` - User accounts
- `user_bookmarks` - Saved verses
- `user_reading_history` - Reading analytics
- `email_subscribers` - Newsletter subscribers
- `page_views` - Analytics

## 🚀 Setup Instructions

### Option 1: Local PostgreSQL

1. **Install PostgreSQL** (if not already installed)
   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql
   
   # Ubuntu/Debian
   sudo apt-get install postgresql
   sudo systemctl start postgresql
   
   # Windows - Download from postgresql.org
   ```

2. **Create database**
   ```bash
   psql -U postgres
   CREATE DATABASE bible_verses;
   \q
   ```

3. **Run schema**
   ```bash
   psql -U postgres -d bible_verses -f schema.sql
   ```

4. **Load seed data**
   ```bash
   psql -U postgres -d bible_verses -f seed-verses.sql
   ```

5. **Configure environment variables**
   
   Create/edit `../.env.local`:
   ```env
   # Option A: Single connection string (recommended)
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/bible_verses
   
   # Option B: Separate variables
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=bible_verses
   DB_USER=postgres
   DB_PASSWORD=yourpassword
   DB_SSL=false
   ```

6. **Test connection**
   ```bash
   cd database
   npm install pg dotenv  # Install dependencies if needed
   node connection-test.js
   ```

### Option 2: Supabase (Recommended for Production)

1. **Create Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Wait for database to provision (~2 minutes)

2. **Get connection details**
   - Go to Settings → Database
   - Copy "Connection string" (URI format)
   - Find your database password (set during project creation)

3. **Run schema via Supabase SQL Editor**
   - Go to SQL Editor in Supabase dashboard
   - Create new query
   - Paste contents of `schema.sql`
   - Click "Run"

4. **Run seed data**
   - Create another new query
   - Paste contents of `seed-verses.sql`
   - Click "Run"

5. **Configure environment**
   
   Add to `../.env.local`:
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```
   
   Replace:
   - `[YOUR-PASSWORD]` with your Supabase database password
   - `[YOUR-PROJECT-REF]` with your project reference (e.g., `abcdefgh`)

6. **Test connection**
   ```bash
   cd database
   node connection-test.js
   ```

## ✅ Verify Setup

After running the setup, you should see:

```
✅ Connected to database successfully!
📋 All 13 tables found!
📊 Checking data...
   Verses: 100
   Topics: 50
   Verse-Topic mappings: 20
   Intent pages: 16
✅ DATABASE CONNECTION TEST PASSED
```

## 📊 Data Overview

### Initial Seed Data

| Table | Count | Description |
|-------|-------|-------------|
| Topics | 50 | Core topics (Love, Faith, Hope, etc.) |
| Verses | 100 | Top 100 most popular verses |
| Intent Pages | 16 | Weddings, funerals, tattoos, etc. |
| Verse-Topic Mappings | 20+ | Initial topic tags for top verses |

### Full Production Data (To Be Loaded)

| Table | Target Count | Source |
|-------|--------------|--------|
| Verses | 31,102 | Complete Bible via API |
| Topics | 2,000+ | Expanded topic taxonomy |
| Verse-Topic Mappings | 100,000+ | AI-assisted tagging |
| Cross-References | 50,000+ | Automated + manual curation |
| Generated Content | 200,000+ | AI-generated page content |

## 🔧 Common Issues

### Connection Refused
**Problem:** `ECONNREFUSED` or `Connection refused`

**Solutions:**
- Verify PostgreSQL is running: `brew services list` or `sudo systemctl status postgresql`
- Check port 5432 is not blocked
- Ensure correct host (localhost vs 127.0.0.1)

### Authentication Failed
**Problem:** `password authentication failed`

**Solutions:**
- Verify password in `.env.local`
- Check `pg_hba.conf` for connection rules (local PostgreSQL)
- For Supabase, regenerate database password in dashboard

### Table Already Exists
**Problem:** `relation "verses" already exists`

**Solutions:**
- Drop existing tables: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
- Or modify schema.sql to use `CREATE TABLE IF NOT EXISTS`

### Missing Extensions
**Problem:** `extension "uuid-ossp" does not exist`

**Solutions:**
- Install extension: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
- For managed databases, extensions are usually pre-installed

## 🔍 Useful Queries

### Check table sizes
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### View popular verses
```sql
SELECT book, chapter, verse, slug, popularity_score
FROM verses
ORDER BY popularity_score DESC
LIMIT 20;
```

### View topics with verse counts
```sql
SELECT 
  t.name,
  t.slug,
  COUNT(vt.verse_id) as verse_count
FROM topics t
LEFT JOIN verse_topics vt ON t.id = vt.topic_id
GROUP BY t.id, t.name, t.slug
ORDER BY verse_count DESC;
```

### Test cross-references
```sql
SELECT 
  v1.slug as verse,
  v2.slug as related_verse,
  cr.relationship_type,
  cr.strength
FROM cross_references cr
JOIN verses v1 ON cr.verse_id = v1.id
JOIN verses v2 ON cr.related_verse_id = v2.id
LIMIT 10;
```

## 🎯 Next Steps

After database setup:

1. **Load Full Verse Text**
   - Use Bible API to populate `text_*` columns for all 31,102 verses
   - Script: `scripts/load-bible-text.ts`

2. **Generate AI Content**
   - Use Claude API to generate context, meaning, application, prayer
   - Script: `scripts/generate-verse-content.ts`

3. **Build Remaining Data**
   - Expand topics to 2,000+
   - Create verse-topic mappings
   - Generate cross-references

4. **Test with Next.js**
   - Start development server: `npm run dev`
   - Test database queries in API routes
   - Verify ISR page generation

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [Node.js pg Library](https://node-postgres.com/)
- Database design based on `programmatic-seo/data-model.json`

---

**Status:** ✅ Checkpoint 1 Complete - Database infrastructure ready for Phase 1!
