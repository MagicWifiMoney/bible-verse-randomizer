# Bible Verse Randomizer

**Live Site:** https://bibleverserandomizer.com

A modern, AI-enhanced Bible verse discovery platform with programmatic SEO. Built with Next.js 16, Tailwind CSS, and PostgreSQL.

## 🎯 Project Goals

1. **Top-of-funnel SEO play** - Target 160K+ monthly searches for "bible verse randomizer" keywords
2. **Funnel to Sermon Clips** - Convert visitors to sermon-clips.com (church media tool)
3. **Programmatic SEO at scale** - 31K+ verse pages, 719 topics, 3.8K intents, 66 books, 248 chapters

## 🚀 Live Status

| Component | Status | Count |
|-----------|--------|-------|
| **Site** | ✅ Live | https://bibleverserandomizer.com |
| **Core Pages** | ✅ Deployed | Home, About, Daily, Topics |
| **Book Overview Pages** | ✅ Generated | 66 books (Genesis-Revelation) |
| **Chapter Pages** | 🟡 Partial | 7 of 248 |
| **Verse Pages** | 🟡 Partial | 173 of 31,207 |
| **Topic Pages** | 🟡 Pending | 0 of 719 |
| **Intent Pages** | 🟡 Pending | 0 of 3,808 |

**Note:** Verse/topic/intent generation paused due to API key issue. See [PROJECT-HANDOFF.md](./PROJECT-HANDOFF.md) for details.

## 🏗️ Architecture

### Tech Stack
- **Framework:** Next.js 16.1.6 with App Router
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL 15 (Docker)
- **Deployment:** Vercel
- **ISR:** Incremental Static Regeneration (24hr revalidate)
- **AI Generation:** Gemini 2.5 Flash (for content enhancement)
- **Content Source:** BibleGateway scraping + AI enhancement

### Key Features
- 📖 **Multiple translations** - KJV, NIV, ESV, NLT, MSG, NASB
- 🎯 **Topic filtering** - 719 topics with real search volume data
- 🔀 **Random verse generator** - Core UX feature
- 📧 **Email capture** - Resend integration for lead gen
- 🎨 **Modern UI** - Tailwind with amber/slate color scheme
- 🔍 **SEO-optimized** - Schema.org markup, metadata factory

## 📁 Project Structure

```
bible-verse-randomizer/
├── app/                      # Next.js App Router
│   ├── page.tsx              # Homepage (verse randomizer)
│   ├── about/                # About page
│   ├── daily/                # Daily verse page
│   ├── verse/[reference]/    # Dynamic verse pages
│   ├── topic/[slug]/         # Topic pages
│   ├── book/[book]/          # Book overview pages
│   └── for/[intent]/         # Intent/use-case pages
├── components/
│   ├── templates/            # Page templates (VersePage, TopicPage, etc.)
│   └── ui/                   # Reusable UI components
├── lib/
│   ├── seo/                  # SEO utilities (metadata, schema, internal links)
│   ├── verse-data-db.ts      # Database queries
│   └── db.ts                 # PostgreSQL connection
├── data/
│   ├── KJV.json              # 31,207 verses × 6 translations
│   ├── topics-master.json    # 719 topics with search volume
│   ├── intents-master.json   # 3,808 user intents
│   ├── verses/               # Generated verse content (173 so far)
│   └── books/                # 66 book overviews (complete)
├── scripts/
│   ├── scrape-and-enhance-*.js  # Verse content generation
│   ├── sprint*-*.js          # Batch generation scripts
│   └── generate-all-books.js # Book overview generator
└── output/
    ├── books/                # Generated book JSON files
    ├── chapters/             # Generated chapter JSON files
    ├── topics/               # (Pending) Topic page content
    └── intents/              # (Pending) Intent page content
```

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- Docker (for PostgreSQL)
- Vercel CLI (optional, for deployment)

### Installation

```bash
# Clone repo
git clone https://github.com/yourusername/bible-verse-randomizer.git
cd bible-verse-randomizer

# Install dependencies
npm install

# Start PostgreSQL (Docker)
docker run -d \
  --name bible-verse-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=bible_verses \
  -p 5433:5432 \
  postgres:15

# Load Bible data
# (Database schema auto-creates on first connection)
node scripts/load-bible-data.js

# Run development server
npm run dev
```

Visit http://localhost:3000

### Environment Variables

Create `.env.local`:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5433/bible_verses

# Resend (email capture)
RESEND_API_KEY=re_YKy74z6r_LxP9x413cykQPJ5bV2C6APUG

