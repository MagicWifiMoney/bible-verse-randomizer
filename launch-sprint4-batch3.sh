#!/bin/bash

echo "🚀 Launching Sprint 4 Batch 3: Intent-Verse Associations (835-1250)"
echo "=================================================="
echo ""
echo "Batch size: 416 intents"
echo "Estimated time: 45-60 minutes"
echo "Output log: logs/sprint4-batch3-$(date +%Y%m%d-%H%M%S).log"
echo ""

# Create logs directory if it doesn't exist
mkdir -p logs

# Launch in background with logging
cd ~/clawd/projects/bible-verse-randomizer
nohup node scripts/sprint4-batch3-835-1250.js > logs/sprint4-batch3-$(date +%Y%m%d-%H%M%S).log 2>&1 &

# Get the PID
PID=$!
echo "Process started with PID: $PID"
echo "$PID" > logs/sprint4-batch3.pid

echo ""
echo "✅ Batch job launched!"
echo ""
echo "Monitor progress:"
echo "  tail -f logs/sprint4-batch3-*.log"
echo ""
echo "Check progress file:"
echo "  cat data/sprint4-batch3-progress.json"
echo ""
echo "Kill if needed:"
echo "  kill $PID"
echo ""
