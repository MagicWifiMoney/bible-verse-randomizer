import { Metadata } from 'next';
import IntentPage, { IntentPageData } from '@/components/templates/IntentPage';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: { intent: string } }): Promise<Metadata> {
  const intent = await getIntentData(params.intent);
  if (!intent) return { title: 'Not Found' };
  
  return generateSEOMetadata('intent', {
    name: intent.name,
    slug: intent.slug,
    category: intent.category,
    verseCount: intent.verses.length
  });
}

export default async function IntentPageRoute({ params }: { params: { intent: string } }) {
  const intent = await getIntentData(params.intent);
  if (!intent) return <div>Intent page not found</div>;
  
  return <IntentPage intent={intent} />;
}

async function getIntentData(slug: string): Promise<IntentPageData | null> {
  // TODO: Database query
  return null;
}
