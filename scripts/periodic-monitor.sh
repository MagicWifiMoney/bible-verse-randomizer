#!/bin/bash
# Periodic Monitor for Sprint 2 Batch 1
# Checks progress every 15 minutes and logs milestones

PROGRESS_FILE="$HOME/clawd/projects/bible-verse-randomizer/data/sprint2-batch1-progress.json"
MILESTONE_FILE="$HOME/clawd/projects/bible-verse-randomizer/data/sprint2-milestones.txt"
CHECK_INTERVAL=900  # 15 minutes

# Initialize milestone tracker
touch "$MILESTONE_FILE"

while true; do
    if [ -f "$PROGRESS_FILE" ]; then
        # Get current progress
        PROCESSED=$(cat "$PROGRESS_FILE" | jq -r '.processed // 0')
        SUCCESSFUL=$(cat "$PROGRESS_FILE" | jq -r '.successful // 0')
        TOTAL=$(cat "$PROGRESS_FILE" | jq -r '.total // 970')
        
        # Check if we've hit a 100-verse milestone
        if [ $((PROCESSED % 100)) -eq 0 ] && [ $PROCESSED -gt 0 ]; then
            MILESTONE="milestone_${PROCESSED}"
            
            # Check if we've already logged this milestone
            if ! grep -q "$MILESTONE" "$MILESTONE_FILE" 2>/dev/null; then
                echo "$MILESTONE" >> "$MILESTONE_FILE"
                
                # Log to Mission Control
                cd ~/clawd
                node scripts/mc-log task.progress outreach-agent \
                    "Sprint 2 Batch 1: ${PROCESSED}/${TOTAL} verses completed (${SUCCESSFUL} successful)" \
                    --project bible-verse-randomizer \
                    --status running
                
                echo "[$(date)] Logged milestone: ${PROCESSED}/${TOTAL} verses"
            fi
        fi
        
        # Check if complete
        if [ "$PROCESSED" -eq "$TOTAL" ] && [ $SUCCESSFUL -gt 0 ]; then
            if ! grep -q "COMPLETE" "$MILESTONE_FILE" 2>/dev/null; then
                echo "COMPLETE" >> "$MILESTONE_FILE"
                
                # Log completion to Mission Control
                cd ~/clawd
                node scripts/mc-log task.completed outreach-agent \
                    "Sprint 2 Batch 1 complete - ${SUCCESSFUL}/${TOTAL} verses generated" \
                    --project bible-verse-randomizer \
                    --status completed
                
                echo "[$(date)] ✅ BATCH COMPLETE! ${SUCCESSFUL}/${TOTAL} verses generated"
                
                # Exit monitoring
                exit 0
            fi
        fi
    fi
    
    # Wait before next check
    sleep $CHECK_INTERVAL
done
