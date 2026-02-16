/**
 * Verse Page - Dynamic Route
 * 
 * Route: /verse/[reference]
 * Example: /verse/john-3-16
 * 
 * Uses ISR (Incremental Static Regeneration)
 * - Revalidate every 24 hours
 * - Pre-build top 1,000 verses
 * - Generate others on-demand
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import VersePage, { VersePageData } from '@/components/templates/VersePage';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo/metadata-factory';
import { buildPageSchemas } from '@/lib/seo/schema-builders';
import { getRelatedLinks } from '@/lib/seo/internal-links';

// ISR: Revalidate every 24 hours
export const revalidate = 86400;

// Database client (mock for now - replace with actual Supabase client)
// import { createClient } from '@supabase/supabase-js';
// const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: { params: { reference: string } }): Promise<Metadata> {
  const verse = await getVerseData(params.reference);
  
  if (!verse) {
    return {
      title: 'Verse Not Found',
      description: 'The requested Bible verse could not be found.'
    };
  }

  return generateSEOMetadata('verse', {
    book: verse.book,
    chapter: verse.chapter,
    verse: verse.verse,
    text: verse.text_niv || verse.text_kjv || '',
    slug: verse.slug,
    topics: verse.topics?.map(t => t.name)
  });
}

/**
 * Pre-generate static params for top verses
 * (Only top 1,000 will be pre-built at build time)
 */
export async function generateStaticParams() {
  // In production, fetch top 1,000 verses from database
  // For now, return a sample
  const topVerses = [
    'john-3-16',
    'philippians-4-13',
    'jeremiah-29-11',
    'proverbs-3-5',
    'romans-8-28',
    'psalms-23-1',
    'isaiah-40-31',
    'matthew-6-33',
    'joshua-1-9',
    'proverbs-3-6'
  ];

  return topVerses.map(slug => ({
    reference: slug
  }));
}

/**
 * Main page component
 */
export default async function VersePageRoute({ params }: { params: { reference: string } }) {
  const verse = await getVerseData(params.reference);

  if (!verse) {
    notFound();
  }

  // Get related links
  const relatedLinks = await getRelatedLinks('verse', verse, {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://bibleverserandomizer.com'
  });

  // Get popular verses in same book
  const popularInBook = await getPopularInBook(verse.book, verse.slug);

  // Generate JSON-LD schema
  const schema = buildPageSchemas({
    pageType: 'verse',
    data: verse,
    pathname: `/verse/${params.reference}`,
    currentPageName: `${verse.book} ${verse.chapter}:${verse.verse}`
  });

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      {/* Render verse page template */}
      <VersePage
        verse={verse}
        relatedLinks={relatedLinks}
        popularInBook={popularInBook}
      />
    </>
  );
}

/**
 * Fetch verse data from database
 * TODO: Replace with actual Supabase query
 */
