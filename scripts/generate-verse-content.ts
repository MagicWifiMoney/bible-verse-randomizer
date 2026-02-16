#!/usr/bin/env ts-node

/**
 * Generate Verse Content
 * 
 * Uses Claude Sonnet API to generate comprehensive content for a Bible verse:
 * - Context (200 words)
 * - Meaning (400 words)
 * - Application (400 words)
 * - Prayer (200 words)
 * - FAQs (3-5 questions)
 * 
 * Usage:
 *   ts-node scripts/generate-verse-content.ts john-3-16
 */

import Anthropic from '@anthropic-ai/sdk';
import { validateContent } from '../lib/seo/content-validator';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

interface VerseInput {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation?: string;
}

interface GeneratedContent {
  context: string;
  meaning: string;
  application: string;
  prayer: string;
  faqs: Array<{ question: string; answer: string }>;
}

/**
 * Generate content for a single verse using Claude API
 */
export async function generateVerseContent(verse: VerseInput): Promise<GeneratedContent> {
  const reference = `${verse.book} ${verse.chapter}:${verse.verse}`;
  
  console.log(`\n🤖 Generating content for ${reference}...`);
  
  const prompt = buildPrompt(verse);
  
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Extract content from response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const content = parseResponse(responseText);
    
    // Validate content
    const validation = validateContent({
      pageType: 'verse',
      title: `${reference} - Meaning and Context`,
      content: `${content.context}\n\n${content.meaning}\n\n${content.application}`,
      sections: {
        context: content.context,
        meaning: content.meaning,
        application: content.application,
        prayer: content.prayer,
        faqs: content.faqs
      }
    });
    
    if (!validation.valid) {
      console.warn('⚠️  Content validation warnings:');
      validation.errors.forEach(err => console.warn(`   - ${err}`));
      validation.warnings.forEach(warn => console.warn(`   - ${warn}`));
    } else {
      console.log(`✅ Content generated successfully (${validation.metrics.wordCount} words, score: ${validation.score}/100)`);
    }
    
    return content;
    
  } catch (error) {
    console.error(`❌ Error generating content for ${reference}:`, error);
    throw error;
  }
}

/**
 * Build the AI prompt
 */
function buildPrompt(verse: VerseInput): string {
  const reference = `${verse.book} ${verse.chapter}:${verse.verse}`;
  
  return `You are a biblical scholar and theologian creating educational content about Bible verses. Generate comprehensive, accurate, and engaging content for ${reference}.

VERSE TEXT:
"${verse.text}" (${verse.translation || 'NIV'})

Generate the following sections in this EXACT format:

=== CONTEXT ===
[Write 200 words explaining:
- Who was speaking/writing
- To whom and when
- What was happening in this passage
- Why this moment/teaching is significant
Keep it factual, engaging, and accessible to general readers.]

=== MEANING ===
[Write 400 words explaining:
- What this verse means (break down key phrases)
- Original language insights if relevant (Greek/Hebrew)
- Theological significance
- Key themes and concepts
Be thorough but avoid overly technical jargon.]

=== APPLICATION ===
[Write 400 words on practical application:
- How this verse applies to modern life
- Specific, actionable steps readers can take
- Real-world examples and scenarios
- Reflection questions
Make it relatable and practical for everyday Christians.]

=== PRAYER ===
[Write a 200-word prayer inspired by this verse:
- Incorporate themes from the verse
- Personal but not denominationally specific
- Warm, encouraging, and heartfelt tone]

=== FAQ ===
[Generate 5 frequently asked questions and answers about this verse:
Format each as:
Q: [Question about the verse]
A: [50-100 word answer]

Common question types:
- What is the context of ${reference}?
- What does [key word/phrase] mean?
- How can I apply this to my life?
- What are similar verses?
- What translation is best for understanding this?]

IMPORTANT:
- Be theologically sound and non-denominational
- Cite Scripture when referencing other verses
- Write at an 8th-10th grade reading level
- Be encouraging and practical
- Avoid controversial theological debates
- Focus on universal Christian truths

Begin your response with "=== CONTEXT ===" and follow the format exactly.`;
}

