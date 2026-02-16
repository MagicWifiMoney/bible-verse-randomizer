#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// DataForSEO credentials (check environment variables)
const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;

if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
  console.error('Error: DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD environment variables required');
  process.exit(1);
}

// Comprehensive topic categories
const topics = [
  // Emotions (50+)
  'love', 'joy', 'peace', 'hope', 'faith', 'trust', 'fear', 'anxiety', 'worry', 'stress',
  'anger', 'grief', 'sadness', 'depression', 'loneliness', 'happiness', 'contentment', 'gratitude',
  'patience', 'kindness', 'goodness', 'faithfulness', 'gentleness', 'self-control', 'courage',
  'comfort', 'encouragement', 'inspiration', 'motivation', 'strength', 'perseverance', 'endurance',
  'doubt', 'confusion', 'disappointment', 'discouragement', 'despair', 'guilt', 'shame', 'regret',
  'jealousy', 'envy', 'pride', 'humility', 'compassion', 'mercy', 'forgiveness', 'grace',
  'bitterness', 'resentment', 'hatred',
  
  // Life Events (60+)
  'death', 'loss', 'funeral', 'mourning', 'bereavement', 'suicide', 'miscarriage', 'stillbirth',
  'birth', 'pregnancy', 'adoption', 'new baby', 'marriage', 'wedding', 'anniversary', 'engagement',
  'divorce', 'separation', 'breakup', 'dating', 'singleness', 'relationships', 'friendship',
  'graduation', 'new job', 'retirement', 'unemployment', 'job loss', 'career change', 'promotion',
  'moving', 'relocation', 'homesickness', 'travel', 'journey', 'transition', 'new beginnings',
  'illness', 'sickness', 'disease', 'cancer', 'hospital', 'surgery', 'healing', 'recovery',
  'disability', 'chronic illness', 'mental illness', 'addiction', 'alcoholism', 'drug abuse',
  'trials', 'suffering', 'persecution', 'injustice', 'oppression', 'poverty', 'homelessness',
  'financial crisis', 'debt', 'bankruptcy', 'natural disaster', 'crisis', 'emergency',
  
  // Relationships (40+)
  'parenting', 'motherhood', 'fatherhood', 'children', 'teenagers', 'toddlers', 'infants',
  'family', 'parents', 'siblings', 'grandparents', 'in-laws', 'blended family', 'step-parenting',
  'marriage problems', 'infidelity', 'betrayal', 'reconciliation', 'conflict', 'arguments',
  'communication', 'intimacy', 'sex', 'purity', 'sexual sin', 'temptation', 'lust',
  'neighbors', 'coworkers', 'enemies', 'difficult people', 'toxic relationships', 'abuse',
  'domestic violence', 'bullying', 'gossip', 'slander', 'criticism', 'judgment',
  
  // Spiritual Life (60+)
  'prayer', 'worship', 'praise', 'thanksgiving', 'repentance', 'confession', 'salvation',
  'redemption', 'sanctification', 'spiritual growth', 'discipleship', 'obedience', 'surrender',
  'surrender to God', 'seeking God', 'knowing God', 'loving God', 'trusting God', 'fearing God',
  'Holy Spirit', 'baptism', 'communion', 'church', 'fellowship', 'community', 'unity',
  'service', 'ministry', 'calling', 'purpose', 'mission', 'evangelism', 'witnessing',
  'spiritual warfare', 'spiritual armor', 'demons', 'Satan', 'evil', 'darkness', 'victory',
  'sin', 'righteousness', 'holiness', 'purity', 'integrity', 'character', 'virtue',
  'wisdom', 'knowledge', 'understanding', 'discernment', 'guidance', 'direction', 'will of God',
  'Bible study', 'Scripture', 'Word of God', 'meditation', 'fasting', 'solitude', 'silence',
  
  // Virtues & Character (30+)
  'truthfulness', 'honesty', 'loyalty', 'faithfulness', 'reliability', 'dependability',
  'generosity', 'hospitality', 'selflessness', 'sacrifice', 'servanthood', 'stewardship',
  'responsibility', 'accountability', 'discipline', 'diligence', 'hard work', 'excellence',
  'modesty', 'meekness', 'gentleness', 'calmness', 'restraint', 'temperance', 'sobriety',
  'justice', 'fairness', 'equality', 'righteousness', 'goodness',
  
  // Struggles & Challenges (40+)
  'temptation', 'sin', 'backsliding', 'waywardness', 'rebellion', 'disobedience', 'stubbornness',
  'unbelief', 'atheism', 'skepticism', 'doubt', 'questioning faith', 'crisis of faith',
  'spiritual dryness', 'spiritual desert', 'dark night of the soul', 'feeling far from God',
  'unanswered prayer', 'delayed answers', 'waiting on God', 'waiting', 'impatience',
  'burnout', 'exhaustion', 'weariness', 'fatigue', 'overwhelmed', 'overworked',
  'comparison', 'insecurity', 'low self-esteem', 'self-worth', 'identity', 'purpose',
  'materialism', 'greed', 'covetousness', 'money', 'wealth', 'prosperity', 'success', 'failure',
  
  // Seasons & Holidays (20+)
  'Christmas', 'Easter', 'Advent', 'Lent', 'Good Friday', 'Palm Sunday', 'Pentecost',
  'Thanksgiving', 'New Year', 'birthdays', 'celebrations', 'festivals', 'sabbath', 'Sunday',
  'spring', 'summer', 'fall', 'winter', 'seasons of life', 'harvest',
  
  // Work & Calling (20+)
  'work', 'employment', 'labor', 'career', 'vocation', 'calling', 'purpose', 'meaning',
  'success', 'achievement', 'ambition', 'goals', 'dreams', 'vision', 'plans',
  'rest', 'sabbath rest', 'balance', 'work-life balance', 'boundaries',
  
  // Social Issues (30+)
  'racism', 'discrimination', 'injustice', 'inequality', 'oppression', 'slavery', 'freedom',
  'politics', 'government', 'authority', 'citizenship', 'voting', 'leadership', 'power',
  'war', 'violence', 'terrorism', 'crime', 'prison', 'incarceration', 'justice system',
  'refugees', 'immigration', 'xenophobia', 'nationalism', 'patriotism',
  'environment', 'creation care', 'stewardship of earth', 'climate',
  
  // Age Groups (10+)
  'youth', 'young adults', 'college students', 'adults', 'middle age', 'elderly', 'seniors',
  'aging', 'old age', 'retirement years',
  
  // Specific Life Situations (30+)
  'loneliness in marriage', 'single parenting', 'empty nest', 'prodigal child', 'wayward child',
  'special needs parenting', 'caregiving', 'caring for elderly parents', 'widowhood', 'widow',
  'military deployment', 'military families', 'veterans', 'PTSD', 'trauma',
  'infertility', 'childlessness', 'foster care', 'orphans', 'adoption journey',
  'chronic pain', 'terminal illness', 'end of life', 'hospice', 'palliative care',
  'prison ministry', 'incarceration', 'reentry', 'halfway house', 'homelessness recovery',
  
  // Biblical Themes (40+)
  'covenant', 'promise', 'blessing', 'inheritance', 'kingdom of God', 'heaven', 'eternal life',
  'hell', 'judgment', 'second coming', 'end times', 'prophecy', 'rapture', 'resurrection',
  'Trinity', 'God the Father', 'Jesus Christ', 'Messiah', 'Savior', 'Lord', 'King',
  'Holy Spirit', 'angels', 'miracles', 'supernatural', 'signs and wonders', 'healing miracles',
  'deliverance', 'freedom', 'liberation', 'exodus', 'promised land', 'wilderness', 'desert',
  'manna', 'provision', 'Sabbath', 'law', 'commandments', 'gospel', 'good news', 'testimony',
];

