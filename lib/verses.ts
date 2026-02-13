// Curated verses by topic for the Bible Verse Randomizer

export interface Verse {
  reference: string;
  text: string;
  book: string;
  chapter: number;
  verse: number;
  topics: string[];
}

export const topics = [
  'Love',
  'Faith',
  'Hope',
  'Strength',
  'Comfort',
  'Wisdom',
  'Peace',
  'Gratitude',
  'Courage',
  'Forgiveness',
] as const;

export type Topic = typeof topics[number];

export const verses: Verse[] = [
  // Love
  {
    reference: '1 Corinthians 13:4-7',
    text: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs. Love does not delight in evil but rejoices with the truth. It always protects, always trusts, always hopes, always perseveres.',
    book: '1 Corinthians',
    chapter: 13,
    verse: 4,
    topics: ['Love'],
  },
  {
    reference: 'John 3:16',
    text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
    book: 'John',
    chapter: 3,
    verse: 16,
    topics: ['Love', 'Faith'],
  },
  {
    reference: '1 John 4:8',
    text: 'Whoever does not love does not know God, because God is love.',
    book: '1 John',
    chapter: 4,
    verse: 8,
    topics: ['Love'],
  },
  {
    reference: 'John 15:13',
    text: 'Greater love has no one than this: to lay down one\'s life for one\'s friends.',
    book: 'John',
    chapter: 15,
    verse: 13,
    topics: ['Love', 'Courage'],
  },
  {
    reference: 'Romans 8:38-39',
    text: 'For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord.',
    book: 'Romans',
    chapter: 8,
    verse: 38,
    topics: ['Love', 'Hope', 'Comfort'],
  },
  
  // Faith
  {
    reference: 'Hebrews 11:1',
    text: 'Now faith is confidence in what we hope for and assurance about what we do not see.',
    book: 'Hebrews',
    chapter: 11,
    verse: 1,
    topics: ['Faith', 'Hope'],
  },
  {
    reference: 'Matthew 17:20',
    text: 'Truly I tell you, if you have faith as small as a mustard seed, you can say to this mountain, "Move from here to there," and it will move. Nothing will be impossible for you.',
    book: 'Matthew',
    chapter: 17,
    verse: 20,
    topics: ['Faith', 'Courage'],
  },
  {
    reference: 'Proverbs 3:5-6',
    text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
    book: 'Proverbs',
    chapter: 3,
    verse: 5,
    topics: ['Faith', 'Wisdom'],
  },
  {
    reference: 'Mark 11:24',
    text: 'Therefore I tell you, whatever you ask for in prayer, believe that you have received it, and it will be yours.',
    book: 'Mark',
    chapter: 11,
    verse: 24,
    topics: ['Faith'],
  },
  {
    reference: '2 Corinthians 5:7',
    text: 'For we live by faith, not by sight.',
    book: '2 Corinthians',
    chapter: 5,
    verse: 7,
    topics: ['Faith'],
  },

  // Hope
  {
    reference: 'Jeremiah 29:11',
    text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.',
    book: 'Jeremiah',
    chapter: 29,
    verse: 11,
    topics: ['Hope', 'Comfort'],
  },
  {
    reference: 'Romans 15:13',
    text: 'May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.',
    book: 'Romans',
    chapter: 15,
    verse: 13,
    topics: ['Hope', 'Peace'],
  },
  {
    reference: 'Psalm 39:7',
    text: 'But now, Lord, what do I look for? My hope is in you.',
    book: 'Psalm',
    chapter: 39,
    verse: 7,
    topics: ['Hope'],
  },
  {
    reference: 'Lamentations 3:22-23',
    text: 'Because of the Lord\'s great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.',
    book: 'Lamentations',
    chapter: 3,
    verse: 22,
    topics: ['Hope', 'Love', 'Gratitude'],
  },

  // Strength
  {
    reference: 'Philippians 4:13',
    text: 'I can do all this through him who gives me strength.',
    book: 'Philippians',
    chapter: 4,
    verse: 13,
    topics: ['Strength', 'Courage'],
  },
  {
    reference: 'Isaiah 40:31',
    text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
    book: 'Isaiah',
    chapter: 40,
    verse: 31,
    topics: ['Strength', 'Hope'],
  },
  {
    reference: 'Psalm 46:1',
    text: 'God is our refuge and strength, an ever-present help in trouble.',
    book: 'Psalm',
    chapter: 46,
    verse: 1,
    topics: ['Strength', 'Comfort'],
  },
  {
    reference: 'Nehemiah 8:10',
    text: 'Do not grieve, for the joy of the Lord is your strength.',
    book: 'Nehemiah',
    chapter: 8,
    verse: 10,
    topics: ['Strength', 'Gratitude'],
  },
  {
    reference: '2 Corinthians 12:9',
    text: 'But he said to me, "My grace is sufficient for you, for my power is made perfect in weakness." Therefore I will boast all the more gladly about my weaknesses, so that Christ\'s power may rest on me.',
    book: '2 Corinthians',
    chapter: 12,
    verse: 9,
    topics: ['Strength', 'Faith'],
  },

  // Comfort
  {
    reference: 'Matthew 11:28',
    text: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    book: 'Matthew',
    chapter: 11,
    verse: 28,
    topics: ['Comfort', 'Peace'],
  },
  {
    reference: 'Psalm 23:4',
    text: 'Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.',
    book: 'Psalm',
    chapter: 23,
    verse: 4,
    topics: ['Comfort', 'Courage'],
  },
  {
    reference: '2 Corinthians 1:3-4',
    text: 'Praise be to the God and Father of our Lord Jesus Christ, the Father of compassion and the God of all comfort, who comforts us in all our troubles, so that we can comfort those in any trouble with the comfort we ourselves receive from God.',
    book: '2 Corinthians',
    chapter: 1,
    verse: 3,
    topics: ['Comfort'],
  },
  {
    reference: 'Psalm 34:18',
    text: 'The Lord is close to the brokenhearted and saves those who are crushed in spirit.',
    book: 'Psalm',
    chapter: 34,
    verse: 18,
    topics: ['Comfort'],
  },

  // Wisdom
  {
    reference: 'James 1:5',
    text: 'If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.',
    book: 'James',
    chapter: 1,
    verse: 5,
    topics: ['Wisdom'],
  },
  {
    reference: 'Proverbs 9:10',
    text: 'The fear of the Lord is the beginning of wisdom, and knowledge of the Holy One is understanding.',
    book: 'Proverbs',
    chapter: 9,
    verse: 10,
    topics: ['Wisdom'],
  },
  {
    reference: 'Colossians 3:16',
    text: 'Let the message of Christ dwell among you richly as you teach and admonish one another with all wisdom through psalms, hymns, and songs from the Spirit, singing to God with gratitude in your hearts.',
    book: 'Colossians',
    chapter: 3,
    verse: 16,
    topics: ['Wisdom', 'Gratitude'],
  },
  {
    reference: 'Proverbs 4:7',
    text: 'The beginning of wisdom is this: Get wisdom. Though it cost all you have, get understanding.',
    book: 'Proverbs',
    chapter: 4,
    verse: 7,
    topics: ['Wisdom'],
  },

  // Peace
  {
    reference: 'John 14:27',
    text: 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.',
    book: 'John',
    chapter: 14,
    verse: 27,
    topics: ['Peace', 'Comfort'],
  },
  {
    reference: 'Philippians 4:6-7',
    text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.',
    book: 'Philippians',
    chapter: 4,
    verse: 6,
    topics: ['Peace', 'Gratitude'],
  },
  {
    reference: 'Isaiah 26:3',
    text: 'You will keep in perfect peace those whose minds are steadfast, because they trust in you.',
    book: 'Isaiah',
    chapter: 26,
    verse: 3,
    topics: ['Peace', 'Faith'],
  },
  {
    reference: 'Romans 12:18',
    text: 'If it is possible, as far as it depends on you, live at peace with everyone.',
    book: 'Romans',
    chapter: 12,
    verse: 18,
    topics: ['Peace'],
  },

  // Gratitude
  {
    reference: '1 Thessalonians 5:18',
    text: 'Give thanks in all circumstances; for this is God\'s will for you in Christ Jesus.',
    book: '1 Thessalonians',
    chapter: 5,
    verse: 18,
    topics: ['Gratitude'],
  },
  {
    reference: 'Psalm 100:4',
    text: 'Enter his gates with thanksgiving and his courts with praise; give thanks to him and praise his name.',
    book: 'Psalm',
    chapter: 100,
    verse: 4,
    topics: ['Gratitude'],
  },
  {
    reference: 'Colossians 3:17',
    text: 'And whatever you do, whether in word or deed, do it all in the name of the Lord Jesus, giving thanks to God the Father through him.',
    book: 'Colossians',
    chapter: 3,
    verse: 17,
    topics: ['Gratitude'],
  },
  {
    reference: 'Psalm 107:1',
    text: 'Give thanks to the Lord, for he is good; his love endures forever.',
    book: 'Psalm',
    chapter: 107,
    verse: 1,
    topics: ['Gratitude', 'Love'],
  },

  // Courage
  {
    reference: 'Joshua 1:9',
    text: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.',
    book: 'Joshua',
    chapter: 1,
    verse: 9,
    topics: ['Courage', 'Strength'],
  },
  {
    reference: 'Deuteronomy 31:6',
    text: 'Be strong and courageous. Do not be afraid or terrified because of them, for the Lord your God goes with you; he will never leave you nor forsake you.',
    book: 'Deuteronomy',
    chapter: 31,
    verse: 6,
    topics: ['Courage', 'Strength'],
  },
  {
    reference: 'Psalm 27:1',
    text: 'The Lord is my light and my salvation—whom shall I fear? The Lord is the stronghold of my life—of whom shall I be afraid?',
    book: 'Psalm',
    chapter: 27,
    verse: 1,
    topics: ['Courage'],
  },
  {
    reference: '2 Timothy 1:7',
    text: 'For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.',
    book: '2 Timothy',
    chapter: 1,
    verse: 7,
    topics: ['Courage', 'Love'],
  },

  // Forgiveness
  {
    reference: 'Ephesians 4:32',
    text: 'Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you.',
    book: 'Ephesians',
    chapter: 4,
    verse: 32,
    topics: ['Forgiveness', 'Love'],
  },
  {
    reference: 'Colossians 3:13',
    text: 'Bear with each other and forgive one another if any of you has a grievance against someone. Forgive as the Lord forgave you.',
    book: 'Colossians',
    chapter: 3,
    verse: 13,
    topics: ['Forgiveness'],
  },
  {
    reference: '1 John 1:9',
    text: 'If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness.',
    book: '1 John',
    chapter: 1,
    verse: 9,
    topics: ['Forgiveness'],
  },
  {
    reference: 'Matthew 6:14-15',
    text: 'For if you forgive other people when they sin against you, your heavenly Father will also forgive you. But if you do not forgive others their sins, your Father will not forgive your sins.',
    book: 'Matthew',
    chapter: 6,
    verse: 14,
    topics: ['Forgiveness'],
  },
  {
    reference: 'Psalm 103:12',
    text: 'As far as the east is from the west, so far has he removed our transgressions from us.',
    book: 'Psalm',
    chapter: 103,
    verse: 12,
    topics: ['Forgiveness'],
  },
];

export function getRandomVerse(topic?: Topic): Verse {
  const filteredVerses = topic
    ? verses.filter((v) => v.topics.includes(topic))
    : verses;
  
  return filteredVerses[Math.floor(Math.random() * filteredVerses.length)];
}

export function getDailyVerse(date: Date = new Date()): Verse {
  // Use date as seed for consistent daily verse
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return verses[dayOfYear % verses.length];
}

export function getVersesByTopic(topic: Topic): Verse[] {
  return verses.filter((v) => v.topics.includes(topic));
}
