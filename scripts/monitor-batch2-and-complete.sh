#!/bin/bash
# Monitor Sprint 2 Batch 2 and log completion to Mission Control

PROJECT_DIR="/home/ec2-user/clawd/projects/bible-verse-randomizer"
MC_DIR="/home/ec2-user/clawd/projects/mission-control"
TASK_ID="m97a97hfy4gavyyjzg6qkaz1vd818e9k"
START_TIME=$(date +%s)

echo "🔍 Monitoring Sprint 2 Batch 2..."
echo "Started at: $(date)"
echo ""

# Function to check if process is still running
is_running() {
    pgrep -f "sprint2-batch2-970.js" > /dev/null
}

# Function to get progress
get_progress() {
    if [ -f "$PROJECT_DIR/data/sprint2-batch2-progress.json" ]; then
        cat "$PROJECT_DIR/data/sprint2-batch2-progress.json"
    fi
}

# Monitor loop
while is_running; do
    sleep 300  # Check every 5 minutes
    
    # Show current progress
    PROGRESS=$(get_progress)
    if [ -n "$PROGRESS" ]; then
        PROCESSED=$(echo "$PROGRESS" | jq -r '.processed // 0')
        SUCCESSFUL=$(echo "$PROGRESS" | jq -r '.successful // 0')
        FAILED=$(echo "$PROGRESS" | jq -r '.failed // 0')
        
        echo "[$(date +'%H:%M')] Progress: $PROCESSED/970 | Success: $SUCCESSFUL | Failed: $FAILED"
    fi
done

echo ""
echo "✅ Process completed! Logging to Mission Control..."

# Calculate duration
END_TIME=$(date +%s)
DURATION_MS=$(( ($END_TIME - $START_TIME) * 1000 ))

# Get final stats
if [ -f "$PROJECT_DIR/data/sprint2-batch2-final.json" ]; then
    FINAL_STATS=$(cat "$PROJECT_DIR/data/sprint2-batch2-final.json")
    SUCCESSFUL=$(echo "$FINAL_STATS" | jq -r '.stats.successful // 0')
    FAILED=$(echo "$FINAL_STATS" | jq -r '.stats.failed // 0')
    
    # Determine status
    if [ "$FAILED" -eq 0 ]; then
        STATUS="completed"
        MESSAGE="Sprint 2 Batch 2: Successfully generated $SUCCESSFUL verse pages"
    elif [ "$SUCCESSFUL" -gt 900 ]; then
        STATUS="completed"
        MESSAGE="Sprint 2 Batch 2: Generated $SUCCESSFUL verse pages ($FAILED failed)"
    else
        STATUS="failed"
        MESSAGE="Sprint 2 Batch 2: Only $SUCCESSFUL successful ($FAILED failed)"
    fi
    
    # Log to Mission Control
    cd "$MC_DIR"
    node scripts/mc-log.js task.$STATUS mc-sprint2-batch2 "$MESSAGE" \
        --project bibleverserandomizer.com \
        --status "$STATUS" \
        --taskId "$TASK_ID" \
        --durationMs "$DURATION_MS" \
        --metadata "{\"batchNumber\":2,\"successful\":$SUCCESSFUL,\"failed\":$FAILED,\"verseRange\":\"971-1940\"}"
    
    echo "✅ Logged to Mission Control: $MESSAGE"
else
    # No final stats - something went wrong
    cd "$MC_DIR"
    node scripts/mc-log.js task.failed mc-sprint2-batch2 "Sprint 2 Batch 2: Process terminated without final stats" \
        --project bibleverserandomizer.com \
        --status failed \
        --taskId "$TASK_ID" \
        --durationMs "$DURATION_MS"
    
    echo "❌ Logged failure to Mission Control"
fi

echo ""
echo "📊 Final Report:"
echo "----------------"
cat "$PROJECT_DIR/data/sprint2-batch2-final.json" | jq -r '
    "   Total: \(.stats.total)",
    "   Successful: \(.stats.successful)",
    "   Failed: \(.stats.failed)",
    "   Retries: \(.stats.retries)",
    "   Duration: \(.stats.elapsed_seconds // 0)s"
' 2>/dev/null || echo "   No final stats available"