async function getVerseData(reference: string): Promise<VersePageData | null> {
  // Mock data for demonstration
  // In production, this would query the database:
  /*
  const { data, error } = await supabase
    .from('verses')
    .select(`
      *,
      topics:verse_topics(topic:topics(*)),
      cross_references:cross_references(related_verse:verses(*))
    `)
    .eq('slug', reference)
    .single();
  
  if (error || !data) return null;
  return data;
  */

  // Mock response for development
  if (reference === 'john-3-16') {
    return {
      id: 1,
      book: 'John',
      chapter: 3,
      verse: 16,
      slug: 'john-3-16',
      testament: 'New Testament',
      text_niv: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
      text_kjv: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
      text_esv: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
      context: 'This verse comes from Jesus\' nighttime conversation with Nicodemus, a Pharisee and member of the Jewish ruling council. Nicodemus came to Jesus seeking understanding, and Jesus explained the nature of spiritual rebirth and God\'s plan of salvation.\n\nThe context of this passage is crucial: Jesus is explaining how the Son of Man must be "lifted up" (referring to His crucifixion) so that everyone who believes may have eternal life. John 3:16 follows this explanation and encapsulates the entire gospel message in one profound sentence.',
      meaning: 'John 3:16 is perhaps the most well-known verse in the Bible, summarizing the core message of Christianity in a single sentence. Let\'s break down its key components:\n\n"For God so loved the world" - This establishes God\'s motivation: love. Not obligation, not duty, but genuine love for humanity. The word "world" (Greek: kosmos) emphasizes that God\'s love extends to all people, not just a select few.\n\n"that he gave his one and only Son" - This describes the cost of God\'s love. He didn\'t just send words of encouragement; He gave His most precious treasure. The phrase "one and only" (Greek: monogenēs) emphasizes the uniqueness and preciousness of Jesus.\n\n"that whoever believes in him" - This outlines the requirement: faith. Salvation is not earned through works but received through belief. "Whoever" emphasizes the universal availability of this gift.\n\n"shall not perish but have eternal life" - This presents the outcome: salvation from spiritual death and the gift of eternal life. "Perish" refers to eternal separation from God, while "eternal life" means both quantity (forever) and quality (abundant, meaningful life in relationship with God).',
      application: 'This verse has profound implications for our daily lives:\n\n1. **Understanding God\'s Love**: When you feel unlovable or unworthy, remember that God\'s love isn\'t based on your performance. He loves you enough to give His Son for you. Let this truth anchor your identity and self-worth.\n\n2. **Sharing the Gospel**: John 3:16 provides a simple framework for explaining Christianity to others. You can share how God\'s love motivated Him to provide salvation through Jesus, available to anyone who believes.\n\n3. **Living with Gratitude**: Reflecting on the magnitude of God\'s gift should fill us with gratitude. This gratitude naturally flows into worship, service, and generous living.\n\n4. **Embracing All People**: Just as God\'s love extends to "the world," we should love all people regardless of background, status, or behavior. This verse calls us to break down barriers and share God\'s love inclusively.\n\n5. **Assurance of Salvation**: When doubt creeps in about your salvation, return to this verse. It\'s not about your ability to hold onto God, but about believing in what He has done through Jesus.',
      prayer: 'Heavenly Father, thank You for loving me so deeply that You gave Your only Son for my salvation. Help me to truly grasp the magnitude of this gift and never take it for granted. Teach me to love others with the same unconditional love You have shown me. When I doubt, remind me of Your promise of eternal life to all who believe. May my life be a reflection of the incredible grace I have received through Jesus Christ. In His precious name, Amen.',
      topics: [
        { id: 1, name: 'Love', slug: 'love' },
        { id: 2, name: 'Salvation', slug: 'salvation' },
        { id: 3, name: 'Faith', slug: 'faith' },
        { id: 4, name: 'Grace', slug: 'grace' }
      ],
      cross_references: [
        { book: 'Romans', chapter: 5, verse: 8, slug: 'romans-5-8', text: 'But God demonstrates his own love for us in this: While we were still sinners, Christ died for us.' },
        { book: '1 John', chapter: 4, verse: 9, slug: '1-john-4-9', text: 'This is how God showed his love among us: He sent his one and only Son into the world that we might live through him.' },
        { book: 'John', chapter: 1, verse: 12, slug: 'john-1-12', text: 'Yet to all who did receive him, to those who believed in his name, he gave the right to become children of God.' },
        { book: 'Ephesians', chapter: 2, verse: 8, slug: 'ephesians-2-8', text: 'For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God.' }
      ],
      faqs: [
        {
          question: 'What is the context of John 3:16?',
          answer: 'John 3:16 comes from Jesus\' conversation with Nicodemus, a Pharisee who came to Jesus at night seeking understanding. Jesus was explaining the need for spiritual rebirth and God\'s plan of salvation through His sacrifice.'
        },
        {
          question: 'What does "only begotten Son" mean in John 3:16?',
          answer: 'The phrase "only begotten" (Greek: monogenēs) means "one and only" or "unique." It emphasizes that Jesus is God\'s unique Son, sharing the same divine nature as the Father, unlike believers who are adopted children of God.'
        },
        {
          question: 'Does "the world" in John 3:16 mean everyone is automatically saved?',
          answer: 'No. While God\'s love extends to everyone ("the world"), the verse makes clear that salvation comes through believing in Jesus. The gift is offered to all, but it must be received through faith to be effective.'
        },
        {
          question: 'What does "eternal life" mean in this verse?',
          answer: 'Eternal life refers to both the duration and quality of life. It\'s not just living forever, but experiencing abundant, meaningful life in relationship with God that begins now and continues forever in His presence.'
        },
        {
          question: 'How do I "believe" according to John 3:16?',
          answer: 'Biblical belief is more than intellectual agreement—it\'s placing your trust in Jesus as your Savior and Lord. It involves acknowledging your need for salvation, trusting that Jesus\' death and resurrection paid for your sins, and committing to follow Him.'
        }
      ],
      popularity_score: 10000
    };
  }

  return null;
}

/**
 * Get popular verses in the same book
 * TODO: Replace with actual database query
 */
async function getPopularInBook(book: string, currentSlug: string): Promise<Array<{ book: string; chapter: number; verse: number; slug: string }>> {
  // Mock data
  return [
    { book: 'John', chapter: 1, verse: 1, slug: 'john-1-1' },
    { book: 'John', chapter: 14, verse: 6, slug: 'john-14-6' },
    { book: 'John', chapter: 15, verse: 13, slug: 'john-15-13' },
    { book: 'John', chapter: 10, verse: 10, slug: 'john-10-10' },
    { book: 'John', chapter: 8, verse: 32, slug: 'john-8-32' }
  ].filter(v => v.slug !== currentSlug);
}
