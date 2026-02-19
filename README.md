# Bible Verse Randomizer

**Live Site:** [bibleverserandomizer.com](https://bibleverserandomizer.com)  
**Repository:** [github.com/MagicWifiMoney/bible-verse-randomizer](https://github.com/MagicWifiMoney/bible-verse-randomizer)

A modern, AI-enhanced Bible verse discovery platform with programmatic SEO at scale. Built with Next.js 16, Tailwind CSS, and PostgreSQL — serving **13,400+ pages** across 6 translations.

---

## 🎯 Project Goals

1. **Top-of-funnel SEO play** — Target 160K+ monthly searches for "bible verse randomizer" keywords
2. **Funnel to Sermon Clips** — Convert visitors to [sermon-clips.com](https://sermon-clips.com) (church media tool)
3. **Programmatic SEO at scale** — 13,400+ pages spanning verse details, comparisons, chapters, topics, intents, and hub pages

## 🚀 Live Status

| Component | Status | Count |
|-----------|--------|-------|
| **Site** | ✅ Live | [bibleverserandomizer.com](https://bibleverserandomizer.com) |
| **Core Pages** | ✅ Deployed | Home, About, Daily, Topics Hub |
| **Book Overview Pages** | ✅ Complete | 66 books (Genesis–Revelation) |
| **Chapter Pages** | ✅ Complete | 1,189 chapters (NIV default) |
| **Translation Chapter Pages** | ✅ Complete | 5,945 pages (5 translations × 1,189 chapters) |
| **Verse Detail Pages** | ✅ Complete | 1,000 priority verses |
| **Verse Comparison Pages** | ✅ Complete | 1,000 side-by-side translation comparisons |
| **Topic Pages** | ✅ Deployed | 719 topics |
| **Intent Pages** | ✅ Deployed | 3,808 user intents |
| **Hub Pages** | ✅ Live | Old Testament, New Testament, Translations, Popular Verses |
| **Reading Plan** | ✅ Live | 365-day interactive reading plan |

---

## 🏗️ Architecture

### Tech Stack
- **Framework:** Next.js 16.1.6 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL 15 (31,207 verses × 6 translations)
- **Deployment:** Vercel (ISR — Incremental Static Regeneration)
- **AI Generation:** Gemini 2.5 Flash + OpenAI GPT-4o
- **Email:** Resend (lead capture + welcome emails)
- **Content Source:** BibleGateway scraping + AI enhancement + enriched verse data

### Key Features
- 📖 **6 translations** — KJV, NIV, ESV, NLT, MSG, NASB
- 🔀 **Random verse generator** — Core UX feature on homepage
- 🎯 **Topic filtering** — 719 topics with real search volume data
- 📊 **Verse comparisons** — Side-by-side translation comparison pages
- 📅 **365-day reading plan** — Interactive, links to every chapter
- 🏛️ **Testament hubs** — Old & New Testament browse pages
- 📧 **Email capture** — Exit-intent popup + inline capture (Resend)
- 🔍 **SEO-optimized** — Schema.org (FAQ, HowTo, Article), metadata factory, `llms.txt`
- 🤖 **LLM-discoverable** — E-E-A-T signals, structured data stacking, `robots.txt` sitemap reference

---

## 📁 Project Structure

```
bible-verse-randomizer/
├── app/                           # Next.js App Router
│   ├── page.tsx                   # Homepage (verse randomizer)
│   ├── about/                     # About page
│   ├── daily/                     # Daily verse page
│   ├── verse/[reference]/         # Verse detail pages (1,000)
│   │   └── compare/               # Verse comparison pages (1,000)
│   ├── topic/[slug]/              # Topic pages (719)
│   ├── topics/                    # Topics index
│   ├── book/[book]/               # Book overview pages (66)
│   │   └── [chapter]/             # Chapter pages (1,189 NIV)
│   │       └── [translation]/     # Translation-specific chapters (5,945)
│   ├── books/                     # Books index
│   ├── for/[intent]/              # Intent/use-case pages (3,808)
│   ├── old-testament/             # OT hub page
│   ├── new-testament/             # NT hub page
│   ├── translations/              # Translation comparison hub
│   ├── popular-verses/            # Top 100 verses hub
│   ├── reading-plan/              # 365-day reading plan tool
│   ├── api/subscribe/             # Email capture endpoint
│   └── sitemap.ts                 # Dynamic sitemap generation
├── components/
│   ├── templates/                 # Page templates
│   │   ├── VersePage.tsx          # Verse detail template
│   │   ├── IntentPage.tsx         # Intent page template
│   │   ├── TopicPage.tsx          # Topic page template
│   │   └── BookOverviewPage.tsx   # Book overview template
│   ├── EmailPopup.tsx             # Email capture popup
│   ├── ExitIntentPopup.tsx        # Exit-intent triggered popup
│   └── ...                        # UI components
├── lib/
│   ├── seo/                       # SEO utilities
│   │   ├── metadata-factory.ts    # Dynamic metadata generation
│   │   ├── schema-builders.ts     # Schema.org JSON-LD builders
│   │   └── internal-links.ts      # Internal linking system
│   ├── verse-data-db.ts           # Database queries
│   ├── verse-detail-data.ts       # Enriched verse data loader
│   ├── book-data.ts               # Book/chapter constants
│   └── db.ts                      # PostgreSQL connection
├── data/
│   ├── KJV.json                   # 31,207 verses (all translations)
│   ├── priority-1000.json         # Top 1,000 verses for detail pages
│   ├── enriched-verses.json       # Gemini-enriched verse content
│   ├── topics-master.json         # 719 topics with search volume
│   ├── intents-master.json        # 3,808 user intents
│   ├── verses/                    # Generated verse content JSONs
│   └── books/                     # Book data
├── scripts/                       # ~62 generation & utility scripts
│   ├── enrich-verses-gemini.mjs   # Verse enrichment via Gemini
│   ├── submit-urls-to-gsc.mjs     # Google Search Console URL submission
│   └── ...                        # Batch generation, scraping, monitoring
├── public/
│   ├── robots.txt                 # Crawl directives + sitemap reference
│   └── llms.txt                   # LLM discoverability file
└── programmatic-seo/              # SEO research & strategy docs
```

---

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- Docker (for local PostgreSQL)
- Vercel CLI (optional, for deployment)

### Installation

```bash
# Clone repo
git clone https://github.com/MagicWifiMoney/bible-verse-randomizer.git
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
RESEND_API_KEY=your_resend_key

# Gemini (content generation)
GEMINI_API_KEY=your_gemini_key

# Google Search Console (URL indexing)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account
GOOGLE_PRIVATE_KEY=your_private_key
```

---

## 📊 Page Generation Summary

| Page Type | Count | Source | Route |
|-----------|-------|--------|-------|
| Verse Details | 1,000 | AI-enriched content | `/verse/[slug]` |
| Verse Comparisons | 1,000 | 6-translation diffs | `/verse/[slug]/compare` |
| Chapter Pages (NIV) | 1,189 | Full verse text + FAQ schema | `/book/[book]/[chapter]` |
| Translation Chapters | 5,945 | 5 translations × 1,189 | `/book/[book]/[chapter]/[translation]` |
| Book Overviews | 66 | AI-generated summaries | `/book/[book]` |
| Topic Pages | 719 | DataForSEO search volume | `/topic/[slug]` |
| Intent Pages | 3,808 | User intent matching | `/for/[intent]` |
| Hub Pages | 5 | Static content | Various |
| Core Pages | 4 | Static | Home, About, Daily, Reading Plan |
| **Total** | **~13,736** | | |

---

## 🚀 Deployment

### Vercel

```bash
vercel link
vercel --prod
```

**DNS:** bibleverserandomizer.com → Vercel (via Cloudflare)

### ISR Configuration
- **High-volume routes** (`/verse/[ref]`, `/verse/[ref]/compare`, `/book/[book]/[chapter]/[translation]`): ISR with 24hr revalidation (keeps build under Vercel 75MB limit)
- **Pre-built pages:** Home, About, Daily, hub pages, top topics
- **Dynamic sitemap:** Auto-generates from route data

---

## 📈 SEO Strategy

### Target Keywords
- **Primary:** "bible verse randomizer" (160K/mo, 0-1/100 competition)
- **Secondary:** "random bible verse generator", "daily bible verse", "bible verses by topic"
- **Long-tail:** 45,000+ keyword opportunities across topics, intents, and verse meanings

### Content Pyramid
1. **Homepage** — Core tool experience
2. **Hub Pages** — Testament, translations, popular verses (link flow)
3. **Topic Pages** (719) — "bible verses about [love/faith/hope]"
4. **Verse Pages** (1K) — "[John 3:16] meaning and application"
5. **Comparison Pages** (1K) — Side-by-side translations
6. **Chapter Pages** (7.1K) — Full chapter text in 6 translations
7. **Intent Pages** (3.8K) — "bible verses for [difficult times/strength]"

### Schema Markup
- `FAQPage` on verse detail, hub, and chapter pages
- `HowTo` on reading plan page
- `Article` on verse detail pages
- `BreadcrumbList` on all pages
- `WebApplication` on homepage

---

## 🔗 Cross-Promotion

**Primary CTA:** [sermon-clips.com](https://sermon-clips.com)  
**Secondary:** [sermon-transcription.com](https://sermon-transcription.com)  
**Email Capture:** Exit-intent popup → welcome email → drip campaign → Sermon Clips pitch

---

## 💰 Cost Estimate

| Item | Cost |
|------|------|
| Vercel hosting | Free (Hobby) or $20/mo (Pro) |
| PostgreSQL | $0–25/mo |
| Gemini API (verse enrichment) | ~$77 one-time |
| Resend (email, 3K/mo) | Free |
| Domain | ~$12/yr |
| **Total** | **~$77 setup + $0–25/mo** |

---

## 📧 Support

- **Owner:** Jake Giebel
- **Organization:** [MagicWifiMoney](https://github.com/MagicWifiMoney)
- **Project Notion:** [Command Center](https://notion.so/Command-Center-2f73f6f42e108185866acceaa562b53c)

## 📄 License

Proprietary — All rights reserved
