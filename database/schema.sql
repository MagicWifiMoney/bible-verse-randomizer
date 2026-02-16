-- Bible Verse Programmatic SEO Database Schema
-- PostgreSQL / Supabase compatible
-- Created: 2026-02-15

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Main verses table (31,102 Bible verses)
CREATE TABLE verses (
  id SERIAL PRIMARY KEY,
  book VARCHAR(50) NOT NULL,
  chapter INT NOT NULL,
  verse INT NOT NULL,
  text_kjv TEXT,
  text_niv TEXT,
  text_esv TEXT,
  text_nlt TEXT,
  text_msg TEXT,
  text_nasb TEXT,
  slug VARCHAR(100) UNIQUE NOT NULL,
  testament VARCHAR(20) NOT NULL CHECK (testament IN ('Old Testament', 'New Testament')),
  word_count INT,
  character_count INT,
  popularity_score INT DEFAULT 0,
  
  -- AI-generated content for verse pages
  context TEXT,           -- 200 words: What's happening in this passage
  meaning TEXT,           -- 400 words: What does it mean
  application TEXT,       -- 400 words: How to apply today
  prayer TEXT,            -- 200 words: Prayer inspired by verse
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Topics table (500+ hierarchical topics)
CREATE TABLE topics (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  parent_topic_id INT REFERENCES topics(id) ON DELETE SET NULL,
  level INT NOT NULL DEFAULT 1 CHECK (level IN (1, 2, 3)),
  search_volume INT DEFAULT 0,
  competition_score INT DEFAULT 0 CHECK (competition_score BETWEEN 0 AND 100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Many-to-many: Verses to Topics
CREATE TABLE verse_topics (
  verse_id INT REFERENCES verses(id) ON DELETE CASCADE,
  topic_id INT REFERENCES topics(id) ON DELETE CASCADE,
  relevance_score INT NOT NULL CHECK (relevance_score BETWEEN 1 AND 10),
  manual_review BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (verse_id, topic_id)
);

-- Cross-references between verses
CREATE TABLE cross_references (
  verse_id INT REFERENCES verses(id) ON DELETE CASCADE,
  related_verse_id INT REFERENCES verses(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) DEFAULT 'related' CHECK (
    relationship_type IN ('same_topic', 'parallel_passage', 'contrast', 'fulfillment', 'quote', 'related')
  ),
  strength INT DEFAULT 5 CHECK (strength BETWEEN 1 AND 10),
  manual_review BOOLEAN DEFAULT false,
  PRIMARY KEY (verse_id, related_verse_id),
  CHECK (verse_id != related_verse_id)
);

-- Intent-based pages (tattoos, weddings, funerals, etc.)
CREATE TABLE intent_pages (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  search_volume INT DEFAULT 0,
  competition_score INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Many-to-many: Intent pages to verses
CREATE TABLE intent_verses (
  intent_id INT REFERENCES intent_pages(id) ON DELETE CASCADE,
  verse_id INT REFERENCES verses(id) ON DELETE CASCADE,
  relevance_score INT NOT NULL CHECK (relevance_score BETWEEN 1 AND 10),
  usage_note TEXT,
  PRIMARY KEY (intent_id, verse_id)
);

-- Generated content storage
CREATE TABLE generated_content (
  id SERIAL PRIMARY KEY,
  page_type VARCHAR(50) NOT NULL CHECK (
    page_type IN ('verse', 'topic', 'sub_topic', 'intent', 'book', 'chapter', 'collection', 'study', 'tool')
  ),
  entity_id INT NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  meta_description VARCHAR(300),
  content_json JSONB,
  word_count INT,
  published BOOLEAN DEFAULT false,
  human_reviewed BOOLEAN DEFAULT false,
  generated_at TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW()
);

-- FAQs for pages
CREATE TABLE faqs (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  order_index INT DEFAULT 0,
  search_volume INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- USER TABLES (for future personalization)
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  email_verified BOOLEAN DEFAULT false,
  subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (
    subscription_tier IN ('free', 'premium', 'lifetime')
  )
);

CREATE TABLE user_bookmarks (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  verse_id INT REFERENCES verses(id) ON DELETE CASCADE,
  collection_name VARCHAR(100),
  personal_note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_reading_history (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  verse_id INT REFERENCES verses(id) ON DELETE SET NULL,
  page_slug VARCHAR(200),
  read_at TIMESTAMP DEFAULT NOW()
);

-- Email subscribers
CREATE TABLE email_subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  subscription_type VARCHAR(50) DEFAULT 'daily_verse',
  topic_preference VARCHAR(100),
  translation_preference VARCHAR(20) DEFAULT 'NIV',
  frequency VARCHAR(20) DEFAULT 'daily',
  subscribed_at TIMESTAMP DEFAULT NOW(),
  confirmed BOOLEAN DEFAULT false,
  unsubscribed BOOLEAN DEFAULT false
);

-- Analytics
CREATE TABLE page_views (
  id SERIAL PRIMARY KEY,
  page_slug VARCHAR(200) NOT NULL,
  verse_id INT REFERENCES verses(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(100)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Verses indexes
CREATE INDEX idx_verses_book_chapter_verse ON verses(book, chapter, verse);
CREATE INDEX idx_verses_slug ON verses(slug);
CREATE INDEX idx_verses_testament ON verses(testament);
CREATE INDEX idx_verses_popularity ON verses(popularity_score DESC);
CREATE INDEX idx_verses_word_count ON verses(word_count);

-- Topics indexes
CREATE INDEX idx_topics_slug ON topics(slug);
CREATE INDEX idx_topics_parent ON topics(parent_topic_id);
CREATE INDEX idx_topics_level ON topics(level);

-- Verse-topic relationships
CREATE INDEX idx_verse_topics_topic_relevance ON verse_topics(topic_id, relevance_score DESC);
CREATE INDEX idx_verse_topics_verse ON verse_topics(verse_id);

-- Cross-references
CREATE INDEX idx_cross_refs_verse_strength ON cross_references(verse_id, strength DESC);
CREATE INDEX idx_cross_refs_related ON cross_references(related_verse_id);

-- Generated content
CREATE INDEX idx_generated_content_slug ON generated_content(slug);
CREATE INDEX idx_generated_content_type ON generated_content(page_type);
CREATE INDEX idx_generated_content_published ON generated_content(published);

-- FAQs
CREATE INDEX idx_faqs_entity ON faqs(entity_type, entity_id);

-- User bookmarks
CREATE INDEX idx_user_bookmarks_user ON user_bookmarks(user_id);

-- Page views
CREATE INDEX idx_page_views_slug_date ON page_views(page_slug, viewed_at);
CREATE INDEX idx_page_views_verse_date ON page_views(verse_id, viewed_at);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_verses_updated_at BEFORE UPDATE ON verses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_content_updated_at BEFORE UPDATE ON generated_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Popular verses view
CREATE VIEW popular_verses AS
SELECT 
  v.*,
  COUNT(pv.id) as view_count
FROM verses v
LEFT JOIN page_views pv ON v.id = pv.verse_id
GROUP BY v.id
ORDER BY view_count DESC;

-- Topics with verse counts
CREATE VIEW topics_with_counts AS
SELECT 
  t.*,
  COUNT(vt.verse_id) as verse_count
FROM topics t
LEFT JOIN verse_topics vt ON t.id = vt.topic_id
GROUP BY t.id;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE verses IS 'Core table containing all 31,102 Bible verses in multiple translations';
COMMENT ON TABLE topics IS 'Hierarchical topic taxonomy for organizing verses';
COMMENT ON TABLE verse_topics IS 'Many-to-many relationship between verses and topics';
COMMENT ON TABLE cross_references IS 'Related verses (parallel passages, thematic connections)';
COMMENT ON TABLE intent_pages IS 'Intent-based pages (weddings, funerals, tattoos, etc.)';
COMMENT ON TABLE generated_content IS 'AI-generated or template-based content for each page';
COMMENT ON TABLE faqs IS 'Pre-generated FAQs for each page type';

-- Schema created successfully! Ready for data seeding.
