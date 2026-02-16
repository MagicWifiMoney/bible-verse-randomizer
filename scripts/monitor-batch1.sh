#!/bin/bash

# Monitor Sprint 2 Batch 1 Progress

echo "📊 Sprint 2 Batch 1 - Progress Monitor"
echo "======================================"
echo ""

# Check if process is running
if ps aux | grep -v grep | grep "sprint2-batch1-enhanced.js" > /dev/null; then
    echo "✅ Process Status: RUNNING"
else
    echo "❌ Process Status: STOPPED"
fi

echo ""

# Show progress file if it exists
if [ -f "../data/sprint2-batch1-progress.json" ]; then
    echo "📈 Current Progress:"
    cat ../data/sprint2-batch1-progress.json | jq -r '
        "   Processed: \(.processed)/\(.total) (\((.processed/.total*100)|floor)%)",
        "   Successful: \(.successful)",
        "   Failed: \(.failed)",
        "   Retries: \(.retries)",
        "   Rate: \(.rate_per_minute) verses/min",
        "   ETA: \(.eta_minutes) min (\((.eta_minutes/60)|floor)h \((.eta_minutes%60)|floor)m)",
        "   Cost so far: $\(.totalCost|tostring|.[0:5])",
        "   Last updated: \(.timestamp)"
    ' 2>/dev/null || echo "   (Progress file not yet created)"
else
    echo "⏳ Progress file not yet created (processing first verse...)"
fi

echo ""

# Show latest log lines
echo "📝 Latest Activity (last 10 lines):"
tail -10 logs/sprint2-batch1-*.log 2>/dev/null | tail -10 || echo "   (No logs yet)"

echo ""
echo "======================================"
echo "Run this script again to see updated progress"
echo "Or tail logs: tail -f logs/sprint2-batch1-*.log"
