#!/bin/bash

# Monitor and Report - Checks progress every hour and logs it

REPORT_FILE=~/clawd/projects/bible-verse-randomizer/output/progress-reports.log
cd ~/clawd/projects/bible-verse-randomizer

while true; do
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
  
  echo "============================================================" | tee -a "$REPORT_FILE"
  echo "Progress Check: $TIMESTAMP" | tee -a "$REPORT_FILE"
  echo "============================================================" | tee -a "$REPORT_FILE"
  
  if [ -f output/batch-checkpoint.json ]; then
    PROCESSED=$(cat output/batch-checkpoint.json | jq -r '.lastProcessed')
    GENERATED=$(cat output/batch-checkpoint.json | jq -r '.totalGenerated')
    FAILED=$(cat output/batch-checkpoint.json | jq -r '.totalFailed')
    PERCENT=$(echo "scale=1; $PROCESSED * 100 / 1000" | bc)
    
    echo "Progress: $PROCESSED/1000 ($PERCENT%)" | tee -a "$REPORT_FILE"
    echo "Generated: $GENERATED | Failed: $FAILED" | tee -a "$REPORT_FILE"
    
    # Calculate ETA
    if [ $PROCESSED -gt 0 ]; then
      ELAPSED_SEC=$(($(date +%s) - $(date -d "2026-02-16 22:44:00" +%s)))
      AVG_SEC_PER_VERSE=$(echo "scale=1; $ELAPSED_SEC / $PROCESSED" | bc)
      REMAINING_VERSES=$((1000 - $PROCESSED))
      REMAINING_SEC=$(echo "scale=0; $REMAINING_VERSES * $AVG_SEC_PER_VERSE" | bc)
      REMAINING_HOURS=$(echo "scale=1; $REMAINING_SEC / 3600" | bc)
      
      echo "Average: ${AVG_SEC_PER_VERSE}s per verse" | tee -a "$REPORT_FILE"
      echo "ETA: ~${REMAINING_HOURS} hours remaining" | tee -a "$REPORT_FILE"
    fi
  else
    echo "No checkpoint file found - process may not have started" | tee -a "$REPORT_FILE"
  fi
  
  echo "" | tee -a "$REPORT_FILE"
  
  # Sleep for 1 hour
  sleep 3600
done
