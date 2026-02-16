/**
 * Content Validator
 * 
 * Validates generated content meets SEO and quality standards:
 * - Word count minimums (1,500+ for verse pages)
 * - Uniqueness (max 20% duplicate across pages)
 * - Required sections present
 * - Readability scores
 * - SEO keyword usage
 * 
 * Usage:
 *   const validation = validateContent(content);
 *   if (!validation.valid) {
 *     console.log(validation.errors);
 *   }
 */

export interface ContentValidationResult {
  valid: boolean;
  score: number; // 0-100
  errors: string[];
  warnings: string[];
  metrics: ContentMetrics;
}

export interface ContentMetrics {
  wordCount: number;
  characterCount: number;
  paragraphCount: number;
  sentenceCount: number;
  averageWordsPerSentence: number;
  readabilityScore?: number;
  uniquenessScore?: number;
  keywordDensity?: Record<string, number>;
}

export interface ContentInput {
  pageType: 'verse' | 'topic' | 'intent' | 'book' | 'chapter';
  title: string;
  content: string; // Main text content (can be markdown or plain text)
  sections?: {
    intro?: string;
    context?: string;
    meaning?: string;
    application?: string;
    prayer?: string;
    faqs?: Array<{ question: string; answer: string }>;
  };
  metadata?: {
    description?: string;
    keywords?: string[];
  };
}

/**
 * Main validation function
 */
export function validateContent(input: ContentInput): ContentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Calculate metrics
  const metrics = calculateMetrics(input.content);
  
  // Validate word count
  const minWordCount = getMinWordCount(input.pageType);
  if (metrics.wordCount < minWordCount) {
    errors.push(`Word count too low: ${metrics.wordCount} (minimum: ${minWordCount})`);
  } else if (metrics.wordCount < minWordCount * 1.2) {
    warnings.push(`Word count is acceptable but on the low end: ${metrics.wordCount}`);
  }
  
  // Validate required sections
  const missingSections = validateRequiredSections(input);
  if (missingSections.length > 0) {
    errors.push(`Missing required sections: ${missingSections.join(', ')}`);
  }
  
  // Validate uniqueness (if previous content provided for comparison)
  // This is a simplified check - real implementation would compare against database
  
  // Validate readability
  metrics.readabilityScore = calculateReadability(metrics);
  if (metrics.readabilityScore < 40) {
    warnings.push('Content may be too complex (low readability score)');
  } else if (metrics.readabilityScore > 90) {
    warnings.push('Content may be too simple');
  }
  
  // Validate title
  if (!input.title || input.title.length === 0) {
    errors.push('Title is required');
  } else if (input.title.length > 70) {
    warnings.push(`Title too long: ${input.title.length} characters (recommend <60)`);
  } else if (input.title.length < 30) {
    warnings.push(`Title too short: ${input.title.length} characters (recommend 50-60)`);
  }
  
  // Validate metadata description
  if (input.metadata?.description) {
    if (input.metadata.description.length > 160) {
      warnings.push(`Meta description too long: ${input.metadata.description.length} characters`);
    } else if (input.metadata.description.length < 120) {
      warnings.push(`Meta description too short: ${input.metadata.description.length} characters`);
    }
  }
  
  // Calculate keyword density
  if (input.metadata?.keywords && input.metadata.keywords.length > 0) {
    metrics.keywordDensity = calculateKeywordDensity(input.content, input.metadata.keywords);
    
    // Check for keyword stuffing
    for (const [keyword, density] of Object.entries(metrics.keywordDensity)) {
      if (density > 3) {
        warnings.push(`Keyword "${keyword}" may be overused (${density.toFixed(1)}% density)`);
      } else if (density < 0.5) {
        warnings.push(`Keyword "${keyword}" underused (${density.toFixed(1)}% density, target 1-2%)`);
      }
    }
  }
  
  // Validate paragraph structure
  if (metrics.paragraphCount < 5) {
    warnings.push('Consider adding more paragraphs for better readability');
  }
  
  if (metrics.averageWordsPerSentence > 25) {
    warnings.push('Sentences may be too long (average >25 words)');
  }
  
  // Calculate overall score
  const score = calculateOverallScore(metrics, errors, warnings, minWordCount);
  
  return {
    valid: errors.length === 0,
    score,
    errors,
    warnings,
    metrics
  };
}

/**
 * Calculate content metrics
 */
function calculateMetrics(content: string): ContentMetrics {
  // Remove HTML/markdown tags for accurate counting
  const plainText = stripMarkdown(content);
  
  const words = plainText.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const characterCount = plainText.length;
  
  // Count paragraphs (double newlines or more)
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const paragraphCount = paragraphs.length;
  
  // Count sentences (approximate)
  const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;
  
  const averageWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  
  return {
    wordCount,
    characterCount,
    paragraphCount,
    sentenceCount,
    averageWordsPerSentence
  };
}

