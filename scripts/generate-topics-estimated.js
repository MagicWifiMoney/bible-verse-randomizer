#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Comprehensive topic categories with estimated search volumes
// Based on common patterns: popular emotions (1000-10K), holidays (5K-50K), niche topics (100-500)

const topicCategories = {
  // High-volume emotions & core concepts (1000-10000/mo)
  highVolume: [
    { topic: 'love', estimate: 8900 },
    { topic: 'faith', estimate: 7200 },
    { topic: 'hope', estimate: 6500 },
    { topic: 'peace', estimate: 5800 },
    { topic: 'strength', estimate: 5200 },
    { topic: 'trust', estimate: 4800 },
    { topic: 'forgiveness', estimate: 4500 },
    { topic: 'fear', estimate: 4200 },
    { topic: 'patience', estimate: 3800 },
    { topic: 'courage', estimate: 3500 },
    { topic: 'wisdom', estimate: 3200 },
    { topic: 'joy', estimate: 3000 },
    { topic: 'prayer', estimate: 2800 },
    { topic: 'healing', estimate: 2600 },
    { topic: 'grace', estimate: 2400 },
  ],
  
  // Holiday/seasonal topics (5000-50000/mo)
  holidays: [
    { topic: 'Christmas', estimate: 45000 },
    { topic: 'Easter', estimate: 38000 },
    { topic: 'Thanksgiving', estimate: 12000 },
    { topic: 'Advent', estimate: 8500 },
    { topic: 'Lent', estimate: 6200 },
    { topic: 'Good Friday', estimate: 5800 },
    { topic: 'Palm Sunday', estimate: 4200 },
    { topic: 'Pentecost', estimate: 2800 },
    { topic: 'New Year', estimate: 3500 },
  ],
  
  // Medium-volume emotions & struggles (500-2000/mo)
  mediumVolume: [
    { topic: 'anxiety', estimate: 1900 },
    { topic: 'worry', estimate: 1800 },
    { topic: 'depression', estimate: 1700 },
    { topic: 'grief', estimate: 1600 },
    { topic: 'stress', estimate: 1500 },
    { topic: 'loneliness', estimate: 1400 },
    { topic: 'anger', estimate: 1300 },
    { topic: 'sadness', estimate: 1200 },
    { topic: 'comfort', estimate: 1100 },
    { topic: 'encouragement', estimate: 1000 },
    { topic: 'perseverance', estimate: 950 },
    { topic: 'guidance', estimate: 900 },
    { topic: 'protection', estimate: 850 },
    { topic: 'blessing', estimate: 800 },
    { topic: 'mercy', estimate: 750 },
    { topic: 'kindness', estimate: 700 },
    { topic: 'humility', estimate: 650 },
    { topic: 'gratitude', estimate: 600 },
    { topic: 'obedience', estimate: 580 },
    { topic: 'salvation', estimate: 560 },
  ],
  
  // Life events (300-1500/mo)
  lifeEvents: [
    { topic: 'death', estimate: 1400 },
    { topic: 'marriage', estimate: 1300 },
    { topic: 'parenting', estimate: 1200 },
    { topic: 'loss', estimate: 1100 },
    { topic: 'suffering', estimate: 1000 },
    { topic: 'sickness', estimate: 900 },
    { topic: 'divorce', estimate: 850 },
    { topic: 'pregnancy', estimate: 800 },
    { topic: 'illness', estimate: 750 },
    { topic: 'funeral', estimate: 700 },
    { topic: 'wedding', estimate: 650 },
    { topic: 'birthday', estimate: 600 },
    { topic: 'graduation', estimate: 550 },
    { topic: 'retirement', estimate: 500 },
    { topic: 'new job', estimate: 480 },
    { topic: 'moving', estimate: 460 },
    { topic: 'job loss', estimate: 440 },
    { topic: 'unemployment', estimate: 420 },
    { topic: 'miscarriage', estimate: 400 },
    { topic: 'adoption', estimate: 380 },
    { topic: 'infertility', estimate: 360 },
    { topic: 'surgery', estimate: 340 },
    { topic: 'cancer', estimate: 320 },
    { topic: 'addiction', estimate: 300 },
  ],
  
  // Relationships (200-1000/mo)
  relationships: [
    { topic: 'family', estimate: 950 },
    { topic: 'friendship', estimate: 900 },
    { topic: 'children', estimate: 850 },
    { topic: 'motherhood', estimate: 800 },
    { topic: 'fatherhood', estimate: 750 },
    { topic: 'marriage problems', estimate: 700 },
    { topic: 'relationships', estimate: 650 },
    { topic: 'dating', estimate: 600 },
    { topic: 'singleness', estimate: 550 },
    { topic: 'parents', estimate: 500 },
    { topic: 'teenagers', estimate: 480 },
    { topic: 'enemies', estimate: 460 },
    { topic: 'reconciliation', estimate: 440 },
    { topic: 'conflict', estimate: 420 },
    { topic: 'betrayal', estimate: 400 },
    { topic: 'infidelity', estimate: 380 },
    { topic: 'toxic relationships', estimate: 360 },
    { topic: 'difficult people', estimate: 340 },
    { topic: 'gossip', estimate: 320 },
    { topic: 'neighbors', estimate: 300 },
    { topic: 'siblings', estimate: 280 },
    { topic: 'grandparents', estimate: 260 },
    { topic: 'in-laws', estimate: 240 },
    { topic: 'step-parenting', estimate: 220 },
    { topic: 'single parenting', estimate: 200 },
  ],
  
  // Spiritual life (200-800/mo)
  spiritual: [
    { topic: 'worship', estimate: 780 },
    { topic: 'praise', estimate: 760 },
    { topic: 'salvation', estimate: 740 },
    { topic: 'repentance', estimate: 720 },
    { topic: 'Holy Spirit', estimate: 700 },
    { topic: 'spiritual growth', estimate: 680 },
    { topic: 'purpose', estimate: 660 },
    { topic: 'calling', estimate: 640 },
    { topic: 'mission', estimate: 620 },
    { topic: 'evangelism', estimate: 600 },
    { topic: 'discipleship', estimate: 580 },
    { topic: 'baptism', estimate: 560 },
    { topic: 'communion', estimate: 540 },
    { topic: 'church', estimate: 520 },
    { topic: 'fellowship', estimate: 500 },
    { topic: 'service', estimate: 480 },
    { topic: 'ministry', estimate: 460 },
    { topic: 'testimony', estimate: 440 },
    { topic: 'witness', estimate: 420 },
    { topic: 'spiritual warfare', estimate: 400 },
    { topic: 'temptation', estimate: 380 },
    { topic: 'sin', estimate: 360 },
    { topic: 'holiness', estimate: 340 },
    { topic: 'righteousness', estimate: 320 },
    { topic: 'sanctification', estimate: 300 },
    { topic: 'redemption', estimate: 280 },
    { topic: 'surrender', estimate: 260 },
    { topic: 'fasting', estimate: 240 },
    { topic: 'meditation', estimate: 220 },
    { topic: 'Bible study', estimate: 200 },
  ],
  
  // Virtues & character (150-500/mo)
  virtues: [
    { topic: 'integrity', estimate: 480 },
    { topic: 'honesty', estimate: 460 },
    { topic: 'faithfulness', estimate: 440 },
    { topic: 'loyalty', estimate: 420 },
    { topic: 'goodness', estimate: 400 },
    { topic: 'gentleness', estimate: 380 },
    { topic: 'self-control', estimate: 360 },
    { topic: 'generosity', estimate: 340 },
    { topic: 'compassion', estimate: 320 },
    { topic: 'servanthood', estimate: 300 },
    { topic: 'sacrifice', estimate: 280 },
    { topic: 'selflessness', estimate: 260 },
    { topic: 'stewardship', estimate: 240 },
    { topic: 'discipline', estimate: 220 },
    { topic: 'diligence', estimate: 200 },
    { topic: 'excellence', estimate: 180 },
    { topic: 'responsibility', estimate: 160 },
    { topic: 'accountability', estimate: 150 },
  ],
  
  // Specific struggles (150-400/mo)
  struggles: [
    { topic: 'doubt', estimate: 380 },
    { topic: 'fear of death', estimate: 360 },
    { topic: 'guilt', estimate: 340 },
    { topic: 'shame', estimate: 320 },
    { topic: 'bitterness', estimate: 300 },
    { topic: 'resentment', estimate: 280 },
    { topic: 'hatred', estimate: 260 },
    { topic: 'jealousy', estimate: 240 },
    { topic: 'envy', estimate: 220 },
    { topic: 'pride', estimate: 200 },
    { topic: 'greed', estimate: 180 },
    { topic: 'lust', estimate: 160 },
    { topic: 'comparison', estimate: 150 },
    { topic: 'insecurity', estimate: 380 },
    { topic: 'self-worth', estimate: 360 },
    { topic: 'identity', estimate: 340 },
    { topic: 'burnout', estimate: 320 },
    { topic: 'exhaustion', estimate: 300 },
    { topic: 'weariness', estimate: 280 },
    { topic: 'overwhelmed', estimate: 260 },
    { topic: 'disappointment', estimate: 240 },
    { topic: 'discouragement', estimate: 220 },
    { topic: 'despair', estimate: 200 },
    { topic: 'hopelessness', estimate: 180 },
    { topic: 'confusion', estimate: 160 },
    { topic: 'uncertainty', estimate: 150 },
  ],
  
  // Work & calling (150-400/mo)
  work: [
    { topic: 'work', estimate: 380 },
    { topic: 'career', estimate: 360 },
    { topic: 'success', estimate: 340 },
    { topic: 'failure', estimate: 320 },
    { topic: 'goals', estimate: 300 },
    { topic: 'dreams', estimate: 280 },
    { topic: 'vision', estimate: 260 },
    { topic: 'ambition', estimate: 240 },
    { topic: 'achievement', estimate: 220 },
    { topic: 'rest', estimate: 200 },
    { topic: 'balance', estimate: 180 },
    { topic: 'boundaries', estimate: 160 },
    { topic: 'leadership', estimate: 150 },
  ],
  
  // More specific topics (100-300/mo)
  specific: [
    { topic: 'contentment', estimate: 290 },
    { topic: 'thankfulness', estimate: 280 },
    { topic: 'prosperity', estimate: 270 },
    { topic: 'provision', estimate: 260 },
    { topic: 'financial blessing', estimate: 250 },
    { topic: 'money', estimate: 240 },
    { topic: 'wealth', estimate: 230 },
    { topic: 'poverty', estimate: 220 },
    { topic: 'debt', estimate: 210 },
    { topic: 'giving', estimate: 200 },
    { topic: 'tithing', estimate: 190 },
    { topic: 'injustice', estimate: 180 },
    { topic: 'oppression', estimate: 170 },
    { topic: 'freedom', estimate: 160 },
    { topic: 'justice', estimate: 150 },
    { topic: 'equality', estimate: 140 },
    { topic: 'racism', estimate: 130 },
    { topic: 'discrimination', estimate: 120 },
    { topic: 'politics', estimate: 110 },
    { topic: 'government', estimate: 100 },
    
    // More emotions
    { topic: 'happiness', estimate: 290 },
    { topic: 'contentment', estimate: 280 },
    { topic: 'satisfaction', estimate: 270 },
    { topic: 'regret', estimate: 260 },
    { topic: 'remorse', estimate: 250 },
    { topic: 'sorrow', estimate: 240 },
    { topic: 'mourning', estimate: 230 },
    { topic: 'bereavement', estimate: 220 },
    { topic: 'trauma', estimate: 210 },
    { topic: 'PTSD', estimate: 200 },
    { topic: 'mental health', estimate: 190 },
    { topic: 'mental illness', estimate: 180 },
    { topic: 'chronic illness', estimate: 170 },
    { topic: 'chronic pain', estimate: 160 },
    { topic: 'disability', estimate: 150 },
    { topic: 'terminal illness', estimate: 140 },
    { topic: 'hospice', estimate: 130 },
    { topic: 'end of life', estimate: 120 },
    { topic: 'widowhood', estimate: 110 },
    { topic: 'widow', estimate: 100 },
    
    // More life situations
    { topic: 'empty nest', estimate: 280 },
    { topic: 'prodigal son', estimate: 270 },
    { topic: 'wayward child', estimate: 260 },
    { topic: 'rebellious child', estimate: 250 },
    { topic: 'special needs parenting', estimate: 240 },
    { topic: 'caregiving', estimate: 230 },
    { topic: 'caring for elderly parents', estimate: 220 },
    { topic: 'aging parents', estimate: 210 },
    { topic: 'aging', estimate: 200 },
    { topic: 'elderly', estimate: 190 },
    { topic: 'seniors', estimate: 180 },
    { topic: 'old age', estimate: 170 },
    { topic: 'youth', estimate: 160 },
    { topic: 'young adults', estimate: 150 },
    { topic: 'college students', estimate: 140 },
    { topic: 'teenagers faith', estimate: 130 },
    { topic: 'toddlers', estimate: 120 },
    { topic: 'infants', estimate: 110 },
    { topic: 'new baby', estimate: 100 },
    
    // More relationships
    { topic: 'engagement', estimate: 280 },
    { topic: 'anniversary', estimate: 270 },
    { topic: 'intimacy', estimate: 260 },
    { topic: 'sex in marriage', estimate: 250 },
    { topic: 'purity', estimate: 240 },
    { topic: 'sexual sin', estimate: 230 },
    { topic: 'pornography', estimate: 220 },
    { topic: 'lust battle', estimate: 210 },
    { topic: 'temptation sexual', estimate: 200 },
    { topic: 'breakup', estimate: 190 },
    { topic: 'separation', estimate: 180 },
    { topic: 'blended family', estimate: 170 },
    { topic: 'coworkers', estimate: 160 },
    { topic: 'workplace', estimate: 150 },
    { topic: 'boss', estimate: 140 },
    { topic: 'authority', estimate: 130 },
    { topic: 'submission', estimate: 120 },
    { topic: 'rebellion', estimate: 110 },
    { topic: 'disobedience', estimate: 100 },
    
    // More spiritual topics
    { topic: 'seeking God', estimate: 290 },
    { topic: 'knowing God', estimate: 280 },
    { topic: 'loving God', estimate: 270 },
    { topic: 'trusting God', estimate: 260 },
    { topic: 'fearing God', estimate: 250 },
    { topic: 'obeying God', estimate: 240 },
    { topic: 'serving God', estimate: 230 },
    { topic: 'following God', estimate: 220 },
    { topic: 'pleasing God', estimate: 210 },
    { topic: 'worshiping God', estimate: 200 },
    { topic: 'waiting on God', estimate: 190 },
    { topic: 'trusting God timing', estimate: 180 },
    { topic: 'God timing', estimate: 170 },
    { topic: 'divine timing', estimate: 160 },
    { topic: 'patience waiting', estimate: 150 },
    { topic: 'delayed answers', estimate: 140 },
    { topic: 'unanswered prayer', estimate: 130 },
    { topic: 'why God silent', estimate: 120 },
    { topic: 'feeling far from God', estimate: 110 },
    { topic: 'spiritual dryness', estimate: 100 },
    
    // Biblical themes
    { topic: 'heaven', estimate: 290 },
    { topic: 'eternal life', estimate: 280 },
    { topic: 'second coming', estimate: 270 },
    { topic: 'rapture', estimate: 260 },
    { topic: 'end times', estimate: 250 },
    { topic: 'prophecy', estimate: 240 },
    { topic: 'resurrection', estimate: 230 },
    { topic: 'judgment day', estimate: 220 },
    { topic: 'hell', estimate: 210 },
    { topic: 'angels', estimate: 200 },
    { topic: 'demons', estimate: 190 },
    { topic: 'Satan', estimate: 180 },
    { topic: 'spiritual battle', estimate: 170 },
    { topic: 'spiritual armor', estimate: 160 },
    { topic: 'victory', estimate: 150 },
    { topic: 'overcoming', estimate: 140 },
    { topic: 'deliverance', estimate: 130 },
    { topic: 'miracles', estimate: 120 },
    { topic: 'supernatural', estimate: 110 },
    { topic: 'signs and wonders', estimate: 100 },
    
    // More biblical themes
    { topic: 'Trinity', estimate: 280 },
    { topic: 'God the Father', estimate: 270 },
    { topic: 'Jesus Christ', estimate: 260 },
    { topic: 'Messiah', estimate: 250 },
    { topic: 'Savior', estimate: 240 },
    { topic: 'Lord', estimate: 230 },
    { topic: 'King of Kings', estimate: 220 },
    { topic: 'covenant', estimate: 210 },
    { topic: 'promise', estimate: 200 },
    { topic: 'inheritance', estimate: 190 },
    { topic: 'kingdom of God', estimate: 180 },
    { topic: 'gospel', estimate: 170 },
    { topic: 'good news', estimate: 160 },
    { topic: 'commandments', estimate: 150 },
    { topic: 'law', estimate: 140 },
    { topic: 'Ten Commandments', estimate: 130 },
    { topic: 'wilderness', estimate: 120 },
    { topic: 'desert', estimate: 110 },
    { topic: 'promised land', estimate: 100 },
    
    // More work/life
    { topic: 'employment', estimate: 280 },
    { topic: 'labor', estimate: 270 },
    { topic: 'vocation', estimate: 260 },
    { topic: 'occupation', estimate: 250 },
    { topic: 'promotion', estimate: 240 },
    { topic: 'career change', estimate: 230 },
    { topic: 'new season', estimate: 220 },
    { topic: 'transition', estimate: 210 },
    { topic: 'change', estimate: 200 },
    { topic: 'new beginnings', estimate: 190 },
    { topic: 'fresh start', estimate: 180 },
    { topic: 'starting over', estimate: 170 },
    { topic: 'second chances', estimate: 160 },
    { topic: 'redemption story', estimate: 150 },
    { topic: 'restoration', estimate: 140 },
    { topic: 'renewal', estimate: 130 },
    { topic: 'revival', estimate: 120 },
    { topic: 'awakening', estimate: 110 },
    { topic: 'transformation', estimate: 100 },
    
    // More struggles & challenges
    { topic: 'backsliding', estimate: 270 },
    { topic: 'waywardness', estimate: 260 },
    { topic: 'stubbornness', estimate: 250 },
    { topic: 'hard heart', estimate: 240 },
    { topic: 'unbelief', estimate: 230 },
    { topic: 'skepticism', estimate: 220 },
    { topic: 'questioning faith', estimate: 210 },
    { topic: 'crisis of faith', estimate: 200 },
    { topic: 'spiritual desert', estimate: 190 },
    { topic: 'dark night of soul', estimate: 180 },
    { topic: 'feeling abandoned', estimate: 170 },
    { topic: 'impatience', estimate: 160 },
    { topic: 'restlessness', estimate: 150 },
    { topic: 'discontentment', estimate: 140 },
    { topic: 'complaining', estimate: 130 },
    { topic: 'murmuring', estimate: 120 },
    { topic: 'ingratitude', estimate: 110 },
    { topic: 'entitlement', estimate: 100 },
    
    // Social issues
    { topic: 'war', estimate: 260 },
    { topic: 'peace on earth', estimate: 250 },
    { topic: 'violence', estimate: 240 },
    { topic: 'terrorism', estimate: 230 },
    { topic: 'crime', estimate: 220 },
    { topic: 'prison', estimate: 210 },
    { topic: 'incarceration', estimate: 200 },
    { topic: 'justice system', estimate: 190 },
    { topic: 'refugees', estimate: 180 },
    { topic: 'immigration', estimate: 170 },
    { topic: 'homeless', estimate: 160 },
    { topic: 'homelessness', estimate: 150 },
    { topic: 'hunger', estimate: 140 },
    { topic: 'thirst', estimate: 130 },
    { topic: 'orphans', estimate: 120 },
    { topic: 'widows', estimate: 110 },
    { topic: 'vulnerable', estimate: 100 },
    
    // More seasons
    { topic: 'spring', estimate: 250 },
    { topic: 'summer', estimate: 240 },
    { topic: 'fall', estimate: 230 },
    { topic: 'autumn', estimate: 220 },
    { topic: 'winter', estimate: 210 },
    { topic: 'harvest', estimate: 200 },
    { topic: 'planting', estimate: 190 },
    { topic: 'reaping', estimate: 180 },
    { topic: 'sowing', estimate: 170 },
    { topic: 'growth', estimate: 160 },
    { topic: 'fruit', estimate: 150 },
    { topic: 'fruitfulness', estimate: 140 },
    { topic: 'productivity', estimate: 130 },
    { topic: 'abundance', estimate: 120 },
    { topic: 'overflow', estimate: 110 },
    { topic: 'blessing overflow', estimate: 100 },
    
    // Additional virtues
    { topic: 'meekness', estimate: 240 },
    { topic: 'modesty', estimate: 230 },
    { topic: 'temperance', estimate: 220 },
    { topic: 'sobriety', estimate: 210 },
    { topic: 'prudence', estimate: 200 },
    { topic: 'justice virtue', estimate: 190 },
    { topic: 'fortitude', estimate: 180 },
    { topic: 'boldness', estimate: 170 },
    { topic: 'bravery', estimate: 160 },
    { topic: 'valor', estimate: 150 },
    { topic: 'heroism', estimate: 140 },
    { topic: 'nobility', estimate: 130 },
    { topic: 'dignity', estimate: 120 },
    { topic: 'honor', estimate: 110 },
    { topic: 'respect', estimate: 100 },
    
    // Additional specific scenarios
    { topic: 'military deployment', estimate: 230 },
    { topic: 'military families', estimate: 220 },
    { topic: 'veterans', estimate: 210 },
    { topic: 'soldiers', estimate: 200 },
    { topic: 'foster care', estimate: 190 },
    { topic: 'foster parents', estimate: 180 },
    { topic: 'childlessness', estimate: 170 },
    { topic: 'barrenness', estimate: 160 },
    { topic: 'stillbirth', estimate: 150 },
    { topic: 'infant loss', estimate: 140 },
    { topic: 'child loss', estimate: 130 },
    { topic: 'sibling loss', estimate: 120 },
    { topic: 'parent loss', estimate: 110 },
    { topic: 'spouse loss', estimate: 100 },
    
    // More emotions & states
    { topic: 'panic', estimate: 220 },
    { topic: 'terror', estimate: 210 },
    { topic: 'dread', estimate: 200 },
    { topic: 'apprehension', estimate: 190 },
    { topic: 'nervousness', estimate: 180 },
    { topic: 'timidity', estimate: 170 },
    { topic: 'shyness', estimate: 160 },
    { topic: 'boldness needed', estimate: 150 },
    { topic: 'confidence', estimate: 140 },
    { topic: 'assurance', estimate: 130 },
    { topic: 'certainty', estimate: 120 },
    { topic: 'conviction', estimate: 110 },
    { topic: 'determination', estimate: 100 },
    
    // More relationships & family
    { topic: 'sons', estimate: 210 },
    { topic: 'daughters', estimate: 200 },
    { topic: 'husband', estimate: 190 },
    { topic: 'wife', estimate: 180 },
    { topic: 'spouse', estimate: 170 },
    { topic: 'grandchildren', estimate: 160 },
    { topic: 'nephew', estimate: 150 },
    { topic: 'niece', estimate: 140 },
    { topic: 'cousins', estimate: 130 },
    { topic: 'aunts', estimate: 120 },
    { topic: 'uncles', estimate: 110 },
    { topic: 'extended family', estimate: 100 },
    
    // Environment & creation
    { topic: 'creation', estimate: 200 },
    { topic: 'nature', estimate: 190 },
    { topic: 'environment', estimate: 180 },
    { topic: 'earth', estimate: 170 },
    { topic: 'animals', estimate: 160 },
    { topic: 'pets', estimate: 150 },
    { topic: 'stewardship of creation', estimate: 140 },
    { topic: 'caring for earth', estimate: 130 },
    { topic: 'ecology', estimate: 120 },
    { topic: 'sustainability', estimate: 110 },
    { topic: 'green living', estimate: 100 },
  ],
};

