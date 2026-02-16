#!/bin/bash
# Master monitoring dashboard for all Bible verse generation

clear
echo "════════════════════════════════════════════════════════════════"
echo "   📖 BIBLE VERSE RANDOMIZER - MASTER DASHBOARD"
echo "════════════════════════════════════════════════════════════════"
echo ""
date
echo ""

echo "📊 ACTIVE PROCESSES:"
echo "-------------------"
ACTIVE=$(ps aux | grep -E "sprint.*\.js" | grep -v grep | wc -l)
echo "Total active: $ACTIVE"
echo ""
ps aux | grep -E "sprint.*\.js" | grep -v grep | awk '{print "  •", $12, $13}' | sort -u
echo ""

echo "📈 SPRINT 2 (VERSES) - Progress:"
echo "--------------------------------"
for i in 1 2 3 8; do
  LOG=~/clawd/projects/bible-verse-randomizer/sprint2-batch${i}-output.log
  if [ -f "$LOG" ]; then
    LATEST=$(tail -1 "$LOG" 2>/dev/null | head -c 100)
    echo "  Batch $i: $LATEST"
  fi
done
echo ""

echo "🔍 SPRINT 3/4/5 (TOPICS/INTENTS/BOOKS):"
echo "---------------------------------------"
find ~/clawd/projects/bible-verse-randomizer -name "sprint[345]*.log" -o -name "*topic*.log" -o -name "*intent*.log" 2>/dev/null | while read log; do
  NAME=$(basename "$log")
  LATEST=$(tail -1 "$log" 2>/dev/null | head -c 80)
  echo "  $NAME: $LATEST"
done
echo ""

echo "💾 OUTPUT FILES:"
echo "----------------"
echo "  Topics: $(find ~/clawd/projects/bible-verse-randomizer/output/topics -name "*.json" 2>/dev/null | wc -l) files"
echo "  Intents: $(find ~/clawd/projects/bible-verse-randomizer/output/intents -name "*.json" 2>/dev/null | wc -l) files"
echo "  Books: $(find ~/clawd/projects/bible-verse-randomizer/output/books -name "*.json" 2>/dev/null | wc -l) files"
echo ""

echo "🎯 TARGET: 11,839 pages (7,775 verses + 2,500 topics + 1,250 intents + 314 books)"
echo ""
echo "🔄 Auto-refresh: bash $0"
