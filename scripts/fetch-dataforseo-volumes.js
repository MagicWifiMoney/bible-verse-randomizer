#!/usr/bin/env node

/**
 * Fetch real search volume data from DataForSEO API
 * Updates topics-master.json with actual search volumes
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// DataForSEO credentials from environment
const DATAFORSEO_USERNAME = process.env.DATAFORSEO_USERNAME || 'jakegiebel@fermatcommerce.com';
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD || 'fdfa2690ca8fff85';

// Paths
const DATA_DIR = path.join(__dirname, '../data');
const TOPICS_FILE = path.join(DATA_DIR, 'topics-master.json');
const CACHE_FILE = path.join(DATA_DIR, 'search-volume-cache.json');

// Rate limiting
const BATCH_SIZE = 100; // DataForSEO allows up to 100 keywords per request
const DELAY_BETWEEN_BATCHES = 1000; // 1 second between batches

/**
 * Make API request to DataForSEO
 */
function makeDataForSEORequest(keywords) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify([{
      keywords: keywords,
      language_name: "English",
      location_code: 2840, // United States
      date_from: "2024-01-01",
      date_to: "2024-12-31"
    }]);

    const auth = Buffer.from(`${DATAFORSEO_USERNAME}:${DATAFORSEO_PASSWORD}`).toString('base64');

    const options = {
      hostname: 'api.dataforseo.com',
      port: 443,
      path: '/v3/keywords_data/google_ads/search_volume/live',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Sleep function for rate limiting
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Load existing cache if available
 */
function loadCache() {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    } catch (error) {
      console.warn('Warning: Could not load cache file:', error.message);
      return {};
    }
  }
  return {};
}

/**
 * Save cache
 */
function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

/**
 * Fetch search volumes for all topics
 */
