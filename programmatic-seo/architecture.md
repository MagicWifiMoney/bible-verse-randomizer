# Technical Architecture for 200,000+ Page Programmatic SEO Site
## BibleVerseRandomizer.com System Design

---

## TABLE OF CONTENTS

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Database Design](#database-design)
4. [Rendering Strategy](#rendering-strategy)
5. [Content Generation Pipeline](#content-generation-pipeline)
6. [Hosting & Deployment](#hosting--deployment)
7. [Performance Optimization](#performance-optimization)
8. [Search & Filtering](#search--filtering)
9. [User Features](#user-features)
10. [Monitoring & Analytics](#monitoring--analytics)
11. [Cost Breakdown](#cost-breakdown)
12. [Scaling Considerations](#scaling-considerations)

---

## ARCHITECTURE OVERVIEW

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                 │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                   CLOUDFLARE CDN                             │
│           (Edge Caching, DDoS Protection, SSL)               │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL HOSTING                            │
│         (Next.js App, Edge Functions, ISR/SSR)               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Static      │  │  ISR Pages   │  │  SSR Pages   │      │
│  │  (Top 1k)    │  │  (Mid 20k)   │  │  (Longtail)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE (Backend)                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │   Auth       │  │  Storage     │      │
│  │  Database    │  │   (Users)    │  │  (Images)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                           │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Algolia     │  │  Resend      │  │  OpenAI      │      │
│  │  (Search)    │  │  (Email)     │  │  (Content)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

**For Popular Pages (Pre-rendered):**
1. User requests `/verse/john/3/16`
2. Cloudflare edge serves cached HTML (if fresh)
3. If not cached, Vercel serves pre-built static HTML
4. Response time: 50-200ms

**For Mid-Tail Pages (ISR):**
1. User requests `/verses-about/love/romantic-love`
2. Vercel checks if page exists in cache
3. If yes, serve cached (fast)
4. If no, generate on-demand, cache for 24 hours
5. Response time: 500ms-2s (first hit), 50-200ms (cached)

**For Longtail Pages (On-Demand SSR):**
1. User requests `/verses-for/nurses-working-night-shift`
2. Vercel generates page on-the-fly
3. Fetches data from Supabase
4. Renders React components
5. Caches at edge for 7 days
6. Response time: 1-3s (first hit), 100-300ms (cached)

---

## TECH STACK

### Frontend

**Framework:** Next.js 14+ (App Router)
- **Why:** Best React framework for SEO, built-in ISR/SSR, edge runtime
- **App Router:** Better file-based routing, layouts, loading states
- **Turbopack:** Faster builds (important for large codebase)

**UI Library:** React 18+
- **Why:** Component reusability, state management, hydration

**Styling:** Tailwind CSS
- **Why:** Fast development, small bundle size, utility-first
- **Alternative:** CSS Modules for critical components

**Component Library:** Radix UI + shadcn/ui
- **Why:** Accessible, unstyled primitives, customizable
- **Components:** Modals, dropdowns, tabs, accordions for interactive features

### Backend

**Database:** Supabase (PostgreSQL)
- **Why:** Managed PostgreSQL, built-in auth, real-time subscriptions, generous free tier
- **Size:** 31k verses × 6 translations = ~200k rows (verses table alone)
- **Alternative:** PlanetScale (MySQL) if prefer MySQL

**Authentication:** Supabase Auth
- **Why:** Built-in, supports email/password, magic links, OAuth
- **Features:** Email verification, password reset, session management

**File Storage:** Supabase Storage
- **Why:** Store user-generated images, PDFs, exports
- **Usage:** Generated verse images, downloaded study guides

**API Routes:** Next.js API routes (Edge Functions)
- **Why:** Serverless, scales automatically, same codebase as frontend
- **Use cases:** Search API, user actions, content generation webhooks

### External Services

**Search:** Algolia (or Typesense self-hosted)
- **Why:** Fast full-text search, typo-tolerance, faceted filtering
- **Index:** All verses, topics, intent pages
- **Cost:** $1/month (10k records free, then $0.50/1k/month)

**Email:** Resend (or SendGrid)
- **Why:** Modern API, good deliverability, 100/day free
- **Use cases:** Daily verse emails, welcome series, notifications

**Content Generation:** OpenAI GPT-4 (or Claude)
- **Why:** Generate unique intros, applications, prayers, FAQs
- **Cost:** ~$0.01-0.03 per page generated ($300-900 for 30k pages)

**Analytics:** Plausible or PostHog
- **Why:** Privacy-friendly, lightweight, GDPR-compliant
- **Alternative:** Google Analytics (free but privacy concerns)

**Error Monitoring:** Sentry
- **Why:** Real-time error tracking, performance monitoring
- **Cost:** Free tier (5k errors/month)

### DevOps

**Version Control:** GitHub
**CI/CD:** Vercel (auto-deploy on push)
**Deployment:** Vercel Pro
**CDN:** Cloudflare (DNS + caching)

---

## DATABASE DESIGN

### Schema Summary (see data-model.json for full schema)

**Core Tables:**
- `verses` (31,102 rows) - All Bible verses in 6 translations
- `topics` (2,000+ rows) - Hierarchical topic taxonomy
- `verse_topics` (300,000+ rows) - Many-to-many verse-topic relationships
- `cross_references` (150,000+ rows) - Related verse connections
- `generated_content` (200,000+ rows) - AI-generated content for each page

**User Tables:**
- `users` - User accounts
- `user_bookmarks` - Saved verses
- `user_reading_history` - Tracking for recommendations
- `email_subscribers` - Email list

**Analytics:**
- `page_views` - Simple page view tracking (for popularity scoring)

### Database Optimizations

**Indexes:**
```sql
-- Verse lookups
CREATE INDEX idx_book_chapter_verse ON verses(book, chapter, verse);
CREATE INDEX idx_slug ON verses(slug);

-- Topic queries
CREATE INDEX idx_topic_relevance ON verse_topics(topic_id, relevance_score DESC);

-- Cross-references
CREATE INDEX idx_verse_relationships ON cross_references(verse_id, strength DESC);

-- Full-text search
CREATE INDEX idx_verse_text_search ON verses USING gin(to_tsvector('english', text_niv || ' ' || text_kjv));
```

**Materialized Views (for performance):**
```sql
-- Pre-compute popular verses
CREATE MATERIALIZED VIEW popular_verses AS
SELECT v.*, COUNT(pv.id) AS view_count, COUNT(ub.id) AS bookmark_count
FROM verses v
LEFT JOIN page_views pv ON v.id = pv.verse_id
LEFT JOIN user_bookmarks ub ON v.id = ub.verse_id
GROUP BY v.id
ORDER BY view_count DESC, bookmark_count DESC;

-- Refresh daily
REFRESH MATERIALIZED VIEW popular_verses;
```

**Connection Pooling:**
- Supabase built-in pooler (PgBouncer)
- Max connections: 500 (Pro tier)
- Timeouts: 10 seconds

---

## RENDERING STRATEGY

### Hybrid Rendering Approach

**Problem:** Can't pre-build all 200k pages (would take 20+ hours, cost $$, break Vercel limits)

**Solution:** Tiered rendering based on traffic/importance

### Tier 1: Static Site Generation (SSG) - 1,000 pages
**Pages:**
- Homepage, about, contact, privacy, terms
- Top 500 verses (john 3:16, psalm 23, etc.)
- Top 100 topic hubs (love, faith, hope, etc.)
- Top 50 intent pages (weddings, funerals, tattoos, etc.)
- All tool landing pages (~20)

**Build Time:** ~5-10 minutes
**Deploy:** Every code change
**Performance:** Lightning fast (pre-rendered HTML)

**Config:**
```javascript
// app/verse/[book]/[chapter]/[verse]/page.tsx
export async function generateStaticParams() {
  const topVerses = await getTop500Verses();
  return topVerses.map(v => ({
    book: v.book,
    chapter: v.chapter.toString(),
    verse: v.verse.toString()
  }));
}
```

### Tier 2: Incremental Static Regeneration (ISR) - 20,000 pages
**Pages:**
- Next 19,500 most popular verses
- Next 300 topic/sub-topic pages
- Next 200 intent pages

**Strategy:**
- Build on-demand (first request triggers generation)
- Cache for 24 hours
- Revalidate in background

**Config:**
```javascript
// app/verse/[book]/[chapter]/[verse]/page.tsx
export const revalidate = 86400; // 24 hours

export default async function VersePage({ params }) {
  const verse = await getVerse(params);
  const content = await getGeneratedContent(verse.id);
  return <VerseTemplate verse={verse} content={content} />;
}
```

### Tier 3: Server-Side Rendering (SSR) - 179,000 pages
**Pages:**
- All remaining longtail verses
- Niche topic combinations
- Specific intent pages

**Strategy:**
- Generate on first request
- Cache at Cloudflare edge for 7 days
- No server-side cache (saves memory)

**Config:**
```javascript
// app/verses-about/[topic]/[subtopic]/page.tsx
export const dynamic = 'force-dynamic'; // SSR
export const revalidate = 604800; // 7 days (edge cache)

export default async function SubTopicPage({ params }) {
  const verses = await getVersesForSubTopic(params.topic, params.subtopic);
  const content = await generateContent(verses);
  return <TopicTemplate verses={verses} content={content} />;
}
```

### Edge Caching Strategy

**Cloudflare Rules:**
```javascript
// cloudflare-worker.js
async function handleRequest(request) {
  const url = new URL(request.url);
  const cache = caches.default;
  
  // Cache static assets forever
  if (url.pathname.startsWith('/assets/')) {
    return fetch(request, {
      cf: { cacheTtl: 31536000, cacheEverything: true }
    });
  }
  
  // Cache HTML pages
  if (!url.pathname.startsWith('/api/')) {
    const cacheKey = new Request(url.toString(), request);
    let response = await cache.match(cacheKey);
    
    if (!response) {
      response = await fetch(request);
      if (response.ok) {
        response = new Response(response.body, response);
        response.headers.set('Cache-Control', 'public, max-age=604800'); // 7 days
        await cache.put(cacheKey, response.clone());
      }
    }
    return response;
  }
  
  return fetch(request);
}
```

---

## CONTENT GENERATION PIPELINE

### Phase 1: Data Seeding

**Step 1: Populate Verses Table**
```javascript
// scripts/seed-verses.js
import { createClient } from '@supabase/supabase-js';
import bibleData from './bible-api-data.json'; // From Bible API

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function seedVerses() {
  for (const verse of bibleData) {
    await supabase.from('verses').insert({
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      text_kjv: verse.translations.kjv,
      text_niv: verse.translations.niv,
      text_esv: verse.translations.esv,
      text_nlt: verse.translations.nlt,
      text_msg: verse.translations.msg,
      text_nasb: verse.translations.nasb,
      slug: `${verse.book}-${verse.chapter}-${verse.verse}`.toLowerCase().replace(/\s/g, '-'),
      testament: verse.testament,
      word_count: verse.translations.niv.split(' ').length,
      character_count: verse.translations.niv.length
    });
  }
  console.log('✅ Seeded 31,102 verses');
}
```

**Step 2: Create Topic Taxonomy**
```javascript
// scripts/seed-topics.js
const mainTopics = [
  { name: 'Love', search_volume: 33000, competition_score: 20 },
  { name: 'Faith', search_volume: 24000, competition_score: 19 },
  // ... 100 main topics
];

const subTopics = {
  'Love': ['Romantic Love', 'Gods Love', 'Self-Love', 'Love for Enemies'],
  // ... sub-topics for each main topic
};

async function seedTopics() {
  for (const topic of mainTopics) {
    const { data } = await supabase.from('topics').insert({
      name: topic.name,
      slug: slugify(topic.name),
      level: 1,
      search_volume: topic.search_volume,
      competition_score: topic.competition_score
    }).select();
    
    // Insert sub-topics
    for (const subName of subTopics[topic.name]) {
      await supabase.from('topics').insert({
        name: subName,
        slug: slugify(subName),
        parent_topic_id: data[0].id,
        level: 2
      });
    }
  }
}
```

**Step 3: Tag Verses with Topics (AI-Assisted)**
```javascript
// scripts/tag-verses.js
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function tagVerse(verse) {
  const prompt = `
    Given this Bible verse, identify relevant topics (from list below).
    Verse: ${verse.text_niv}
    Reference: ${verse.book} ${verse.chapter}:${verse.verse}
    
    Topics: Love, Faith, Hope, Strength, Forgiveness, Healing, Anxiety, Fear, Joy, Peace, Courage, Comfort, Encouragement, Wisdom, Prayer, Trust, Guidance, Salvation, Grace, Mercy, Redemption, Sin, Repentance, Temptation, Marriage, Family, Friendship, Parenting, Death, Grief, Work, Money, Purpose, Leadership, Obedience, Worship, Praise, Humility, Patience, Kindness, Compassion, Justice, Anger, Jealousy, Pride, Loneliness, Sadness, Depression, Stress
    
    Return up to 5 relevant topics with relevance scores (1-10).
    Format: JSON array [{ topic: "Love", score: 9 }, ...]
  `;
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3
  });
  
  const tags = JSON.parse(response.choices[0].message.content);
  
  for (const tag of tags) {
    const topic = await supabase.from('topics').select('id').eq('name', tag.topic).single();
    if (topic.data) {
      await supabase.from('verse_topics').insert({
        verse_id: verse.id,
        topic_id: topic.data.id,
        relevance_score: tag.score
      });
    }
  }
}

// Process in batches (100 at a time to avoid rate limits)
async function tagAllVerses() {
  const verses = await supabase.from('verses').select('*');
  for (let i = 0; i < verses.data.length; i += 100) {
    const batch = verses.data.slice(i, i + 100);
    await Promise.all(batch.map(tagVerse));
    console.log(`Tagged ${i + 100} / ${verses.data.length}`);
    await sleep(1000); // Rate limiting
  }
}
```

### Phase 2: Content Generation

**Generate Verse Page Content**
```javascript
// scripts/generate-verse-content.js
async function generateVerseContent(verse) {
  const prompt = `
    Generate SEO-optimized content for this Bible verse page.
    Verse: ${verse.text_niv}
    Reference: ${verse.book} ${verse.chapter}:${verse.verse}
    
    Generate:
    1. Quick Summary (50 words, what this verse means in simple terms)
    2. Detailed Explanation (400 words, theological depth, word meanings)
    3. Historical Context (200 words, when written, cultural background)
    4. How to Apply Today (300 words, practical application, real-life examples)
    5. Prayer (100 words, based on this verse)
    6. 10 FAQs (question + 50-word answer each)
    
    Format as JSON.
  `;
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  });
  
  const content = JSON.parse(response.choices[0].message.content);
  
  await supabase.from('generated_content').insert({
    page_type: 'verse',
    entity_id: verse.id,
    slug: `/verse/${verse.slug}`,
    title: `${verse.book} ${verse.chapter}:${verse.verse} - Meaning, Explanation & Context`,
    meta_description: content.quick_summary,
    content_json: content,
    word_count: calculateWordCount(content),
    published: true,
    generated_at: new Date()
  });
}
```

**Generate Topic Page Content**
```javascript
// scripts/generate-topic-content.js
async function generateTopicContent(topic) {
  const verses = await supabase
    .from('verse_topics')
    .select('*, verses(*)')
    .eq('topic_id', topic.id)
    .order('relevance_score', { ascending: false })
    .limit(100);
  
  const prompt = `
    Generate SEO content for a topic page about "${topic.name}" in the Bible.
    We have ${verses.data.length} verses on this topic.
    
    Generate:
    1. Introduction (500 words, why this topic matters, what the Bible says overall)
    2. Sub-topic breakdown (identify 5-10 sub-themes within this topic)
    3. How to Study ${topic.name} in the Bible (400 words, practical tips)
    4. 20 FAQs about ${topic.name}
    
    Format as JSON.
  `;
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  });
  
  const content = JSON.parse(response.choices[0].message.content);
  
  await supabase.from('generated_content').insert({
    page_type: 'topic',
    entity_id: topic.id,
    slug: `/verses-about/${topic.slug}`,
    title: `100+ Bible Verses About ${topic.name} - Complete Guide`,
    meta_description: content.introduction.substring(0, 160),
    content_json: { ...content, verses: verses.data },
    word_count: calculateWordCount(content),
    published: true
  });
}
```

### Phase 3: Cron Jobs for Continuous Updates

```javascript
// vercel.json (cron configuration)
{
  "crons": [
    {
      "path": "/api/cron/update-popular-verses",
      "schedule": "0 2 * * *" // Daily at 2 AM
    },
    {
      "path": "/api/cron/revalidate-top-pages",
      "schedule": "0 3 * * *" // Daily at 3 AM
    },
    {
      "path": "/api/cron/send-daily-emails",
      "schedule": "0 8 * * *" // Daily at 8 AM
    }
  ]
}
```

---

## HOSTING & DEPLOYMENT

### Vercel Configuration

**Plan:** Vercel Pro ($20/month)
- **Bandwidth:** 1 TB/month (enough for 1-2M monthly visitors with good caching)
- **Build time:** 6,000 minutes/month (plenty for incremental builds)
- **Functions:** 1M invocations/month, 1M GB-hours
- **Image optimization:** Built-in, automatic
- **Edge network:** Global CDN

**Deployment Strategy:**
```javascript
// vercel.json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "regions": ["iad1", "sfo1", "cdg1"], // US East, West, Europe
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-DNS-Prefetch-Control",
          "value": "on"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        }
      ]
    }
  ]
}
```

**Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ... (secret, server-only)
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
ALGOLIA_APP_ID=XXX
ALGOLIA_API_KEY=XXX
```

### Cloudflare Configuration

**DNS:**
- Point domain to Vercel (CNAME to cname.vercel-dns.com)
- Cloudflare proxied (orange cloud)

**Caching Rules:**
```
Cache Level: Standard
Browser TTL: 4 hours
Edge TTL: 7 days (for HTML pages)
Always Online: Enabled
```

**Page Rules:**
```
Rule 1: bibleverserandomizer.com/assets/*
  Cache Level: Cache Everything
  Edge Cache TTL: 1 year
  
Rule 2: bibleverserandomizer.com/api/*
  Cache Level: Bypass
  
Rule 3: bibleverserandomizer.com/*
  Cache Level: Cache Everything
  Edge Cache TTL: 7 days
```

---

## PERFORMANCE OPTIMIZATION

### Target Metrics
- **LCP (Largest Contentful Paint):** <2s
- **FID (First Input Delay):** <100ms
- **CLS (Cumulative Layout Shift):** <0.1
- **TTI (Time to Interactive):** <3s

### Optimization Strategies

**1. Image Optimization**
```javascript
// Use Next.js Image component everywhere
import Image from 'next/image';

<Image
  src="/verse-background.jpg"
  alt="Bible verse background"
  width={1200}
  height={630}
  quality={80}
  loading="lazy"
  placeholder="blur"
/>
```

**2. Code Splitting**
```javascript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const VerseImageGenerator = dynamic(() => import('@/components/VerseImageGenerator'), {
  loading: () => <p>Loading tool...</p>,
  ssr: false // Client-side only
});
```

**3. Database Query Optimization**
```javascript
// Use select() to fetch only needed columns
const verses = await supabase
  .from('verses')
  .select('id, book, chapter, verse, text_niv, slug') // Not all translations
  .limit(100);

// Use indexes for WHERE clauses
const verse = await supabase
  .from('verses')
  .select('*')
  .eq('slug', 'john-3-16') // Uses idx_slug
  .single();
```

**4. Bundle Size Reduction**
```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
    swcMinify: true
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  }
};
```

**5. Prefetching**
```javascript
// Prefetch related verses when hovering
<Link href={`/verse/${relatedVerse.slug}`} prefetch={true}>
  {relatedVerse.reference}
</Link>
```

---

## SEARCH & FILTERING

### Algolia Implementation

**Index Structure:**
```javascript
// Verse index
{
  objectID: "verse-123",
  book: "John",
  chapter: 3,
  verse: 16,
  text: "For God so loved the world...",
  slug: "john-3-16",
  topics: ["Love", "Salvation", "Faith"],
  testament: "New Testament",
  word_count: 26,
  popularity: 9500
}

// Topic index
{
  objectID: "topic-45",
  name: "Love",
  slug: "love",
  verse_count: 342,
  parent_topic: null,
  search_volume: 33000
}
```

**Search Component:**
```javascript
// components/Search.tsx
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch-hooks-web';
import algoliasearch from 'algoliasearch/lite';

const searchClient = algoliasearch(appId, apiKey);

export function Search() {
  return (
    <InstantSearch searchClient={searchClient} indexName="verses">
      <SearchBox placeholder="Search verses, topics, books..." />
      <Hits hitComponent={VerseHit} />
    </InstantSearch>
  );
}
```

**Faceted Filters:**
```javascript
<RefinementList attribute="book" />
<RefinementList attribute="topics" />
<RefinementList attribute="testament" />
<RangeInput attribute="word_count" />
```

---

## USER FEATURES

### Authentication Flow
```javascript
// app/auth/signup/page.tsx
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SignUpPage() {
  const supabase = createClientComponentClient();
  
  async function handleSignUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`
      }
    });
  }
  
  return <SignUpForm onSubmit={handleSignUp} />;
}
```

### Bookmark System
```javascript
// components/BookmarkButton.tsx
async function bookmarkVerse(verseId, collectionName) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // Prompt login
    return;
  }
  
  await supabase.from('user_bookmarks').insert({
    user_id: user.id,
    verse_id: verseId,
    collection_name: collectionName
  });
  
  toast.success('Verse saved!');
}
```

---

## MONITORING & ANALYTICS

### Plausible Analytics
```javascript
// app/layout.tsx
import Script from 'next/script';

<Script
  defer
  data-domain="bibleverserandomizer.com"
  src="https://plausible.io/js/script.js"
/>
```

### Sentry Error Tracking
```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV
});
```

### Custom Popularity Tracking
```javascript
// api/track-view/route.ts
export async function POST(request) {
  const { verseId, slug } = await request.json();
  
  await supabase.from('page_views').insert({
    verse_id: verseId,
    page_slug: slug,
    viewed_at: new Date()
  });
  
  return Response.json({ success: true });
}
```

---

## COST BREAKDOWN

### Monthly Costs (at 1M monthly pageviews)

| Service | Plan | Cost |
|---------|------|------|
| **Vercel Pro** | Pro | $20 |
| **Supabase** | Pro | $25 |
| **Cloudflare** | Free | $0 |
| **Algolia** | Grow | $30 |
| **Resend** | Pay-as-you-go | $10 |
| **OpenAI** | API usage (maintenance) | $50 |
| **Plausible** | Starter | $9 |
| **Sentry** | Free tier | $0 |
| **Domain** | .com | $12/year |
| **TOTAL** | | **~$145/month** |

### Revenue Break-Even

**At 1M monthly pageviews:**
- Display ads (Ezoic): $10-15 RPM = $10,000-15,000/month
- Break-even at: ~15,000 pageviews/month
- **Profitable from month 6+**

---

## SCALING CONSIDERATIONS

### Database Scaling
- **Current:** Supabase Pro (8 GB RAM, 120 GB storage)
- **At 1M rows:** Upgrade to Team ($599/mo) or migrate to self-hosted Postgres
- **Query optimization:** Add more indexes, materialized views
- **Read replicas:** For read-heavy workload

### Hosting Scaling
- **Current:** Vercel Pro ($20/mo, 1 TB bandwidth)
- **At 5M monthly pageviews:** Consider Enterprise plan or custom CDN
- **Alternative:** Cloudflare Pages (cheaper at scale)

### Search Scaling
- **Current:** Algolia Grow ($30/mo, 100k records, 100k searches/mo)
- **At scale:** Algolia Premium ($500+/mo) or self-host Typesense

### Content Generation Scaling
- **Current:** OpenAI API ($50/mo for maintenance)
- **Alternative:** Self-host Llama 2 70B on RunPod (~$100/mo for unlimited generation)

---

## DISASTER RECOVERY

### Backups
- **Database:** Supabase daily automated backups (7-day retention)
- **Code:** GitHub (version controlled)
- **Manual backups:** Weekly full database dump to S3

### Downtime Scenarios
1. **Vercel outage:** Cloudflare caches pages, site still accessible (read-only)
2. **Supabase outage:** Implement fallback to cached data in Vercel
3. **DNS issues:** Cloudflare's Always Online keeps cached version live

---

## SECURITY

### Best Practices
- **Row-Level Security (RLS):** Enabled on all Supabase tables
- **API rate limiting:** Vercel Edge middleware
- **SQL injection:** Parameterized queries (Supabase client prevents)
- **XSS protection:** React escapes by default, sanitize user input
- **HTTPS:** Enforced everywhere
- **Environment secrets:** Never commit to Git, use Vercel env vars

---

## CONCLUSION

This architecture supports:
- ✅ 200,000+ pages
- ✅ 1-2M monthly pageviews
- ✅ Sub-2s page loads
- ✅ $145/month operating cost
- ✅ Scalable to 10M+ pageviews

**Next:** Implement Month 1-2 roadmap, build MVP, deploy first 1,000 pages, validate architecture.
