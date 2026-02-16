# Page Template Specifications
## 500+ Words Per Page, SEO-Optimized, User-Focused

---

## TEMPLATE 1: VERSE PAGE

**URL Pattern:** `/verse/[book]/[chapter]/[verse]`
**Example:** `/verse/john/3/16`
**Target Word Count:** 2,000-2,500 words

### Meta Data

```html
<title>[Book] [Chapter]:[Verse] - Meaning, Explanation & Context | BibleVerseRandomizer</title>
<meta name="description" content="Discover the meaning of [Book] [Chapter]:[Verse]. Read in 5 translations, explore context, and learn how to apply this verse to your life today." />
<meta property="og:title" content="[Book] [Chapter]:[Verse] - Full Meaning Explained" />
<meta property="og:description" content="[First 150 chars of quick summary]" />
<meta property="og:image" content="[Auto-generated verse image]" />
<meta property="og:type" content="article" />
<link rel="canonical" href="https://bibleverserandomizer.com/verse/[book]/[chapter]/[verse]" />
```

### Schema Markup

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[Book] [Chapter]:[Verse] - Meaning & Explanation",
  "description": "[Quick summary]",
  "articleBody": "[Full content]",
  "author": {
    "@type": "Organization",
    "name": "BibleVerseRandomizer"
  },
  "publisher": {
    "@type": "Organization",
    "name": "BibleVerseRandomizer",
    "logo": {
      "@type": "ImageObject",
      "url": "https://bibleverserandomizer.com/logo.png"
    }
  },
  "datePublished": "[Generation date]",
  "dateModified": "[Last update date]"
}
```

### Page Structure

#### 1. Breadcrumbs
```
Home > [Book] > Chapter [Number] > Verse [Number]
```

#### 2. Hero Section (Above the Fold)
```
┌──────────────────────────────────────────────┐
│ [Book] [Chapter]:[Verse]                     │
│                                              │
│ [Verse text in NIV - large, readable]       │
│ - [Reference]                                │
│                                              │
│ [Listen 🔊] [Copy 📋] [Bookmark ❤️] [Share 📤]│
└──────────────────────────────────────────────┘
```

**Components:**
- Verse text (default: NIV, user can switch)
- Translation selector dropdown (KJV, NIV, ESV, NLT, MSG, NASB)
- Audio player button (text-to-speech)
- Copy to clipboard button
- Bookmark button (saves to user collection)
- Share button (social media + copy link)

#### 3. Quick Summary (TL;DR Box)
```
┌──────────────────────────────────────────────┐
│ 📌 QUICK SUMMARY                             │
│                                              │
│ [2-3 sentence summary of what this verse     │
│  means in simple, modern language]           │
│                                              │
│ Key Theme: [Primary topic tag]               │
│ Testament: [Old/New]                         │
│ Reading Time: [X] min                        │
└──────────────────────────────────────────────┘
```

**Content:**
- 50-75 words
- Written for 8th-grade reading level
- Answers: "What does this verse mean in one sentence?"

#### 4. Translation Comparison Table
```
╔══════════╦═════════════════════════════════════╗
║ KJV      ║ [Verse text in King James Version]  ║
╠══════════╬═════════════════════════════════════╣
║ NIV      ║ [Verse text in NIV]                 ║
╠══════════╬═════════════════════════════════════╣
║ ESV      ║ [Verse text in ESV]                 ║
╠══════════╬═════════════════════════════════════╣
║ NLT      ║ [Verse text in NLT]                 ║
╚══════════╩═════════════════════════════════════╝
[Expand to see 2 more translations ▼]
```

**Interactive:**
- Collapsible (default: show 4, expand for all 6)
- Highlight differences button
- Copy individual translations

#### 5. Verse Meaning & Explanation (800-1,000 words)

**H2: What Does [Book] [Chapter]:[Verse] Mean?**

**Structure:**
- **Opening paragraph:** Restate verse, set context (100 words)
- **Word-by-word breakdown:** Key words in original language (Greek/Hebrew), meanings (300 words)
- **Theological interpretation:** What this verse teaches about God, humanity, salvation, etc. (300 words)
- **Common interpretations:** Different Christian traditions' views (if applicable) (200 words)

**Example:**
> The phrase "For God so loved" in John 3:16 comes from the Greek word "agape," meaning unconditional, sacrificial love. This isn't emotional affection, but a deliberate choice to value and serve another...

**Tone:** Informative, pastoral, accessible
**Avoid:** Overly academic jargon without explanation
**Include:** 
- Inline citations to related verses (e.g., "This echoes [1 John 4:19](#link)")
- Pull quotes for emphasis

#### 6. Historical & Cultural Context (400-600 words)

**H2: Context: When and Why Was This Written?**

**Structure:**
- **Who wrote it:** Author background (100 words)
- **When it was written:** Date, historical period (100 words)
- **Who was the audience:** Original recipients (100 words)
- **Cultural background:** Customs, practices of the time that illuminate meaning (200 words)

**Example:**
> John wrote his gospel around 90-100 AD, several decades after the other gospels. His audience was primarily Greek-speaking Christians facing early persecution. Understanding that "the world" (kosmos in Greek) had a specific meaning in first-century Judaism helps us grasp the radical nature of God's love extending beyond Israel...

#### 7. How to Apply This Verse Today (400-600 words)

**H2: Applying [Book] [Chapter]:[Verse] to Your Life**

**Structure:**
- **Personal application:** How this verse speaks to individual believers (200 words)
- **Real-life examples:** 2-3 scenarios where this verse provides guidance (200 words)
- **Practical steps:** 3-5 actionable takeaways (200 words)

**Example:**
> **Personal Application:**
> John 3:16 reminds us that we are deeply loved, not because of what we've done, but because of who God is. When you're feeling unworthy or distant from God, return to this verse...
>
> **Real-Life Examples:**
> - *In Relationships:* When a friend betrays you, John 3:16 shows how God loved us even when we were His enemies...
> - *In Decision-Making:* This verse can guide major life decisions by asking, "Will this choice reflect God's love?"...
>
> **Practical Steps:**
> 1. Memorize this verse (use our [flashcard tool](#link))
> 2. Journal about how God's love has shown up in your life this week
> 3. Share this verse with someone who needs to hear it

#### 8. Prayer Based on This Verse (150-200 words)

**H2: Prayer**

**Structure:**
- Address God
- Reference the verse content
- Personal petition or praise
- Closing

**Example:**
> Heavenly Father, thank You that You so loved the world—including me—that You gave Your only Son. Help me to grasp the depth of this love, even when I feel unworthy. Give me faith to believe in Jesus and receive the eternal life You offer. May this verse transform how I see myself, how I love others, and how I live each day. In Jesus' name, Amen.

**Tone:** Conversational, heartfelt, personal (not overly formal)

#### 9. Cross-References (5-10 Related Verses)

**H2: Related Bible Verses**

**Display:**
```
┌─────────────────────────────────────────────┐
│ 1 John 4:19                                 │
│ "We love because he first loved us."       │
│ → [Link to verse page]                      │
├─────────────────────────────────────────────┤
│ Romans 5:8                                  │
│ "But God demonstrates his own love..."     │
│ → [Link to verse page]                      │
└─────────────────────────────────────────────┘
[Show 5 more related verses ▼]
```

**Categorized by:**
- **Parallel passages** (same event in different gospel)
- **Thematic connections** (similar topic)
- **Contrast verses** (opposite teaching for balance)

#### 10. Frequently Asked Questions (10+ Questions)

**H2: FAQs About [Book] [Chapter]:[Verse]**

**Schema Markup:** FAQPage

**Questions (examples for John 3:16):**
1. What does "For God so loved the world" mean in John 3:16?
2. Who wrote John 3:16 and when?
3. What is the Greek word for "love" in John 3:16?
4. Does "the world" in John 3:16 mean every single person?
5. What does "perish" mean in this verse?
6. What is "eternal life" in John 3:16?
7. How do you apply John 3:16 to your life?
8. Is John 3:16 the most important verse in the Bible?
9. What verses go well with John 3:16?
10. Can I get a John 3:16 tattoo? (For popular verses)

**Answer Format:**
- 50-100 words each
- Direct, clear answer first sentence
- Supporting detail in 2-3 more sentences

#### 11. Interactive Tools (Embedded)

**H3: Explore This Verse Further**

```
┌─────────────────────────────────────────────┐
│ 🖼️  Generate Verse Image                    │
│     [Create shareable graphic] →            │
├─────────────────────────────────────────────┤
│ 🔊  Listen to This Verse                    │
│     [Play audio in 3 voices] →              │
├─────────────────────────────────────────────┤
│ 📝  Add to Your Study Collection            │
│     [Save & organize verses] →              │
└─────────────────────────────────────────────┘
```

#### 12. Related Topics (Tags)

**H3: Topics in This Verse**

```
[Love] [Salvation] [Faith] [Grace] [Eternal Life]
```
- Each tag links to topic hub page
- Max 7 tags per verse

#### 13. Sidebar (Desktop) or Below Content (Mobile)

**Popular in This Category:**
- Top 5 verses for the primary topic
- Dynamic based on page views

**Explore More:**
- Previous verse (John 3:15)
- Next verse (John 3:17)
- Chapter overview (John 3)
- Book overview (Gospel of John)

**Newsletter Signup:**
- "Get 1 verse about [Primary Topic] in your inbox daily for 30 days"
- Email capture form

#### 14. Footer Links

- Print this page
- Download PDF study guide
- Report an error
- Suggest an edit

---

## TEMPLATE 2: TOPIC HUB PAGE

**URL Pattern:** `/verses-about/[topic]`
**Example:** `/verses-about/love`
**Target Word Count:** 3,000-5,000 words

### Meta Data

```html
<title>100+ Bible Verses About [Topic] - Complete Guide | BibleVerseRandomizer</title>
<meta name="description" content="The most comprehensive collection of Bible verses about [topic]. Explore meanings, applications, and free study guides. Find the perfect verse for your situation." />
```

### Page Structure

#### 1. Hero Section
```
╔═══════════════════════════════════════════════╗
║  Bible Verses About [TOPIC]                   ║
║                                               ║
║  [150+ verses • organized by theme • free     ║
║   study guides • multiple translations]       ║
║                                               ║
║  [Search verses 🔍] [Filter ▼] [Download PDF] ║
╚═══════════════════════════════════════════════╝
```

#### 2. Quick Navigation (Table of Contents)
```
On This Page:
1. Top 10 Verses About [Topic]
2. All Verses About [Topic] (Organized by Sub-Topic)
3. How to Study [Topic] in the Bible
4. Sub-Topics & Related Themes
5. FAQs About [Topic]
6. Free Study Resources
```

#### 3. Introduction (500-700 words)

**H1: Bible Verses About [Topic]: Complete Guide**

**Structure:**
- **Opening hook:** Why this topic matters (100 words)
- **What the Bible says overall:** Bird's-eye view (200 words)
- **Why study this topic:** Benefits, spiritual growth (200 words)
- **How to use this page:** Navigation guide (100 words)

**Example (Love):**
> Love is the foundation of Christian faith. From God's love for humanity to our call to love one another, the Bible speaks extensively about love in its many forms. This comprehensive guide brings together over 150 Bible verses about love, organized by theme to help you find exactly what you're looking for...

#### 4. Top 10 Most Popular Verses (Feature Section)

**H2: Top 10 Bible Verses About [Topic]**

**Display:**
```
┌──────────────────────────────────────────────┐
│ 1. 1 Corinthians 13:4-7                      │
│    "Love is patient, love is kind..."        │
│                                              │
│    Why it's powerful: [100-word explanation] │
│    [Read full verse →]                       │
├──────────────────────────────────────────────┤
│ 2. John 3:16                                 │
│    "For God so loved the world..."           │
│    ...                                       │
└──────────────────────────────────────────────┘
```

**Each entry:**
- Verse reference + first line
- 100-word commentary on why it's important/powerful
- Link to full verse page
- Quick copy button

#### 5. All Verses About [Topic] (1,000-1,500 words)

**H2: Complete List of Bible Verses About [Topic]**

**Sub-sections by theme:**

**H3: [Sub-Topic 1]** (e.g., "God's Love for Us")
- 20-30 verses
- Brief intro to sub-topic (50 words)
- Each verse: reference + text (NIV default) + link

**H3: [Sub-Topic 2]** (e.g., "Loving Others")
- 20-30 verses
- Same format

**H3: [Sub-Topic 3]** (e.g., "Romantic Love")
- 20-30 verses

**Interactive filters:**
```
Filter by: [Testament ▼] [Book ▼] [Word Count ▼] [Translation ▼]
Sort by: [Relevance] [Book Order] [Popularity]
```

#### 6. How to Study [Topic] in the Bible (600-800 words)

**H2: How to Study [Topic] in the Bible**

**Structure:**
- **Step 1:** Start with key verses (100 words)
- **Step 2:** Read in context (100 words)
- **Step 3:** Compare translations (100 words)
- **Step 4:** Look at biblical examples (100 words)
- **Step 5:** Apply to your life (100 words)
- **Recommended tools:** (100 words)

#### 7. Sub-Topics & Related Themes (300-500 words)

**H2: Explore Related Topics**

```
┌────────────────────┬────────────────────┐
│ Romantic Love      │ 45 verses →        │
│ God's Love         │ 78 verses →        │
│ Self-Love          │ 23 verses →        │
│ Love for Enemies   │ 17 verses →        │
└────────────────────┴────────────────────┘
```

**Also explore:**
- Related topics: [Forgiveness] [Grace] [Compassion]
- Opposite topic: [Hate] [Indifference]

#### 8. FAQs (20+ Questions)

**H2: Frequently Asked Questions About [Topic] in the Bible**

**Questions:**
1. What does the Bible say about [topic]?
2. What is the most important Bible verse about [topic]?
3. How many times is [topic] mentioned in the Bible?
4. What is the biblical definition of [topic]?
5. How do I apply Bible verses about [topic] to my life?
6. Are there different types of [topic] in the Bible?
7. What are the best books of the Bible to study [topic]?
8. What did Jesus say about [topic]?
9. What are some short Bible verses about [topic]?
10. How can I memorize verses about [topic]?
... (10 more)

#### 9. Free Study Resources

**H2: Free Resources to Go Deeper**

```
┌─────────────────────────────────────────────┐
│ 📄 Download: "[Topic]" Study Guide (PDF)    │
│    30-page guide with all verses, notes,    │
│    reflection questions, and prayers        │
│    [Download Free →]                        │
├─────────────────────────────────────────────┤
│ 📧 Email Series: "30 Days of [Topic]"       │
│    Get 1 verse about [topic] daily + short  │
│    devotional in your inbox                 │
│    [Sign Up Free →]                         │
├─────────────────────────────────────────────┤
│ 🃏 Flashcards: Memorize [Topic] Verses      │
│    Interactive flashcard deck with 50 verses│
│    [Start Studying →]                       │
└─────────────────────────────────────────────┘
```

#### 10. Interactive Tools

- Verse memory quiz (test yourself)
- Random verse generator (get daily inspiration)
- Verse comparison tool
- Create your own collection

---

## TEMPLATE 3: INTENT PAGE (OCCASIONS)

**URL Pattern:** `/verses-for/[occasion]`
**Example:** `/verses-for/weddings`
**Target Word Count:** 2,500-3,500 words

### Page Structure

#### 1. Hero + Value Prop
```
╔═══════════════════════════════════════════════╗
║  Bible Verses for [Occasion]                  ║
║                                               ║
║  50+ Perfect Verses • How to Use Them •       ║
║  Free Templates & Scripts                     ║
║                                               ║
║  [Download Wedding Script →]                  ║
╚═══════════════════════════════════════════════╝
```

#### 2. Quick Start Guide (300 words)
**H2: How to Choose Bible Verses for [Occasion]**
- What makes a good [occasion] verse
- How to incorporate into [ceremony/event]
- Common mistakes to avoid

#### 3. Best Verses for [Occasion] (1,000-1,500 words)

**Organized by section/usage:**

**For Weddings:**
- H3: Verses for the Processional (5 verses)
- H3: Verses for the Opening Blessing (10 verses)
- H3: Verses for the Vows (15 verses)
- H3: Verses for the Unity Ceremony (10 verses)
- H3: Verses for the Benediction (10 verses)

**For Funerals:**
- H3: Verses for Comfort (20 verses)
- H3: Verses for Hope & Resurrection (15 verses)
- H3: Verses for Celebration of Life (15 verses)

**Each verse:**
- Reference + full text
- 50-word note on how to use it
- Link to full verse page

#### 4. Example Scripts/Templates (600-800 words)

**H2: Sample [Occasion] Scripts Using These Verses**

**Script 1: Traditional [Occasion]**
- Full script with verses integrated
- Downloadable PDF

**Script 2: Modern [Occasion]**
- Contemporary language
- Downloadable PDF

**Script 3: Short & Sweet**
- 5-minute version
- Downloadable PDF

#### 5. FAQs (15+ Questions)

**Example (Weddings):**
1. What are the most popular Bible verses for weddings?
2. Can I use Bible verses in a secular wedding?
3. How many Bible verses should be in a wedding ceremony?
4. What Bible verses are good for wedding invitations?
5. Are there Bible verses about marriage that aren't too traditional?
... (10 more)

#### 6. Interactive Tools

**Ceremony Builder (for Weddings):**
```
┌─────────────────────────────────────────────┐
│ Build Your Custom Wedding Ceremony          │
│                                             │
│ Step 1: Choose ceremony style               │
│ ○ Traditional  ○ Modern  ○ Outdoor          │
│                                             │
│ Step 2: Select verses for each section     │
│ [Auto-suggest based on your style]          │
│                                             │
│ Step 3: Download complete script            │
│ [Generate PDF →]                            │
└─────────────────────────────────────────────┘
```

---

## TEMPLATE 4: SUB-TOPIC PAGE

**URL Pattern:** `/verses-about/[topic]/[sub-topic]`
**Example:** `/verses-about/love/romantic-love`
**Target Word Count:** 1,500-2,000 words

### Page Structure

#### 1. Breadcrumbs
```
Home > Verses About Love > Romantic Love
```

#### 2. Introduction (300-400 words)
**H1: Bible Verses About [Sub-Topic]**
- What the Bible says about this specific aspect
- How it relates to parent topic
- Why it matters

#### 3. Top Verses (20-50 verses)
**H2: [Number] Bible Verses About [Sub-Topic]**
- Each with brief note (25-50 words)
- Organized by testament or theme

#### 4. Deeper Dive (400-600 words)
**H2: What Does the Bible Really Say About [Sub-Topic]?**
- Theological perspective
- Practical application
- Common questions

#### 5. FAQs (10 Questions)

#### 6. Related Sub-Topics
```
Also explore:
→ [Related Sub-Topic 1] (32 verses)
→ [Related Sub-Topic 2] (18 verses)
→ [Related Sub-Topic 3] (45 verses)

