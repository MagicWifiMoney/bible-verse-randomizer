# Phase 2 Setup Guide

## ✅ Completed So Far

### Bible API Integration
- ✅ **API Selected:** bolls.life (no rate limits, full Bible downloads)
- ✅ **Translations Downloaded:** 6 translations in `data/` folder
  - KJV (12M)
  - NIV (6.6M)
  - ESV (11M)
  - NLT (7.1M)
  - MSG (6.6M)
  - NASB (6.6M)
- ✅ **API Wrapper Created:** `lib/bible-api.ts`
- ✅ **Data Loader Script Created:** `scripts/load-bible-data.ts`

### Data Available
- **Total verses available:** 31,102+ (complete Bible)
- **Translations:** 6 major versions
- **Format:** Clean JSON, ready to load

## 🔧 Required Setup

### 1. Database Setup (Choose One)

#### Option A: Supabase (Recommended)

1. **Create Supabase Project:**
   ```bash
   # Go to https://supabase.com
   # Click "New Project"
   # Project name: bible-verse-randomizer
   # Database password: (save this!)
   # Region: Choose closest to you
   # Wait ~2 minutes for provisioning
   ```

2. **Get Connection String:**
   ```bash
   # In Supabase Dashboard:
   # Settings → Database → Connection String → URI
   # Copy the connection string
   ```

3. **Run Database Schema:**
   ```bash
   # In Supabase Dashboard:
   # SQL Editor → New Query
   # Copy/paste contents of database/schema.sql
   # Click "Run"
   ```

4. **Add to .env.local:**
   ```bash
   cd ~/clawd/projects/bible-verse-randomizer
   echo "DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" >> .env.local
   # Replace [PASSWORD] and [PROJECT-REF] with your values
   ```

#### Option B: Local PostgreSQL

```bash
# Install PostgreSQL
brew install postgresql  # macOS
# or
sudo apt-get install postgresql  # Ubuntu

# Start PostgreSQL
brew services start postgresql  # macOS
# or
sudo systemctl start postgresql  # Ubuntu

# Create database
createdb bible_verses

# Run schema
psql -d bible_verses -f database/schema.sql

# Add to .env.local
echo "DATABASE_URL=postgresql://localhost:5432/bible_verses" >> .env.local
```

### 2. Load Bible Data

Once database is configured:

```bash
cd ~/clawd/projects/bible-verse-randomizer
npm install  # Install dependencies if needed
npx ts-node scripts/load-bible-data.ts
```

Expected output:
```
🚀 Bible Data Loader - Starting...
================================================

🔌 Testing database connection...
✅ Database connected!

📖 Loading Bible translations from local files...
   Loading KJV...
   ✅ KJV: 31102 verses loaded
   ... (5 more translations)

📊 Total verses loaded: 186,612
🔄 Grouping verses by reference...

📝 Preparing verse data for database insertion...
✅ Prepared 31,102 unique verses

💾 Inserting verses into database...
   Progress: 100% (31102/31102)
✅ Successfully inserted/updated 31,102 verses!

📊 Database Statistics:
   Total verses: 31,102
   KJV: 31,102
   NIV: 31,102
   ESV: 31,102
   NLT: 31,102
   MSG: 31,102
   NASB: 31,102

================================================
✅ CHECKPOINT 1 COMPLETE!
   Bible API integrated: bolls.life
   Verses loaded: 31,102
   Translations: KJV, NIV, ESV, NLT, MSG, NASB
================================================
```

## 🚧 Blocked Items

### Anthropic API Key (Required for Checkpoint 2)

The content generation scripts require an Anthropic API key:

**Option 1: Get from OpenClaw (Recommended)**
```bash
# If OpenClaw has Anthropic configured, extract it:
# (Need to check OpenClaw docs/config for this)
```

**Option 2: Create New API Key**
```bash
# Go to https://console.anthropic.com/
# Create API key
# Add to .env.local:
echo "ANTHROPIC_API_KEY=sk-ant-api03-..." >> .env.local
```

**Option 3: Use OpenAI Instead**
```bash
# The generation scripts can be modified to use OpenAI GPT-4
# Would require updating scripts/generate-verse-content.ts
```

## 📋 Next Steps

1. **Complete Checkpoint 1:**
   - [ ] Set up Supabase or local PostgreSQL
   - [ ] Add DATABASE_URL to .env.local
   - [ ] Run `npx ts-node scripts/load-bible-data.ts`
   - [ ] Verify 31,102 verses loaded

2. **Prepare for Checkpoint 2:**
   - [ ] Get Anthropic API key
   - [ ] Add ANTHROPIC_API_KEY to .env.local
   - [ ] Test generation script on one verse

3. **Then Proceed to Checkpoints 2-4**

## 🔍 Verification Commands

```bash
# Test database connection
cd ~/clawd/projects/bible-verse-randomizer
npx ts-node database/connection-test.js

# Check verse count
psql $DATABASE_URL -c "SELECT COUNT(*) FROM verses;"

# Check translations populated
psql $DATABASE_URL -c "SELECT COUNT(text_kjv), COUNT(text_niv), COUNT(text_esv) FROM verses;"

# View sample verses
psql $DATABASE_URL -c "SELECT book, chapter, verse, LEFT(text_kjv, 50) FROM verses LIMIT 5;"
```

## 📁 File Structure

```
bible-verse-randomizer/
├── data/
│   ├── KJV.json           (✅ Downloaded - 12M)
│   ├── NIV.json           (✅ Downloaded - 6.6M)
│   ├── ESV.json           (✅ Downloaded - 11M)
│   ├── NLT.json           (✅ Downloaded - 7.1M)
│   ├── MSG.json           (✅ Downloaded - 6.6M)
│   └── NASB.json          (✅ Downloaded - 6.6M)
├── lib/
│   └── bible-api.ts       (✅ Created - API wrapper)
├── scripts/
│   ├── load-bible-data.ts (✅ Created - DB loader)
│   ├── generate-verse-content.ts (Needs ANTHROPIC_API_KEY)
│   └── batch-generate.ts  (Needs ANTHROPIC_API_KEY)
└── database/
    ├── schema.sql         (Ready to run)
    └── seed-verses.sql    (Ready to run)
```

## 💰 Cost Estimates

- **Supabase Free Tier:** 500MB database (enough for this project)
- **Supabase Pro:** $25/month (2GB database, recommended for production)
- **Anthropic API:** ~$5 for 1,000 verse generations (Claude Sonnet)
- **Vercel Pro:** $20/month (for deployment with ISR)

**Total Phase 2 Cost:** ~$5-10 for testing, ~$50/month for production
