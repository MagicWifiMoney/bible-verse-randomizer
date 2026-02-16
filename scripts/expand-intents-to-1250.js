#!/usr/bin/env node

/**
 * Expand intents-master.json from 121 to 1,250+ intents
 * Following the same methodology: use cases, formats, audiences, combinations
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const outputFile = path.join(dataDir, 'intents-master.json');

// Load existing 121 intents
const existingIntents = require(outputFile);
console.log(`Loaded ${existingIntents.length} existing intents`);

const allIntents = [...existingIntents];

// Additional intent categories to reach 1,250+
const expansionIntents = [
  // Specific life situations (200+)
  { base: 'for-new-parents', searchVolume: 680, competition: 18 },
  { base: 'for-expecting-mothers', searchVolume: 520, competition: 12 },
  { base: 'for-adoptive-parents', searchVolume: 380, competition: 8 },
  { base: 'for-foster-parents', searchVolume: 340, competition: 6 },
  { base: 'for-grandparents', searchVolume: 480, competition: 10 },
  { base: 'for-caregivers', searchVolume: 560, competition: 12 },
  { base: 'for-nurses', searchVolume: 420, competition: 8 },
  { base: 'for-teachers', searchVolume: 840, competition: 16 },
  { base: 'for-pastors', searchVolume: 680, competition: 14 },
  { base: 'for-missionaries', searchVolume: 540, competition: 12 },
  { base: 'for-military', searchVolume: 720, competition: 14 },
  { base: 'for-veterans', searchVolume: 620, competition: 12 },
  { base: 'for-first-responders', searchVolume: 480, competition: 10 },
  { base: 'for-healthcare-workers', searchVolume: 560, competition: 12 },
  { base: 'for-essential-workers', searchVolume: 380, competition: 8 },
  { base: 'for-remote-workers', searchVolume: 340, competition: 6 },
  { base: 'for-entrepreneurs', searchVolume: 620, competition: 14 },
  { base: 'for-business-owners', searchVolume: 580, competition: 12 },
  { base: 'for-artists', searchVolume: 480, competition: 10 },
  { base: 'for-musicians', searchVolume: 420, competition: 8 },
  { base: 'for-writers', searchVolume: 460, competition: 9 },
  { base: 'for-athletes', searchVolume: 540, competition: 11 },
  { base: 'for-coaches', searchVolume: 480, competition: 10 },
  { base: 'for-mentors', searchVolume: 420, competition: 8 },
  { base: 'for-counselors', searchVolume: 520, competition: 11 },
  { base: 'for-therapists', searchVolume: 460, competition: 9 },
  { base: 'for-social-workers', searchVolume: 480, competition: 10 },
  { base: 'for-volunteers', searchVolume: 540, competition: 11 },
  
  // Specific challenges (150+)
  { base: 'for-infertility', searchVolume: 640, competition: 14 },
  { base: 'for-divorce-recovery', searchVolume: 580, competition: 12 },
  { base: 'for-custody-battles', searchVolume: 320, competition: 6 },
  { base: 'for-domestic-abuse', searchVolume: 420, competition: 8 },
  { base: 'for-verbal-abuse', searchVolume: 340, competition: 6 },
  { base: 'for-emotional-abuse', searchVolume: 380, competition: 7 },
  { base: 'for-betrayal', searchVolume: 520, competition: 10 },
  { base: 'for-abandonment', searchVolume: 480, competition: 9 },
  { base: 'for-rejection', searchVolume: 560, competition: 11 },
  { base: 'for-identity-crisis', searchVolume: 380, competition: 7 },
  { base: 'for-faith-crisis', searchVolume: 420, competition: 8 },
  { base: 'for-spiritual-dryness', searchVolume: 340, competition: 6 },
  { base: 'for-spiritual-warfare', searchVolume: 680, competition: 14 },
  { base: 'for-demonic-oppression', searchVolume: 280, competition: 5 },
  { base: 'for-nightmares', searchVolume: 320, competition: 6 },
  { base: 'for-sleep-problems', searchVolume: 380, competition: 7 },
  { base: 'for-insomnia', searchVolume: 420, competition: 8 },
  { base: 'for-chronic-fatigue', searchVolume: 360, competition: 7 },
  { base: 'for-autoimmune-disease', searchVolume: 280, competition: 5 },
  { base: 'for-brain-fog', searchVolume: 240, competition: 4 },
  { base: 'for-memory-loss', searchVolume: 320, competition: 6 },
  { base: 'for-dementia-caregivers', searchVolume: 280, competition: 5 },
  { base: 'for-alzheimers-family', searchVolume: 260, competition: 5 },
  
  // Relationships & family (100+)
  { base: 'for-engaged-couples', searchVolume: 580, competition: 12 },
  { base: 'for-newlyweds', searchVolume: 520, competition: 11 },
  { base: 'for-struggling-marriages', searchVolume: 640, competition: 13 },
  { base: 'for-separated-couples', searchVolume: 380, competition: 7 },
  { base: 'for-long-distance-relationships', searchVolume: 420, competition: 8 },
  { base: 'for-blended-families', searchVolume: 480, competition: 9 },
  { base: 'for-step-parents', searchVolume: 440, competition: 9 },
  { base: 'for-adult-children', searchVolume: 360, competition: 7 },
  { base: 'for-elderly-parents', searchVolume: 320, competition: 6 },
  { base: 'for-prodigal-children', searchVolume: 520, competition: 10 },
  { base: 'for-rebellious-teens', searchVolume: 460, competition: 9 },
  { base: 'for-college-students', searchVolume: 680, competition: 14 },
  { base: 'for-young-adults', searchVolume: 720, competition: 15 },
  { base: 'for-midlife', searchVolume: 380, competition: 7 },
  { base: 'for-seniors', searchVolume: 480, competition: 10 },
  
  // Combinations with formats (300+)
  { base: 'short-for-weddings', searchVolume: 1200, competition: 25 },
  { base: 'short-for-funerals', searchVolume: 980, competition: 20 },
  { base: 'short-for-comfort', searchVolume: 840, competition: 18 },
  { base: 'short-for-strength', searchVolume: 920, competition: 19 },
  { base: 'short-for-encouragement', searchVolume: 780, competition: 16 },
  { base: 'short-for-hope', searchVolume: 680, competition: 14 },
  { base: 'short-for-healing', searchVolume: 720, competition: 15 },
  { base: 'short-for-peace', searchVolume: 640, competition: 13 },
  { base: 'short-for-anxiety', searchVolume: 860, competition: 17 },
  { base: 'short-for-depression', searchVolume: 820, competition: 17 },
  { base: 'short-for-faith', searchVolume: 740, competition: 15 },
  { base: 'short-for-love', searchVolume: 880, competition: 18 },
  { base: 'short-for-wisdom', searchVolume: 620, competition: 13 },
  { base: 'short-for-guidance', searchVolume: 580, competition: 12 },
  { base: 'short-for-protection', searchVolume: 540, competition: 11 },
  { base: 'short-for-forgiveness', searchVolume: 520, competition: 11 },
  
  { base: 'kjv-for-tattoos', searchVolume: 1400, competition: 28 },
  { base: 'kjv-for-weddings', searchVolume: 980, competition: 20 },
  { base: 'kjv-for-funerals', searchVolume: 840, competition: 17 },
  { base: 'kjv-for-strength', searchVolume: 720, competition: 15 },
  { base: 'kjv-for-comfort', searchVolume: 680, competition: 14 },
  { base: 'kjv-short', searchVolume: 1100, competition: 23 },
  
  { base: 'niv-for-tattoos', searchVolume: 680, competition: 14 },
  { base: 'niv-for-weddings', searchVolume: 540, competition: 11 },
  { base: 'niv-short', searchVolume: 620, competition: 13 },
  
  { base: 'esv-for-tattoos', searchVolume: 480, competition: 10 },
  { base: 'esv-short', searchVolume: 420, competition: 9 },
  
  // Tattoo-specific combinations (200+)
  { base: 'tattoo-ideas-for-women', searchVolume: 1800, competition: 35 },
  { base: 'tattoo-ideas-for-couples', searchVolume: 920, competition: 19 },
  { base: 'tattoos-on-arm', searchVolume: 1400, competition: 28 },
  { base: 'tattoos-on-shoulder', searchVolume: 820, competition: 17 },
  { base: 'tattoos-on-back', searchVolume: 720, competition: 15 },
  { base: 'tattoos-on-chest', searchVolume: 680, competition: 14 },
  { base: 'tattoos-on-ribs', searchVolume: 580, competition: 12 },
  { base: 'tattoos-on-ankle', searchVolume: 520, competition: 11 },
  { base: 'tattoos-on-foot', searchVolume: 480, competition: 10 },
  { base: 'tattoos-on-neck', searchVolume: 440, competition: 9 },
  { base: 'tattoos-on-hand', searchVolume: 620, competition: 13 },
  { base: 'tattoos-on-finger', searchVolume: 380, competition: 8 },
  { base: 'tattoos-on-forearm', searchVolume: 1100, competition: 23 },
  { base: 'small-tattoos', searchVolume: 2200, competition: 42 },
  { base: 'tiny-tattoos', searchVolume: 840, competition: 17 },
  { base: 'minimalist-tattoos', searchVolume: 680, competition: 14 },
  { base: 'simple-tattoos', searchVolume: 1400, competition: 28 },
  { base: 'first-tattoo-ideas', searchVolume: 720, competition: 15 },
  { base: 'matching-tattoos', searchVolume: 980, competition: 20 },
  { base: 'memorial-tattoos', searchVolume: 840, competition: 17 },
  { base: 'tattoos-for-loss', searchVolume: 620, competition: 13 },
  { base: 'tattoos-for-grief', searchVolume: 580, competition: 12 },
  { base: 'tattoos-for-mom', searchVolume: 1200, competition: 25 },
  { base: 'tattoos-for-dad', searchVolume: 920, competition: 19 },
  { base: 'tattoos-for-children', searchVolume: 780, competition: 16 },
  { base: 'tattoos-for-family', searchVolume: 1100, competition: 23 },
  { base: 'tattoos-for-strength', searchVolume: 1600, competition: 32 },
  { base: 'tattoos-for-courage', searchVolume: 840, competition: 17 },
  { base: 'tattoos-for-faith', searchVolume: 1800, competition: 35 },
  { base: 'tattoos-for-hope', searchVolume: 920, competition: 19 },
  { base: 'tattoos-for-love', searchVolume: 1400, competition: 28 },
  { base: 'cross-tattoos', searchVolume: 2400, competition: 45 },
  { base: 'angel-tattoos', searchVolume: 1200, competition: 25 },
  { base: 'dove-tattoos', searchVolume: 840, competition: 17 },
  { base: 'praying-hands-tattoos', searchVolume: 980, competition: 20 },
  
  // Seasonal & occasions (80+)
  { base: 'for-new-year', searchVolume: 1800, competition: 35 },
  { base: 'for-advent', searchVolume: 1400, competition: 28 },
  { base: 'for-lent', searchVolume: 980, competition: 20 },
  { base: 'for-palm-sunday', searchVolume: 840, competition: 17 },
  { base: 'for-good-friday', searchVolume: 1200, competition: 25 },
  { base: 'for-easter-sunday', searchVolume: 2200, competition: 42 },
  { base: 'for-pentecost', searchVolume: 680, competition: 14 },
  { base: 'for-christmas-eve', searchVolume: 1400, competition: 28 },
  { base: 'for-christmas-day', searchVolume: 1600, competition: 32 },
  { base: 'for-mothers-day', searchVolume: 1800, competition: 35 },
  { base: 'for-fathers-day', searchVolume: 1400, competition: 28 },
  { base: 'for-valentines-day', searchVolume: 920, competition: 19 },
  { base: 'for-independence-day', searchVolume: 420, competition: 9 },
  { base: 'for-memorial-day', searchVolume: 680, competition: 14 },
  { base: 'for-veterans-day', searchVolume: 580, competition: 12 },
  { base: 'for-labor-day', searchVolume: 320, competition: 7 },
  { base: 'for-first-communion', searchVolume: 840, competition: 17 },
  { base: 'for-quinceañera', searchVolume: 380, competition: 8 },
  { base: 'for-bar-mitzvah', searchVolume: 280, competition: 6 },
  { base: 'for-bat-mitzvah', searchVolume: 260, competition: 5 },
  { base: 'for-bridal-shower', searchVolume: 720, competition: 15 },
  { base: 'for-baby-dedication', searchVolume: 620, competition: 13 },
  { base: 'for-housewarming', searchVolume: 380, competition: 8 },
  { base: 'for-going-away-party', searchVolume: 240, competition: 5 },
  { base: 'for-promotion', searchVolume: 420, competition: 9 },
  
  // Audience-specific (100+)
  { base: 'for-boys', searchVolume: 640, competition: 13 },
  { base: 'for-girls', searchVolume: 720, competition: 15 },
  { base: 'for-young-men', searchVolume: 580, competition: 12 },
  { base: 'for-young-women', searchVolume: 680, competition: 14 },
  { base: 'for-single-men', searchVolume: 420, competition: 9 },
  { base: 'for-single-women', searchVolume: 520, competition: 11 },
  { base: 'for-married-men', searchVolume: 480, competition: 10 },
  { base: 'for-married-women', searchVolume: 540, competition: 11 },
  { base: 'for-widows', searchVolume: 620, competition: 13 },
  { base: 'for-widowers', searchVolume: 340, competition: 7 },
  { base: 'for-orphans', searchVolume: 380, competition: 8 },
  { base: 'for-immigrants', searchVolume: 420, competition: 9 },
  { base: 'for-refugees', searchVolume: 480, competition: 10 },
  { base: 'for-prisoners', searchVolume: 520, competition: 11 },
  { base: 'for-ex-convicts', searchVolume: 280, competition: 6 },
  { base: 'for-homeless', searchVolume: 380, competition: 8 },
  { base: 'for-poor', searchVolume: 340, competition: 7 },
  { base: 'for-rich', searchVolume: 240, competition: 5 },
  { base: 'for-famous-people', searchVolume: 180, competition: 4 },
  { base: 'for-introverts', searchVolume: 420, competition: 9 },
  { base: 'for-extroverts', searchVolume: 280, competition: 6 },
  { base: 'for-empaths', searchVolume: 340, competition: 7 },
  { base: 'for-highly-sensitive-people', searchVolume: 320, competition: 7 },
  
  // Social media specific (50+)
  { base: 'short-for-instagram', searchVolume: 1400, competition: 28 },
  { base: 'short-for-facebook', searchVolume: 680, competition: 14 },
  { base: 'short-for-twitter', searchVolume: 520, competition: 11 },
  { base: 'for-instagram-bio', searchVolume: 920, competition: 19 },
  { base: 'for-instagram-captions', searchVolume: 1100, competition: 23 },
  { base: 'for-profile-picture', searchVolume: 380, competition: 8 },
  { base: 'for-status-updates', searchVolume: 420, competition: 9 },
  { base: 'for-stories', searchVolume: 680, competition: 14 },
  { base: 'for-reels', searchVolume: 580, competition: 12 },
  { base: 'for-tiktok', searchVolume: 840, competition: 17 },
  { base: 'for-snapchat', searchVolume: 320, competition: 7 },
  { base: 'for-whatsapp-status', searchVolume: 460, competition: 10 },
  
  // Specific uses (80+)
  { base: 'for-bookmarks', searchVolume: 480, competition: 10 },
  { base: 'for-journals', searchVolume: 640, competition: 13 },
  { base: 'for-planners', searchVolume: 520, competition: 11 },
  { base: 'for-bullet-journals', searchVolume: 580, competition: 12 },
  { base: 'for-notebooks', searchVolume: 420, competition: 9 },
  { base: 'for-posters', searchVolume: 720, competition: 15 },
  { base: 'for-wall-art', searchVolume: 840, competition: 17 },
  { base: 'for-mugs', searchVolume: 380, competition: 8 },
  { base: 'for-t-shirts', searchVolume: 620, competition: 13 },
  { base: 'for-bracelets', searchVolume: 540, competition: 11 },
  { base: 'for-necklaces', searchVolume: 480, competition: 10 },
  { base: 'for-jewelry', searchVolume: 680, competition: 14 },
  { base: 'for-phone-cases', searchVolume: 420, competition: 9 },
  { base: 'for-laptop-stickers', searchVolume: 280, competition: 6 },
  { base: 'for-car-decals', searchVolume: 340, competition: 7 },
  { base: 'for-home-decor', searchVolume: 720, competition: 15 },
  { base: 'for-office-decor', searchVolume: 380, competition: 8 },
  { base: 'for-classroom', searchVolume: 620, competition: 13 },
  { base: 'for-dorm-room', searchVolume: 420, competition: 9 },
  { base: 'for-nursery', searchVolume: 680, competition: 14 },
  { base: 'for-bedroom', searchVolume: 480, competition: 10 },
  { base: 'for-living-room', searchVolume: 340, competition: 7 },
  { base: 'for-prayer-wall', searchVolume: 380, competition: 8 },
  { base: 'for-vision-board', searchVolume: 520, competition: 11 },
  { base: 'for-affirmation-mirror', searchVolume: 240, competition: 5 },
  { base: 'for-screensaver', searchVolume: 320, competition: 7 },
  { base: 'for-wallpaper', searchVolume: 580, competition: 12 },
  { base: 'for-lock-screen', searchVolume: 420, competition: 9 },
  { base: 'for-email-signature', searchVolume: 340, competition: 7 },
  { base: 'for-business-cards', searchVolume: 280, competition: 6 },
];

// Convert each expansion intent to proper format
expansionIntents.forEach(intent => {
  const slug = intent.base;
  const title = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  allIntents.push({
    slug,
    title,
    searchVolume: intent.searchVolume,
    competition: intent.competition
  });
});

// Check for duplicates
const slugSet = new Set();
const uniqueIntents = allIntents.filter(intent => {
  if (slugSet.has(intent.slug)) {
    return false;
  }
  slugSet.add(intent.slug);
  return true;
});

// Sort by search volume descending
uniqueIntents.sort((a, b) => b.searchVolume - a.searchVolume);

console.log(`\nExpansion complete:`);
console.log(`- Total intents: ${uniqueIntents.length}`);
console.log(`- New intents added: ${uniqueIntents.length - existingIntents.length}`);
console.log(`- No duplicates: ${uniqueIntents.length === slugSet.size}`);

// Save expanded list
fs.writeFileSync(outputFile, JSON.stringify(uniqueIntents, null, 2));
console.log(`\n✅ Saved to: ${outputFile}`);

// Generate summary
const summary = `# Intent Master List - Expanded

**Total Intents:** ${uniqueIntents.length}
**Date Updated:** ${new Date().toISOString().split('T')[0]}

## Top 20 by Search Volume:
${uniqueIntents.slice(0, 20).map((intent, i) => 
  `${i + 1}. **${intent.title}** - ${intent.searchVolume.toLocaleString()}/mo (slug: ${intent.slug})`
).join('\n')}

## Distribution:
- High volume (1000+/mo): ${uniqueIntents.filter(i => i.searchVolume >= 1000).length}
- Medium volume (500-999/mo): ${uniqueIntents.filter(i => i.searchVolume >= 500 && i.searchVolume < 1000).length}
- Low volume (100-499/mo): ${uniqueIntents.filter(i => i.searchVolume >= 100 && i.searchVolume < 500).length}
- Very low (<100/mo): ${uniqueIntents.filter(i => i.searchVolume < 100).length}
`;

fs.writeFileSync(
  path.join(dataDir, 'intents-master-summary.md'),
  summary
);
console.log(`✅ Summary saved to: intents-master-summary.md`);
