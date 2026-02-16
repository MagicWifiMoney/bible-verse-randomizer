import { Metadata } from 'next';
import TopicPage, { TopicPageData } from '@/components/templates/TopicPage';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const topic = await getTopicData(params.slug);
  if (!topic) return { title: 'Topic Not Found' };
  
  return generateSEOMetadata('topic', {
    name: topic.name,
    slug: topic.slug,
    verseCount: topic.verses.length,
    description: topic.description
  });
}

export default async function TopicPageRoute({ params }: { params: { slug: string } }) {
  const topic = await getTopicData(params.slug);
  if (!topic) return <div>Topic not found</div>;
  
  return <TopicPage topic={topic} />;
}

async function getTopicData(slug: string): Promise<TopicPageData | null> {
  // TODO: Database query
  if (slug === 'love') {
    return {
      id: 1,
      name: 'Love',
      slug: 'love',
      description: 'Love is one of the most central themes in the Bible. From God\'s unconditional love for humanity to our calling to love one another, Scripture provides profound wisdom on this essential aspect of faith.',
      level: 1,
      verses: [
        {
          id: 1,
          book: 'John',
          chapter: 3,
          verse: 16,
          slug: 'john-3-16',
          text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
          relevance_score: 10,
          category: 'God\'s Love for Us'
        }
      ]
    };
  }
  return null;
}
