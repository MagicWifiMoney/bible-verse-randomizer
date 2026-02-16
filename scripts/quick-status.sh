#!/bin/bash
# Quick Status Check for Sprint 2 Batch 1

PROGRESS_FILE="$HOME/clawd/projects/bible-verse-randomizer/data/sprint2-batch1-progress.json"

echo "📊 Sprint 2 Batch 1 - Quick Status"
echo "=================================="
echo ""

if [ -f "$PROGRESS_FILE" ]; then
    cat "$PROGRESS_FILE" | jq -r '
        "Progress: \(.processed)/\(.total) verses (\((.processed/.total*100)|floor)%)",
        "Success: \(.successful)",
        "Failed: \(.failed)",
        "Retries: \(.retries)",
        "Rate: \(.rate_per_minute) verses/min",
        "ETA: \(.eta_minutes) min",
        "Updated: \(.timestamp)"
    '
else
    echo "⏳ No progress data yet..."
fi

echo ""
echo "💾 Database:"
cd ~/clawd/projects/bible-verse-randomizer
node -e "
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
  const result = await pool.query('SELECT COUNT(*) as total FROM verses WHERE context IS NOT NULL AND meaning IS NOT NULL');
  console.log('Complete verses:', result.rows[0].total);
  await pool.end();
})().catch(e => console.log('Error:', e.message));
" 2>/dev/null
