#!/bin/bash
# Monitor Sprint 2 Batch 1 Progress

PROGRESS_FILE="$HOME/clawd/projects/bible-verse-randomizer/data/sprint2-batch1-progress.json"
LOG_FILE="$HOME/clawd/projects/bible-verse-randomizer/sprint2-batch1-output.log"

echo "📊 Sprint 2 Batch 1 - Progress Monitor"
echo "======================================"
echo ""

# Check if progress file exists
if [ -f "$PROGRESS_FILE" ]; then
    echo "📈 Latest Progress:"
    cat "$PROGRESS_FILE" | jq -r '
        "   Processed: \(.processed)/\(.total) (\((.processed/.total*100)|floor)%)",
        "   Successful: \(.successful)",
        "   Failed: \(.failed)",
        "   Retries: \(.retries)",
        "   Rate: \(.rate_per_minute) verses/min",
        "   ETA: \(.eta_minutes) minutes",
        "   Updated: \(.timestamp)"
    '
    echo ""
else
    echo "⏳ Progress file not yet created..."
    echo ""
fi

# Show last 30 lines of log
echo "📝 Recent Activity (last 30 lines):"
echo "-----------------------------------"
tail -n 30 "$LOG_FILE" 2>/dev/null || echo "Log file not found"
echo ""

# Database check
echo "💾 Database Status:"
cd ~/clawd/projects/bible-verse-randomizer
node -e "
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  const result = await pool.query(\`
    SELECT COUNT(*) as total 
    FROM verses 
    WHERE context IS NOT NULL 
    AND meaning IS NOT NULL 
    AND application IS NOT NULL 
    AND prayer IS NOT NULL
  \`);
  console.log('   Verses with complete AI content:', result.rows[0].total);
  await pool.end();
})().catch(console.error);
"
