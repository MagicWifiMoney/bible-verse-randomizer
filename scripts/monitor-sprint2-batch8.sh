#!/bin/bash

# Monitor Sprint 2 Batch 8 Progress

CHECKPOINT_FILE="$HOME/clawd/projects/bible-verse-randomizer/data/sprint2-batch8-checkpoint.json"
PROGRESS_FILE="$HOME/clawd/projects/bible-verse-randomizer/data/sprint2-batch8-progress.json"
LOG_FILE="$HOME/clawd/projects/bible-verse-randomizer/sprint2-batch8-output.log"

clear
echo "=============================================="
echo "  SPRINT 2 BATCH 8/8 PROGRESS MONITOR (FINAL)"
echo "=============================================="
echo ""

# Check if running
if pgrep -f "sprint2-batch8-985.js" > /dev/null; then
    echo "✅ Status: RUNNING"
    echo "   PID: $(pgrep -f 'sprint2-batch8-985.js')"
else
    echo "⚠️  Status: NOT RUNNING"
fi

echo ""

# Show checkpoint
if [ -f "$CHECKPOINT_FILE" ]; then
    echo "📍 Checkpoint:"
    cat "$CHECKPOINT_FILE"
else
    echo "⚠️  No checkpoint file found"
fi

echo ""

# Show progress
if [ -f "$PROGRESS_FILE" ]; then
    echo "📊 Progress:"
    cat "$PROGRESS_FILE"
else
    echo "⚠️  No progress file found"
fi

echo ""

# Show recent log output
if [ -f "$LOG_FILE" ]; then
    echo "📝 Recent log (last 30 lines):"
    echo "----------------------------------------"
    tail -30 "$LOG_FILE"
else
    echo "⚠️  No log file found"
fi

echo ""
echo "=============================================="
echo "Commands:"
echo "  watch -n 60 $0        # Auto-refresh every minute"
echo "  tail -f $LOG_FILE     # Follow live log"
echo "=============================================="
