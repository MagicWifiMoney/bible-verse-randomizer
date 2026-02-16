#!/usr/bin/env node

/**
 * Fix competition values - convert from text to numeric
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const TOPICS_FILE = path.join(DATA_DIR, 'topics-master.json');
const CACHE_FILE = path.join(DATA_DIR, 'search-volume-cache.json');

// Load data
const topics = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf8'));
const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));

// Competition mapping
const competitionMap = {
  'LOW': 25,
  'MEDIUM': 50,
  'HIGH': 75
};

console.log('Fixing competition values...\n');

let fixed = 0;
for (const topic of topics) {
  const keyword = `bible verses about ${topic.title.toLowerCase()}`;
  const data = cache[keyword];
  
  if (data && data.competition) {
    const competitionText = data.competition.toString().toUpperCase();
    topic.competition = competitionMap[competitionText] || 50;
    fixed++;
  } else if (topic.searchVolume > 0) {
    // Estimate based on search volume if no data
    if (topic.searchVolume >= 10000) topic.competition = 75;
    else if (topic.searchVolume >= 1000) topic.competition = 50;
    else topic.competition = 25;
    fixed++;
  }
}

// Save updated topics
fs.writeFileSync(TOPICS_FILE, JSON.stringify(topics, null, 2));

console.log(`✅ Fixed ${fixed} competition values`);
console.log(`💾 Saved to ${TOPICS_FILE}\n`);

// Show sample
console.log('Sample data:');
topics.slice(0, 5).forEach(t => {
  console.log(`  ${t.title}: ${t.searchVolume.toLocaleString()}/mo (competition: ${t.competition})`);
});