/**
 * Get minimum word count for page type
 */
function getMinWordCount(pageType: string): number {
  const minimums: Record<string, number> = {
    verse: 1500,
    topic: 2000,
    intent: 1800,
    book: 2000,
    chapter: 1000
  };
  
  return minimums[pageType] || 1000;
}

/**
 * Validate required sections exist
 */
function validateRequiredSections(input: ContentInput): string[] {
  const missing: string[] = [];
  
  switch (input.pageType) {
    case 'verse':
      if (!input.sections?.context) missing.push('context');
      if (!input.sections?.meaning) missing.push('meaning');
      if (!input.sections?.application) missing.push('application');
      if (!input.sections?.prayer) missing.push('prayer');
      if (!input.sections?.faqs || input.sections.faqs.length < 3) {
        missing.push('faqs (minimum 3)');
      }
      break;
      
    case 'topic':
      if (!input.sections?.intro) missing.push('intro');
      // Topics require categorized verse lists (checked elsewhere)
      break;
      
    case 'intent':
      if (!input.sections?.intro) missing.push('intro');
      if (!input.sections?.application) missing.push('application');
      break;
      
    case 'book':
      if (!input.sections?.intro) missing.push('intro');
      if (!input.sections?.context) missing.push('historical context');
      break;
  }
  
  return missing;
}

/**
 * Calculate Flesch Reading Ease score (simplified)
 * Score ranges: 0-100 (higher = easier to read)
 * 90-100: Very easy (5th grade)
 * 60-70: Standard (8th-9th grade)
 * 30-50: Difficult (college level)
 */
function calculateReadability(metrics: ContentMetrics): number {
  const { wordCount, sentenceCount, characterCount } = metrics;
  
  if (sentenceCount === 0 || wordCount === 0) return 0;
  
  const averageWordsPerSentence = wordCount / sentenceCount;
  const averageSyllablesPerWord = estimateSyllables(characterCount / wordCount);
  
  // Flesch Reading Ease formula
  const score = 206.835 - 1.015 * averageWordsPerSentence - 84.6 * averageSyllablesPerWord;
  
  // Clamp to 0-100
  return Math.max(0, Math.min(100, score));
}

/**
 * Estimate syllables per word based on average character count
 * This is a rough approximation
 */
function estimateSyllables(avgCharsPerWord: number): number {
  // Very rough approximation: every ~3 characters ≈ 1 syllable
  return Math.max(1, avgCharsPerWord / 3);
}

/**
 * Calculate keyword density
 */
function calculateKeywordDensity(content: string, keywords: string[]): Record<string, number> {
  const plainText = stripMarkdown(content).toLowerCase();
  const totalWords = plainText.split(/\s+/).filter(w => w.length > 0).length;
  
  const density: Record<string, number> = {};
  
  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase();
    // Count occurrences (simple word boundary matching)
    const regex = new RegExp(`\\b${escapeRegex(keywordLower)}\\b`, 'gi');
    const matches = plainText.match(regex);
    const count = matches ? matches.length : 0;
    
    density[keyword] = totalWords > 0 ? (count / totalWords) * 100 : 0;
  }
  
  return density;
}

/**
 * Calculate overall quality score (0-100)
 */
function calculateOverallScore(
  metrics: ContentMetrics,
  errors: string[],
  warnings: string[],
  minWordCount: number
): number {
  let score = 100;
  
  // Deduct for errors (20 points each)
  score -= errors.length * 20;
  
  // Deduct for warnings (5 points each)
  score -= warnings.length * 5;
  
  // Bonus for exceeding word count significantly
  if (metrics.wordCount > minWordCount * 1.5) {
    score += 10;
  }
  
  // Bonus for good readability
  if (metrics.readabilityScore && metrics.readabilityScore >= 60 && metrics.readabilityScore <= 80) {
    score += 10;
  }
  
  // Clamp to 0-100
  return Math.max(0, Math.min(100, score));
}

/**
 * Check content uniqueness by comparing to existing content
 * Returns percentage similarity (0-100, where 0 = completely unique)
 */
export async function checkUniqueness(
  newContent: string,
  existingContents: string[]
): Promise<number> {
  if (existingContents.length === 0) return 0;
  
  const newText = stripMarkdown(newContent).toLowerCase();
  const newWords = new Set(newText.split(/\s+/));
  
  let maxSimilarity = 0;
  
  for (const existing of existingContents) {
    const existingText = stripMarkdown(existing).toLowerCase();
    const existingWords = new Set(existingText.split(/\s+/));
    
    // Calculate Jaccard similarity (intersection / union)
    const intersection = new Set([...newWords].filter(w => existingWords.has(w)));
    const union = new Set([...newWords, ...existingWords]);
    
    const similarity = (intersection.size / union.size) * 100;
    maxSimilarity = Math.max(maxSimilarity, similarity);
  }
  
  return maxSimilarity;
}

