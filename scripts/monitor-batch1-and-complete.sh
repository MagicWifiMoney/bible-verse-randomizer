#!/bin/bash
# Monitor Sprint 2 Batch 1 and auto-log completion to Mission Control

MC_TASK_ID="j5706rsshj026bq6938te9psss819cgv"
BATCH_NUM=1
TARGET_VERSES=970
PROJECT_DIR="/home/ec2-user/clawd/projects/bible-verse-randomizer"
MC_DIR="/home/ec2-user/clawd/projects/mission-control"
LOG_FILE="$PROJECT_DIR/sprint2-batch1-output.log"
MONITOR_LOG="$PROJECT_DIR/logs/monitor-batch1.log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Monitor started for Sprint 2 Batch 1" >> "$MONITOR_LOG"

while true; do
  # Check if the main process is still running
  if ! pgrep -f "sprint2-batch1-970.js" > /dev/null && ! pgrep -f "sprint2-batch1-enhanced.js" > /dev/null; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Batch process no longer running. Checking completion..." >> "$MONITOR_LOG"
    
    # Give it a moment to finish writing
    sleep 5
    
    # Count completed verses from database
    COMPLETED=$(cd "$PROJECT_DIR" && node -e "
      const { Pool } = require('pg');
      const pool = new Pool({ connectionString: 'postgresql://postgres:biblepass123@localhost:5433/bible_verses' });
      pool.query(\"SELECT COUNT(*) as count FROM verses WHERE context IS NOT NULL AND context != '' AND updated_at > NOW() - INTERVAL '2 hours'\")
        .then(r => { console.log(r.rows[0].count); return pool.end(); })
        .catch(e => { console.error('0'); pool.end(); });
    " 2>/dev/null)
    
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Completed verses: $COMPLETED / $TARGET_VERSES" >> "$MONITOR_LOG"
    
    # Determine success level
    if [ "$COMPLETED" -ge 900 ]; then
      # Success (>90%)
      SUCCESS_RATE=$(echo "scale=1; $COMPLETED * 100 / $TARGET_VERSES" | bc)
      cd "$MC_DIR" && node scripts/mc-log.js task.completed mc-s2b1-v2 \
        "Sprint 2 Batch 1: Successfully generated $COMPLETED verse pages (${SUCCESS_RATE}%)" \
        --project bibleverserandomizer.com \
        --taskId "$MC_TASK_ID" \
        --status completed \
        --metadata "{\"batchNumber\":1,\"completedVerses\":$COMPLETED,\"targetVerses\":$TARGET_VERSES,\"successRate\":${SUCCESS_RATE}}"
      
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Logged successful completion to MC" >> "$MONITOR_LOG"
      
    elif [ "$COMPLETED" -gt 0 ]; then
      # Partial success
      FAILED=$((TARGET_VERSES - COMPLETED))
      cd "$MC_DIR" && node scripts/mc-log.js task.completed mc-s2b1-v2 \
        "Sprint 2 Batch 1: Generated $COMPLETED verse pages ($FAILED failed)" \
        --project bibleverserandomizer.com \
        --taskId "$MC_TASK_ID" \
        --status completed \
        --metadata "{\"batchNumber\":1,\"completedVerses\":$COMPLETED,\"failedVerses\":$FAILED,\"targetVerses\":$TARGET_VERSES}"
      
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  Logged partial completion to MC" >> "$MONITOR_LOG"
      
    else
      # Failure
      cd "$MC_DIR" && node scripts/mc-log.js task.failed mc-s2b1-v2 \
        "Sprint 2 Batch 1: Process terminated without generating verses" \
        --project bibleverserandomizer.com \
        --taskId "$MC_TASK_ID" \
        --status failed \
        --metadata "{\"batchNumber\":1,\"error\":\"No verses generated\"}"
      
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Logged failure to MC" >> "$MONITOR_LOG"
    fi
    
    exit 0
  fi
  
  # Still running - sleep for 5 minutes
  sleep 300
done
