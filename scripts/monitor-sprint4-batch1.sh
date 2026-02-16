#!/bin/bash

# Monitor Sprint 4 Batch 1 progress

PROGRESS_FILE="/home/ec2-user/clawd/projects/bible-verse-randomizer/data/sprint4-batch1-progress.json"
LOG_FILE="/home/ec2-user/clawd/projects/bible-verse-randomizer/logs/sprint4-batch1.log"

echo "=========================================="
echo "📊 SPRINT 4 BATCH 1 PROGRESS"
echo "=========================================="
echo ""

if [ -f "$PROGRESS_FILE" ]; then
  echo "📈 Stats from progress file:"
  cat "$PROGRESS_FILE" | jq '.'
  echo ""
fi

if [ -f "$LOG_FILE" ]; then
  echo "📝 Last 20 log lines:"
  tail -20 "$LOG_FILE"
  echo ""
fi

echo "🔍 Intent pages in database:"
psql $DATABASE_URL -c "SELECT COUNT(*) as total_intent_pages FROM intent_pages WHERE ai_generated_at IS NOT NULL;" 2>/dev/null || echo "  (Database query failed - table may not exist yet)"
echo ""

echo "📊 Recent intent pages:"
psql $DATABASE_URL -c "SELECT slug, title, search_volume, LENGTH(introduction) as intro_length, JSONB_ARRAY_LENGTH(faqs) as faq_count, created_at FROM intent_pages ORDER BY created_at DESC LIMIT 10;" 2>/dev/null || echo "  (No pages yet)"
echo ""

echo "✅ Monitor script complete"
echo "Run this script again to check progress"