/**
 * Validate FAQs meet quality standards
 */
export function validateFAQs(faqs: Array<{ question: string; answer: string }>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (faqs.length < 3) {
    errors.push('Minimum 3 FAQs required');
  }
  
  if (faqs.length > 10) {
    errors.push('Too many FAQs (maximum 10 recommended)');
  }
  
  faqs.forEach((faq, index) => {
    if (!faq.question || faq.question.length < 10) {
      errors.push(`FAQ ${index + 1}: Question too short`);
    }
    
    if (!faq.answer || faq.answer.length < 50) {
      errors.push(`FAQ ${index + 1}: Answer too short (minimum 50 characters)`);
    }
    
    if (faq.answer.length > 500) {
      errors.push(`FAQ ${index + 1}: Answer too long (keep under 500 characters)`);
    }
    
    // Check if question starts with question word
    const questionWords = ['what', 'why', 'how', 'when', 'where', 'who', 'which', 'is', 'are', 'can', 'does'];
    const startsWithQuestionWord = questionWords.some(word => 
      faq.question.toLowerCase().startsWith(word)
    );
    
    if (!startsWithQuestionWord && !faq.question.includes('?')) {
      errors.push(`FAQ ${index + 1}: Should be phrased as a question`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Strip markdown/HTML tags from text
 */
function stripMarkdown(text: string): string {
  return text
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove markdown headers
    .replace(/^#+\s+/gm, '')
    // Remove markdown bold/italic
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove markdown links
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    .trim();
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Generate content improvement suggestions
 */
export function generateSuggestions(validation: ContentValidationResult): string[] {
  const suggestions: string[] = [];
  
  if (validation.metrics.wordCount < getMinWordCount('verse')) {
    suggestions.push('Add more detailed explanations in the "Meaning" and "Application" sections');
  }
  
  if (validation.metrics.paragraphCount < 8) {
    suggestions.push('Break content into more paragraphs for better readability');
  }
  
  if (validation.metrics.averageWordsPerSentence > 20) {
    suggestions.push('Consider shorter sentences for improved clarity');
  }
  
  if (validation.metrics.readabilityScore && validation.metrics.readabilityScore < 50) {
    suggestions.push('Simplify language to improve readability');
  }
  
  if (validation.warnings.some(w => w.includes('keyword'))) {
    suggestions.push('Review keyword usage to ensure natural integration');
  }
  
  return suggestions;
}

/**
 * Batch validate multiple pieces of content
 */
export function batchValidate(contents: ContentInput[]): {
  totalValid: number;
  totalInvalid: number;
  averageScore: number;
  results: ContentValidationResult[];
} {
  const results = contents.map(content => validateContent(content));
  
  const totalValid = results.filter(r => r.valid).length;
  const totalInvalid = results.filter(r => !r.valid).length;
  const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  
  return {
    totalValid,
    totalInvalid,
    averageScore,
    results
  };
}

/**
 * Export validation report as formatted string
 */
export function generateValidationReport(validation: ContentValidationResult): string {
  let report = '';
  
  report += `Content Validation Report\n`;
  report += `${'='.repeat(50)}\n\n`;
  
  report += `Overall Score: ${validation.score}/100\n`;
  report += `Status: ${validation.valid ? '✅ PASS' : '❌ FAIL'}\n\n`;
  
  report += `Metrics:\n`;
  report += `  Word Count: ${validation.metrics.wordCount}\n`;
  report += `  Paragraphs: ${validation.metrics.paragraphCount}\n`;
  report += `  Sentences: ${validation.metrics.sentenceCount}\n`;
  report += `  Avg Words/Sentence: ${validation.metrics.averageWordsPerSentence.toFixed(1)}\n`;
  if (validation.metrics.readabilityScore) {
    report += `  Readability Score: ${validation.metrics.readabilityScore.toFixed(1)}/100\n`;
  }
  report += `\n`;
  
  if (validation.errors.length > 0) {
    report += `Errors (${validation.errors.length}):\n`;
    validation.errors.forEach((error, i) => {
      report += `  ${i + 1}. ${error}\n`;
    });
    report += `\n`;
  }
  
  if (validation.warnings.length > 0) {
    report += `Warnings (${validation.warnings.length}):\n`;
    validation.warnings.forEach((warning, i) => {
      report += `  ${i + 1}. ${warning}\n`;
    });
    report += `\n`;
  }
  
  const suggestions = generateSuggestions(validation);
  if (suggestions.length > 0) {
    report += `Suggestions:\n`;
    suggestions.forEach((suggestion, i) => {
      report += `  ${i + 1}. ${suggestion}\n`;
    });
  }
  
  return report;
}