async function fetchSearchVolumes() {
  console.log('📊 Fetching real search volume data from DataForSEO...\n');

  // Load topics
  const topics = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf8'));
  console.log(`Loaded ${topics.length} topics`);

  // Load cache
  const cache = loadCache();
  console.log(`Loaded ${Object.keys(cache).length} cached results\n`);

  // Prepare keywords (format: "bible verses about [topic]")
  const keywordsToFetch = [];
  const topicMap = new Map();

  for (const topic of topics) {
    const keyword = `bible verses about ${topic.title.toLowerCase()}`;
    if (!cache[keyword]) {
      keywordsToFetch.push(keyword);
    }
    topicMap.set(keyword, topic);
  }

  console.log(`Need to fetch ${keywordsToFetch.length} new keywords`);
  console.log(`Using ${Object.keys(cache).length} cached results\n`);

  // Fetch in batches
  for (let i = 0; i < keywordsToFetch.length; i += BATCH_SIZE) {
    const batch = keywordsToFetch.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(keywordsToFetch.length / BATCH_SIZE);

    console.log(`Fetching batch ${batchNum}/${totalBatches} (${batch.length} keywords)...`);

    try {
      const response = await makeDataForSEORequest(batch);

      if (response.status_code === 20000) {
        const results = response.tasks[0].result;
        
        if (results) {
          results.forEach(result => {
            cache[result.keyword] = {
              searchVolume: result.search_volume || 0,
              competition: result.competition || 0,
              cpc: result.cpc || 0
            };
          });
          console.log(`✓ Fetched ${results.length} results`);
          
          // Save cache after each batch
          saveCache(cache);
        }
      } else {
        console.error(`API Error: ${response.status_message}`);
        console.error('Response:', JSON.stringify(response, null, 2));
      }

      // Rate limiting
      if (i + BATCH_SIZE < keywordsToFetch.length) {
        console.log(`Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...\n`);
        await sleep(DELAY_BETWEEN_BATCHES);
      }

    } catch (error) {
      console.error(`Error fetching batch ${batchNum}:`, error.message);
      // Continue with next batch
    }
  }

  // Update topics with real data
  console.log('\n📝 Updating topics with real search volume data...\n');
  
  let updated = 0;
  let notFound = 0;

  for (const topic of topics) {
    const keyword = `bible verses about ${topic.title.toLowerCase()}`;
    const data = cache[keyword];

    if (data) {
      topic.searchVolume = data.searchVolume;
      topic.competition = Math.round(data.competition * 100); // Convert to 0-100 scale
      updated++;
    } else {
      console.warn(`⚠ No data found for: ${keyword}`);
      notFound++;
    }
  }

  // Sort by search volume (descending)
  topics.sort((a, b) => b.searchVolume - a.searchVolume);

  // Save updated topics
  fs.writeFileSync(TOPICS_FILE, JSON.stringify(topics, null, 2));

  // Generate statistics
  const stats = {
    totalTopics: topics.length,
    updated: updated,
    notFound: notFound,
    minSearchVolume: Math.min(...topics.map(t => t.searchVolume)),
    maxSearchVolume: Math.max(...topics.map(t => t.searchVolume)),
    avgSearchVolume: Math.round(topics.reduce((sum, t) => sum + t.searchVolume, 0) / topics.length),
    topicsAbove1000: topics.filter(t => t.searchVolume >= 1000).length,
    topicsAbove100: topics.filter(t => t.searchVolume >= 100).length,
    topicsBelow100: topics.filter(t => t.searchVolume < 100).length
  };

  console.log('\n✅ Update Complete!\n');
  console.log('Statistics:');
  console.log(`  Total topics: ${stats.totalTopics}`);
  console.log(`  Updated: ${stats.updated}`);
  console.log(`  Not found: ${stats.notFound}`);
  console.log(`  Min search volume: ${stats.minSearchVolume}/mo`);
  console.log(`  Max search volume: ${stats.maxSearchVolume}/mo`);
  console.log(`  Avg search volume: ${stats.avgSearchVolume}/mo`);
  console.log(`  Topics ≥1000/mo: ${stats.topicsAbove1000}`);
  console.log(`  Topics ≥100/mo: ${stats.topicsAbove100}`);
  console.log(`  Topics <100/mo: ${stats.topicsBelow100}`);

  // Display top 20
  console.log('\n🏆 Top 20 Topics by Search Volume:');
  topics.slice(0, 20).forEach((topic, i) => {
    console.log(`  ${i + 1}. ${topic.title} - ${topic.searchVolume.toLocaleString()}/mo (competition: ${topic.competition})`);
  });

  // Save summary
  const summaryPath = path.join(DATA_DIR, 'topics-master-summary.md');
  const summary = `# Bible Verse Topics Master List - DataForSEO Update

## Summary

**Total Topics:** ${stats.totalTopics}  
**Date Updated:** ${new Date().toISOString().split('T')[0]}  
**Source:** DataForSEO API (Real search volume data)  
**Minimum Search Volume:** ${stats.minSearchVolume}/month  
**Maximum Search Volume:** ${stats.maxSearchVolume}/month  
**Average Search Volume:** ${stats.avgSearchVolume}/month  

## Statistics

- **Topics ≥1000/mo:** ${stats.topicsAbove1000}
- **Topics ≥100/mo:** ${stats.topicsAbove100}
- **Topics <100/mo:** ${stats.topicsBelow100}

## Top 20 Topics by Search Volume

${topics.slice(0, 20).map((topic, i) => 
  `${i + 1}. **${topic.title}** - ${topic.searchVolume.toLocaleString()}/mo (competition: ${topic.competition})`
).join('\n')}

## Data Structure

Each topic includes:
- \`slug\`: URL-friendly identifier
- \`title\`: Display name
- \`searchVolume\`: Real monthly searches from DataForSEO
- \`competition\`: Competition score (0-100 scale)

## File Location

\`~/clawd/projects/bible-verse-randomizer/data/topics-master.json\`

---

**Data Source:** DataForSEO API  
**Last Updated:** ${new Date().toISOString()}  
**Query Format:** "bible verses about [topic]"
`;

  fs.writeFileSync(summaryPath, summary);
  console.log(`\n📄 Summary saved to: ${summaryPath}`);
  console.log(`💾 Topics saved to: ${TOPICS_FILE}`);
  console.log(`🗂️  Cache saved to: ${CACHE_FILE}\n`);
}

// Run the script
fetchSearchVolumes().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