// Flatten all topics into a single array
const allTopics = [];
for (const [category, topics] of Object.entries(topicCategories)) {
  allTopics.push(...topics);
}

// Generate topic objects with slug, title, searchVolume, competition
const topicList = allTopics.map(item => {
  const slug = item.topic.toLowerCase().replace(/\s+/g, '-');
  const title = item.topic.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  // Estimate competition based on search volume
  // Higher volume = higher competition (0.0-1.0 scale)
  let competition;
  if (item.estimate >= 5000) competition = 0.85 + Math.random() * 0.15; // 0.85-1.0
  else if (item.estimate >= 1000) competition = 0.60 + Math.random() * 0.25; // 0.60-0.85
  else if (item.estimate >= 500) competition = 0.40 + Math.random() * 0.20; // 0.40-0.60
  else competition = 0.20 + Math.random() * 0.20; // 0.20-0.40
  
  return {
    slug,
    title,
    searchVolume: item.estimate,
    competition: parseFloat(competition.toFixed(2))
  };
});

// Remove any duplicates by slug
const uniqueTopics = Array.from(
  new Map(topicList.map(item => [item.slug, item])).values()
);

// Sort by search volume descending
uniqueTopics.sort((a, b) => b.searchVolume - a.searchVolume);

console.log(`Generated ${uniqueTopics.length} unique topics`);
console.log(`Topics with searchVolume > 100: ${uniqueTopics.filter(t => t.searchVolume > 100).length}`);
console.log(`Average search volume: ${Math.round(uniqueTopics.reduce((sum, t) => sum + t.searchVolume, 0) / uniqueTopics.length)}`);

// Write to output file
const outputPath = path.join(process.env.HOME, 'clawd/projects/bible-verse-randomizer/data/topics-master.json');
fs.writeFileSync(outputPath, JSON.stringify(uniqueTopics, null, 2));

console.log(`\n✓ Topics written to: ${outputPath}`);
console.log(`✓ Total topics: ${uniqueTopics.length}`);
console.log(`✓ Min search volume: ${Math.min(...uniqueTopics.map(t => t.searchVolume))}`);
console.log(`✓ Max search volume: ${Math.max(...uniqueTopics.map(t => t.searchVolume))}`);
console.log(`\nNOTE: Search volumes are estimates. For actual DataForSEO data, add credentials to .env.local:`);
console.log(`DATAFORSEO_LOGIN=your_login`);
console.log(`DATAFORSEO_PASSWORD=your_password`);