/**
 * Parse the AI response into structured content
 */
function parseResponse(responseText: string): GeneratedContent {
  const sections = {
    context: extractSection(responseText, 'CONTEXT'),
    meaning: extractSection(responseText, 'MEANING'),
    application: extractSection(responseText, 'APPLICATION'),
    prayer: extractSection(responseText, 'PRAYER'),
    faqs: extractFAQs(responseText)
  };
  
  return sections;
}

/**
 * Extract a section from the response
 */
function extractSection(text: string, sectionName: string): string {
  const regex = new RegExp(`===\\s*${sectionName}\\s*===([\\s\\S]*?)(?:===|$)`, 'i');
  const match = text.match(regex);
  
  if (!match) {
    console.warn(`⚠️  Could not find ${sectionName} section in response`);
    return '';
  }
  
  return match[1].trim();
}

/**
 * Extract FAQs from the response
 */
function extractFAQs(text: string): Array<{ question: string; answer: string }> {
  const faqSection = extractSection(text, 'FAQ');
  const faqs: Array<{ question: string; answer: string }> = [];
  
  // Match Q: ... A: ... patterns
  const faqRegex = /Q:\s*([^\n]+)\s*A:\s*([^\n]+(?:\n(?!Q:)[^\n]+)*)/g;
  let match;
  
  while ((match = faqRegex.exec(faqSection)) !== null) {
    faqs.push({
      question: match[1].trim(),
      answer: match[2].trim()
    });
  }
  
  if (faqs.length === 0) {
    console.warn('⚠️  Could not parse FAQs from response');
  }
  
  return faqs;
}

/**
 * Save generated content to database
 * TODO: Implement database save
 */
export async function saveToDatabase(
  verseId: number,
  content: GeneratedContent
): Promise<void> {
  console.log('💾 Saving to database...');
  
  // TODO: Implement Supabase save
  /*
  const { error } = await supabase
    .from('verses')
    .update({
      context: content.context,
      meaning: content.meaning,
      application: content.application,
      prayer: content.prayer,
      updated_at: new Date().toISOString()
    })
    .eq('id', verseId);
  
  if (error) throw error;
  
  // Save FAQs separately
  for (const faq of content.faqs) {
    await supabase.from('faqs').insert({
      entity_type: 'verse',
      entity_id: verseId,
      question: faq.question,
      answer: faq.answer
    });
  }
  */
  
  console.log('✅ Saved to database');
}

/**
 * CLI execution
 */
async function main() {
  const verseSlug = process.argv[2];
  
  if (!verseSlug) {
    console.error('Usage: ts-node generate-verse-content.ts <verse-slug>');
    console.error('Example: ts-node generate-verse-content.ts john-3-16');
    process.exit(1);
  }
  
  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY environment variable not set');
    console.error('Set it in .env.local:');
    console.error('   ANTHROPIC_API_KEY=your_key_here');
    process.exit(1);
  }
  
  // Parse verse reference from slug
  // TODO: Fetch from database instead
  const [book, chapter, verse] = verseSlug.split('-');
  
  const verseInput: VerseInput = {
    book: book.charAt(0).toUpperCase() + book.slice(1),
    chapter: parseInt(chapter),
    verse: parseInt(verse),
    text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.', // Example
    translation: 'NIV'
  };
  
  try {
    const content = await generateVerseContent(verseInput);
    
    console.log('\n' + '='.repeat(60));
    console.log('GENERATED CONTENT');
    console.log('='.repeat(60));
    console.log('\nCONTEXT:');
    console.log(content.context);
    console.log('\nMEANING:');
    console.log(content.meaning);
    console.log('\nAPPLICATION:');
    console.log(content.application);
    console.log('\nPRAYER:');
    console.log(content.prayer);
    console.log('\nFAQS:');
    content.faqs.forEach((faq, i) => {
      console.log(`\n${i + 1}. ${faq.question}`);
      console.log(`   ${faq.answer}`);
    });
    console.log('\n' + '='.repeat(60));
    
    // TODO: Save to database
    // await saveToDatabase(verseId, content);
    
  } catch (error) {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
