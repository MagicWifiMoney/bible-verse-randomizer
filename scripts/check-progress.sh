#!/bin/bash

cd ~/clawd/projects/bible-verse-randomizer

echo "📊 Batch Generation Progress Report"
echo "===================================="
echo ""

if [ -f output/batch-checkpoint.json ]; then
  echo "Checkpoint Status:"
  cat output/batch-checkpoint.json | jq '{
    "Total Processed": .lastProcessed,
    "Total Generated": .totalGenerated,
    "Total Failed": .totalFailed,
    "Progress": "\(.lastProcessed)/1000 (\((.lastProcessed / 1000 * 100 | floor))%)",
    "Last Updated": .timestamp
  }'
  echo ""
fi

TOTAL_VERSES=$(jq 'keys | length' lib/verses-data.json 2>/dev/null || echo "0")
echo "Total verses in database: $TOTAL_VERSES"
echo ""

echo "Recent activity (last 10 lines):"
tail -10 output/batch-generation.log 2>/dev/null || echo "No log file found"
