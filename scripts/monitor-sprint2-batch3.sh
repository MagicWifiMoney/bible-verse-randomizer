#!/bin/bash

# Monitor Sprint 2 Batch 3 Progress

PROGRESS_FILE="../data/sprint2-batch3-progress.json"
CHECKPOINT_FILE="../data/sprint2-batch3-checkpoint.json"

echo "📊 Sprint 2 Batch 3 Monitor"
echo "================================"
echo ""

if [ -f "$PROGRESS_FILE" ]; then
    echo "📈 Current Progress:"
    cat "$PROGRESS_FILE" | jq '{
        processed: .processed,
        total: .total,
        successful: .successful,
        failed: .failed,
        retries: .retries,
        rate_per_minute: .rate_per_minute,
        eta_minutes: .eta_minutes,
        timestamp: .timestamp
    }'
    echo ""
fi

if [ -f "$CHECKPOINT_FILE" ]; then
    echo "📍 Last Checkpoint:"
    cat "$CHECKPOINT_FILE" | jq '.'
    echo ""
fi

echo "💾 Database Status:"
docker exec bible-postgres psql -U postgres -d bible_verses -t -c \
    "SELECT COUNT(*) as completed FROM verses 
     WHERE id >= 1941 AND id <= 2910 
     AND context IS NOT NULL 
     AND meaning IS NOT NULL 
     AND application IS NOT NULL 
     AND prayer IS NOT NULL;" | xargs echo "Fully completed verses:"

docker exec bible-postgres psql -U postgres -d bible_verses -t -c \
    "SELECT COUNT(*) as total_with_faqs 
     FROM verses v 
     WHERE v.id >= 1941 AND v.id <= 2910 
     AND EXISTS (SELECT 1 FROM faqs WHERE entity_type='verse' AND entity_id=v.id);" | xargs echo "Verses with FAQs:"

echo ""
echo "📋 Recent log tail:"
echo "--------------------------------"
tail -20 ../logs/sprint2-batch3-*.log 2>/dev/null | tail -20