Back to main topic: [Parent Topic] →
```

---

## TEMPLATE 5: BOOK/CHAPTER OVERVIEW

**URL Pattern:** `/books/[book]/chapter-[number]`
**Example:** `/books/john/chapter-3`
**Target Word Count:** 1,500-2,000 words

### Page Structure

#### 1. Chapter Summary (300 words)
**H1: [Book] Chapter [Number] Summary**
- What happens in this chapter
- Key themes
- Important verses highlighted

#### 2. Verse-by-Verse Notes (600-800 words)
**H2: Verse-by-Verse Breakdown**
- Each verse: reference + 1-2 sentence summary
- Links to full verse pages

#### 3. Key Verses Section (200 words)
**H2: Most Important Verses in [Book] Chapter [Number]**
- 5-10 key verses with brief explanations

#### 4. Historical Context (300 words)
**H2: Context & Background**

#### 5. Themes & Lessons (300 words)
**H2: What We Learn from This Chapter**

#### 6. How to Study This Chapter (200 words)

#### 7. Chapter Navigation
```
← Previous Chapter | [Book] Overview | Next Chapter →
```

---

## CONTENT QUALITY CHECKLIST

### Every Page Must Have:

✅ **SEO Fundamentals:**
- [ ] Unique H1 with target keyword
- [ ] Meta title (50-60 chars)
- [ ] Meta description (150-160 chars)
- [ ] Target keyword in first 100 words
- [ ] Keyword density 1-2% (natural)
- [ ] At least 1 image (optimized alt text)
- [ ] Schema markup (Article or FAQPage)
- [ ] Canonical URL

✅ **Internal Linking:**
- [ ] Breadcrumbs
- [ ] 5-10 contextual links in body
- [ ] Related verses/topics sidebar
- [ ] Cross-references section
- [ ] Topic tags (3-7)

✅ **User Experience:**
- [ ] Clear headings hierarchy
- [ ] Scannable (bullet points, short paragraphs)
- [ ] Table of contents (1,500+ word pages)
- [ ] Interactive elements (copy, bookmark, share buttons)
- [ ] Mobile-responsive
- [ ] Fast load time (<2s)

✅ **Engagement:**
- [ ] At least 1 CTA (email signup, download, bookmark)
- [ ] Share buttons
- [ ] Print-friendly version
- [ ] Related content recommendations

✅ **Content Quality:**
- [ ] Minimum word count met
- [ ] Written for 8th-grade reading level (Flesch score 60+)
- [ ] No grammar/spelling errors (Grammarly check)
- [ ] Unique content (not duplicate)
- [ ] Answers user intent (matches keyword query)
- [ ] Includes examples, applications, not just definitions

---

## WRITING STYLE GUIDE

### Tone
- **Warm & approachable** (like a trusted friend)
- **Pastoral but not preachy**
- **Informative without being academic**
- **Inclusive** (avoid denominational debates where possible)

### Voice
- **Active voice** preferred
- **Second person** ("you") for application sections
- **First person plural** ("we") for communal faith language
- **Third person** for explaining theology

### Formatting
- **Short paragraphs:** 2-4 sentences max
- **Bullet points:** For lists of 3+ items
- **Bold:** For emphasis (sparingly)
- **Italics:** For biblical terms, book titles
- **Headings:** Every 200-300 words

### Biblical References
- **Inline format:** John 3:16 (not Jn 3:16)
- **Always link** to verse pages
- **Hover preview** for quick reference (if possible)

### Avoid
- ❌ Overly formal/archaic language ("thou", "verily")
- ❌ Denominational jargon without explanation
- ❌ Controversial stances on secondary issues
- ❌ Assumption of prior Bible knowledge
- ❌ All-caps (except for emphasis in quotes)

---

## CONTENT GENERATION WORKFLOW

### 1. Manual (for top 1,000 pages)
- Human writer + theologian review
- Full custom content
- Deep research & original insights

### 2. AI-Assisted (for pages 1,001-5,000)
- AI generates first draft (GPT-4)
- Human editor reviews & edits
- Theologian spot-checks theology

### 3. Template + AI (for pages 5,001-200,000)
- Template fills fixed sections (verse text, references)
- AI generates variable sections (intros, applications, FAQs)
- Automated QA checks (word count, readability, keyword density)
- Human review of random 10% sample monthly

---

## CONCLUSION

These templates ensure:
- ✅ Every page is 500+ words (most 1,500-3,000)
- ✅ SEO-optimized
- ✅ User-focused (answers questions, provides value)
- ✅ Consistent structure (users know what to expect)
- ✅ Scalable (templates support 200k+ pages)

**Next:** Implement templates in Next.js components, set up content generation pipeline, deploy first 100 pages for testing.