# Gemini (content generation - optional)
GEMINI_API_KEY=your_key_here
```

## 📊 Content Generation Strategy

### Phase 1: Core Infrastructure ✅
- Next.js app setup
- Database schema
- 31,207 verses loaded (6 translations)
- SEO utilities (metadata, schema, internal links)

### Phase 2: Book Overviews ✅
- **Status:** Complete
- **Count:** 66 books (Genesis → Revelation)
- **Content:** 200-300 word summaries, author/date, themes, popular verses
- **Output:** `output/books/*.json`

### Phase 3: Verse Pages 🟡 (Paused)
- **Status:** 173 of 31,207 (0.5%)
- **Approach:** BibleGateway scraping + Gemini 2.5 Flash enhancement
- **Content per verse:** Context (300w), Meaning (400w), Application (500w), Prayer (200w), FAQs (5×100w)
- **Blocker:** Gemini API key leaked & disabled
- **Cost estimate:** $77 for all 31,207 verses
- **Output:** `data/verses/*.json`

### Phase 4: Topic Pages 📋 (Planned)
- **Count:** 719 topics
- **Data ready:** `data/topics-master.json` with real search volume
- **Content needed:** Topic overview, related verses, search intent

### Phase 5: Intent Pages 📋 (Planned)
- **Count:** 3,808 intents
- **Data ready:** `data/intents-master.json`
- **Content needed:** Use-case description, verse recommendations

### Phase 6: Chapter Pages 🟡 (Partial)
- **Status:** 7 of 248
- **Approach:** Similar to book overviews
- **Content needed:** Chapter summaries, context, key verses

## 🚀 Deployment

### Vercel

```bash
# Link project
vercel link

# Deploy to production
vercel --prod
```

**DNS:** bibleverserandomizer.com → Vercel

### ISR Configuration
- **Revalidate:** 24 hours (86400s)
- **On-demand generation:** Yes (for verse/topic/intent pages)
- **Pre-built pages:** Home, About, Daily, 10 popular topics

## 💰 Cost Estimate

| Item | Cost |
|------|------|
| Vercel hosting | Free (Hobby plan) |
| PostgreSQL (Supabase) | $0-25/mo |
| Gemini API (31K verses) | ~$77 one-time |
| Resend (email) | Free (3K/mo) |
| **Total** | **$77 setup + $0-25/mo** |

## 📈 SEO Strategy

### Target Keywords
- **Primary:** "bible verse randomizer" (160K/mo, 0-1/100 competition)
- **Secondary:** "random bible verse generator", "daily bible verse", "bible verses by topic"
- **Long-tail:** 45,000+ keyword opportunities

### Content Pyramid
1. **Homepage** - Core tool experience
2. **Topic pages** (719) - "bible verses about [love/faith/hope]"
3. **Verse pages** (31K) - "[John 3:16] meaning and application"
4. **Intent pages** (3.8K) - "bible verses for [difficult times/strength]"
5. **Book/chapter pages** - Reference/navigation

### Link Structure
- Homepage → Topics → Verses
- Topics → Related topics (semantic clustering)
- Verses → Related verses (same book/chapter, same topic)
- All pages → Sermon Clips CTA

## 🔗 Cross-Promotion

**Primary CTA:** https://sermon-clips.com
- Footer: "From the makers of Sermon Clips"
- Verse pages: "Share this verse in your sermon"
- About page: Church media use case

**Secondary:**
- https://sermon-transcription.com (transcription service)
- Email capture → nurture sequence → Sermon Clips

## 📝 Known Issues

1. **Verse generation incomplete** - Need new Gemini API key, resume from verse #174
2. **Topic/intent pages not generated** - Awaiting continuation
3. **Chapter pages partial** - 7 of 248 completed
4. **Database connection during build** - Expected (ISR handles on-demand)

## 🔄 Resume Work

To continue verse generation:

```bash
# Get new Gemini API key from https://aistudio.google.com/apikey
export GEMINI_API_KEY=your_new_key

# Resume generation (auto-skips completed verses)
node scripts/scrape-and-enhance-all-verses.js

# Monitor progress
cat data/verse-generation-progress.json | jq '{completed: (.completed | length), failed: (.failed | length)}'
```

## 📧 Support

- **Developer:** Botti (@magicwifimoney)
- **Owner:** Jake Giebel
- **Project Notion:** [Command Center](https://notion.so/Command-Center-2f73f6f42e108185866acceaa562b53c)

## 📄 License

Proprietary - All rights reserved