// Generate search queries for "bible verses about [topic]"
const queries = topics.map(topic => `bible verses about ${topic}`);

// Function to call DataForSEO API
async function getSearchVolumes(keywords) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify([{
      keywords: keywords,
      language_code: 'en',
      location_code: 2840, // United States
      include_serp_info: false
    }]);

    const auth = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64');

    const options = {
      hostname: 'api.dataforseo.com',
      path: '/v3/keywords_data/google_ads/search_volume/live',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Process in batches to avoid API limits
async function processBatches(queries, batchSize = 100) {
  const results = [];
  
  for (let i = 0; i < queries.length; i += batchSize) {
    const batch = queries.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(queries.length / batchSize)}...`);
    
    try {
      const response = await getSearchVolumes(batch);
      
      if (response.tasks && response.tasks[0] && response.tasks[0].result) {
        results.push(...response.tasks[0].result);
      }
      
      // Rate limiting: wait 1 second between batches
      if (i + batchSize < queries.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Error processing batch: ${error.message}`);
    }
  }
  
  return results;
}

// Main execution
(async () => {
  console.log(`Generating topic list for ${topics.length} topics...`);
  console.log(`Fetching search volume data from DataForSEO...`);
  
  try {
    const volumeData = await processBatches(queries);
    
    // Map results to topic objects
    const topicList = volumeData
      .map((item, index) => {
        const topic = topics[index];
        const searchVolume = item.search_volume || 0;
        const competition = item.competition || 0;
        
        return {
          slug: topic.toLowerCase().replace(/\s+/g, '-'),
          title: topic.charAt(0).toUpperCase() + topic.slice(1),
          searchVolume: searchVolume,
          competition: competition
        };
      })
      .filter(item => item.searchVolume > 100) // Only include topics with >100 monthly searches
      .sort((a, b) => b.searchVolume - a.searchVolume); // Sort by search volume descending
    
    // Remove duplicates by slug
    const uniqueTopics = Array.from(
      new Map(topicList.map(item => [item.slug, item])).values()
    );
    
    console.log(`Generated ${uniqueTopics.length} topics with searchVolume > 100/mo`);
    
    if (uniqueTopics.length < 500) {
      console.warn(`Warning: Only ${uniqueTopics.length} topics met the criteria. May need to add more seed topics.`);
    }
    
    // Write to output file
    const outputPath = path.join(process.env.HOME, 'clawd/projects/bible-verse-randomizer/data/topics-master.json');
    fs.writeFileSync(outputPath, JSON.stringify(uniqueTopics, null, 2));
    
    console.log(`✓ Topics written to: ${outputPath}`);
    console.log(`✓ Total topics: ${uniqueTopics.length}`);
    console.log(`✓ Average search volume: ${Math.round(uniqueTopics.reduce((sum, t) => sum + t.searchVolume, 0) / uniqueTopics.length)}`);
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
})();
