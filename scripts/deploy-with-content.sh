#!/bin/bash
# Deploy Bible Verse Randomizer with all generated content
# Run this after generation is complete

set -e
cd ~/clawd/projects/bible-verse-randomizer

echo "🚀 Bible Verse Randomizer - Deployment Script"
echo "=============================================="

# 1. Check DB is running
echo "📊 Step 1: Checking database..."
psql postgresql://postgres:biblepass123@localhost:5433/bible_verses -c "
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN context IS NOT NULL AND context != '' THEN 1 END) as with_content,
  ROUND(COUNT(CASE WHEN context IS NOT NULL AND context != '' THEN 1 END) * 100.0 / COUNT(*), 1) as pct
FROM verses;" 2>&1

# 2. Export all content from DB to JSON files
echo ""
echo "📁 Step 2: Exporting DB content to JSON files..."
node scripts/export-verses-to-json.js 2>&1

# 3. Count JSON files
VERSE_COUNT=$(ls data/verses/*.json 2>/dev/null | wc -l)
echo ""
echo "✅ $VERSE_COUNT JSON files ready"

# 4. Git add all files
echo ""
echo "📤 Step 3: Committing to git..."
git add data/verses/ lib/verse-data-db.ts scripts/
git add -u  # stage modified files

COMMIT_MSG="feat: Add AI content for $VERSE_COUNT verse pages (programmatic SEO)"
git commit -m "$COMMIT_MSG" || echo "Nothing new to commit"

# 5. Push to GitHub (triggers Vercel auto-deploy)
echo ""
echo "🚀 Step 4: Pushing to GitHub..."
git push origin master

echo ""
echo "✅ Deployment initiated!"
echo "📊 Vercel will auto-deploy: https://vercel.com/jacobs-projects-cf4c7bdb/bible-verse-randomizer"
echo "🌐 Live site: https://bibleverserandomizer.com"
echo ""
echo "Monitor deployment: npx vercel --prod (if needed)"
