#!/bin/bash
# Quick progress check for Sprint 2 Batch 2

echo "📊 Sprint 2 Batch 2 - Progress Report"
echo "======================================"
echo ""

# Check if progress file exists
if [ -f "../data/sprint2-batch2-progress.json" ]; then
    echo "📁 Latest Progress Data:"
    cat ../data/sprint2-batch2-progress.json | jq -r '
      "   Processed: \(.processed)/\(.total) verses (\((.processed/.total*100)|floor)%)",
      "   Successful: \(.successful)",
      "   Failed: \(.failed)",
      "   Retries: \(.retries)",
      "   Rate: \(.rate_per_minute) verses/min",
      "   ETA: \(.eta_minutes) minutes",
      "   Elapsed: \(.elapsed_seconds)s",
      "   Est. Cost: $\((.successful * 0.06)|floor)"
    '
    echo ""
fi

# Check if checkpoint exists
if [ -f "../data/sprint2-batch2-checkpoint.json" ]; then
    echo "📍 Last Checkpoint:"
    cat ../data/sprint2-batch2-checkpoint.json | jq -r '"   Last verse: \(.lastVerse) (index \(.lastIndex))"'
    echo ""
fi

# Check process status
if pgrep -f "sprint2-batch2-970.js" > /dev/null; then
    echo "✅ Process Status: RUNNING"
    echo "   PID: $(pgrep -f 'sprint2-batch2-970.js')"
else
    echo "❌ Process Status: NOT RUNNING"
fi

echo ""
echo "📜 Last 10 log lines:"
echo "--------------------"
tail -10 ../sprint2-batch2-output.log

echo ""
echo "💡 Commands:"
echo "   Full log: tail -f ~/clawd/projects/bible-verse-randomizer/sprint2-batch2-output.log"
echo "   Progress: cat ~/clawd/projects/bible-verse-randomizer/data/sprint2-batch2-progress.json | jq"
