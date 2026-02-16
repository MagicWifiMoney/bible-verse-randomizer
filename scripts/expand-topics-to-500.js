#!/usr/bin/env node

/**
 * Expand topics list to 500+ unique topics
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const TOPICS_FILE = path.join(DATA_DIR, 'topics-master.json');

// Additional topics to reach 500+
const additionalTopics = [
  // Spiritual disciplines & practices
  "fasting", "meditation", "solitude", "silence", "simplicity", "submission",
  "study", "confession", "celebration", "service to others", "tithing",
  
  // More emotions & mental states
  "contentment", "jealousy", "envy", "shame", "regret", "disappointment",
  "frustration", "overwhelmed", "exhaustion", "burnout", "apathy",
  "confusion", "uncertainty", "indecision", "restlessness", "boredom",
  "resentment", "bitterness", "hatred", "rage", "wrath", "temper",
  
  // Character qualities
  "meekness", "gentleness", "self-control", "temperance", "moderation",
  "prudence", "wisdom in decision making", "discernment", "sound judgment",
  
  // Relationships & family
  "siblings", "brothers", "sisters", "grandparents", "grandchildren",
  "in-laws", "extended family", "blended families", "stepchildren",
  "single parents", "widows and widowers", "orphans and adoption",
  
  // Marriage & intimacy
  "husband", "wife", "spouse", "marital love", "sexual intimacy",
  "marriage covenant", "wedding", "engagement", "honeymoon",
  
  // Parenting stages
  "toddlers", "teenagers", "young adults", "adult children",
  "parenting adult children", "empty nest", "grandparenting",
  
  // Work & career specifics
  "business", "entrepreneurship", "workplace", "coworkers", "bosses",
  "employees", "unemployment", "job search", "retirement planning",
  "finances", "money management", "debt", "poverty mindset", "wealth",
  
  // Education & learning
  "education", "teaching", "learning", "students", "teachers",
  "wisdom and knowledge", "understanding", "instruction",
  
  // Health conditions
  "cancer diagnosis", "dementia", "Alzheimer's", "heart disease",
  "diabetes", "autoimmune disease", "infertility", "pregnancy complications",
  "postpartum depression", "menopause", "aging",
  
  // Mental health specifics
  "depression and anxiety", "bipolar disorder", "OCD", "panic attacks",
  "trauma recovery", "PTSD recovery", "suicidal thoughts", "self-harm",
  
  // Addictions & recovery
  "alcoholism", "drug addiction", "sexual addiction", "pornography",
  "gambling", "eating disorders recovery", "codependency", "recovery",
  
  // Life transitions
  "moving to new city", "changing churches", "job transition",
  "career change", "going to college", "becoming empty nester",
  "retirement transition", "downsizing", "relocation",
  
  // Grief & loss types
  "losing a parent", "losing a child", "losing a spouse",
  "miscarriage grief", "stillbirth", "infant loss", "suicide loss",
  "sudden death", "anticipated loss", "pet loss",
  
  // Social & cultural issues
  "racial reconciliation", "ethnic diversity", "cultural differences",
  "immigration issues", "refugees and asylum", "human trafficking",
  "slavery", "abortion", "euthanasia", "capital punishment",
  
  // Church & community
  "church leadership", "pastors", "elders", "deacons", "church unity",
  "church conflict", "leaving a church", "finding a church",
  "small groups", "accountability", "mentorship", "discipling others",
  
  // Spiritual warfare
  "demonic oppression", "spiritual attacks", "evil", "Satan",
  "spiritual protection", "armor of God", "deliverance",
  
  // End times & prophecy
  "second coming", "rapture", "tribulation", "millennium",
  "judgment day", "new heaven and earth", "eternity",
  
  // Biblical characters & stories
  "Abraham's faith", "Moses leadership", "David's psalms",
  "Solomon's wisdom", "Job's suffering", "Daniel's courage",
  "Esther's bravery", "Ruth's loyalty", "Mary's obedience",
  
  // Fruit of the Spirit
  "love (fruit)", "joy (fruit)", "peace (fruit)", "patience (fruit)",
  "kindness (fruit)", "goodness", "faithfulness (fruit)",
  "gentleness (fruit)", "self-control (fruit)",
  
  // Gifts of the Spirit
  "prophecy", "healing gifts", "miracles", "tongues", "interpretation",
  "word of wisdom", "word of knowledge", "discerning spirits",
  
  // Prayer types
  "intercessory prayer", "prayer of thanksgiving", "petition",
  "prayers for healing", "warfare prayers", "prayers for protection",
  
  // Worship & praise
  "adoration", "exaltation", "glorifying God", "magnifying the Lord",
  "singing praises", "instrumental worship", "corporate worship",
  
  // God's attributes
  "God's love", "God's grace", "God's mercy", "God's faithfulness",
  "God's justice", "God's holiness", "God's sovereignty",
  "God's omnipotence", "God's omniscience", "God's omnipresence",
  
  // Jesus's life & ministry
  "Jesus's birth", "Jesus's baptism", "Jesus's temptation",
  "Jesus's miracles", "Jesus's parables", "Jesus's crucifixion",
  "Jesus's resurrection", "Jesus's ascension",
  
  // Salvation & redemption
  "grace alone", "faith alone", "justification", "sanctification",
  "glorification", "regeneration", "adoption into God's family",
  
  // Sin & repentance
  "original sin", "sin nature", "confession of sin", "turning from sin",
  "godly sorrow", "worldly sorrow", "fruits of repentance",
  
  // Spiritual growth
  "growing in faith", "maturing in Christ", "spiritual maturity",
  "becoming Christlike", "transformation", "renewal",
  
  // Mission & evangelism
  "sharing the gospel", "witnessing", "soul winning",
  "making disciples", "missions work", "missionaries",
  
  // Stewardship
  "stewardship of time", "stewardship of talents",
  "stewardship of resources", "giving offerings", "tithes and offerings",
  
  // Nature & creation
  "nature", "creation", "animals", "environment", "seasons of life",
  "harvest time", "planting seeds", "reaping what you sow",
  
  // Weather & natural events
  "storms", "rain", "drought", "floods", "earthquakes", "fire",
  
  // Government & authority
  "government", "leaders", "kings", "rulers", "citizenship",
  "civil disobedience", "taxes", "voting",
  
  // Legal & justice
  "courts", "judges", "lawyers", "prison ministry", "injustice",
  "fairness", "equality", "rights",
  
  // Military & war
  "soldiers", "veterans", "military families", "war and peace",
  "peacekeeping", "conflict resolution",
  
  // Technology & modern life
  "technology", "social media", "internet", "phones",
  "digital age", "virtual relationships"
];

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleCase(text) {
  return text.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Load existing topics
const topics = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf8'));
console.log(`Current topics: ${topics.length}`);

// Get existing slugs to avoid duplicates
const existingSlugs = new Set(topics.map(t => t.slug));

// Add new topics
let added = 0;
for (const topicTitle of additionalTopics) {
  const slug = slugify(topicTitle);
  
  if (!existingSlugs.has(slug)) {
    topics.push({
      slug: slug,
      title: titleCase(topicTitle),
      searchVolume: 0, // Will be updated by DataForSEO
      competition: 0    // Will be updated by DataForSEO
    });
    existingSlugs.add(slug);
    added++;
  }
}

console.log(`Added ${added} new topics`);
console.log(`New total: ${topics.length} topics`);

// Save updated file
fs.writeFileSync(TOPICS_FILE, JSON.stringify(topics, null, 2));
console.log(`✅ Saved to ${TOPICS_FILE}`);
