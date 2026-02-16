/**
 * SEO Core Module
 * 
 * Centralized SEO functionality for Bible Verse Programmatic SEO system
 * 
 * @module seo
 */

// Metadata Factory
export {
  generateMetadata,
  generateKeywords,
  validateMetadata,
  type PageType,
  type MetadataInput,
  type VerseMetadataInput,
  type TopicMetadataInput,
  type IntentMetadataInput,
  type BookMetadataInput
} from './metadata-factory';

// Schema Builders
export {
  buildArticleSchema,
  buildFAQSchema,
  buildBreadcrumbSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildBookSchema,
  buildVersePageSchema,
  buildTopicPageSchema,
  buildIntentPageSchema,
  buildPageSchemas,
  combineSchemas,
  generateBreadcrumbs,
  validateSchema,
  type SchemaType,
  type ArticleSchemaInput,
  type FAQItem,
  type BreadcrumbItem,
  type VerseSchemaInput,
  type TopicSchemaInput,
  type IntentSchemaInput
} from './schema-builders';

// Internal Links
export {
  getRelatedLinks,
  flattenLinks,
  generateAnchorText,
  getPopularPages,
  countInternalLinks,
  validateInternalLinking,
  type InternalLink,
  type LinkSection
} from './internal-links';

// Content Validator
export {
  validateContent,
  checkUniqueness,
  validateFAQs,
  generateSuggestions,
  batchValidate,
  generateValidationReport,
  type ContentValidationResult,
  type ContentMetrics,
  type ContentInput
} from './content-validator';
