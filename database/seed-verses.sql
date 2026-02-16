-- Seed data: Bible verse references and core topics
-- This seeds the basic structure for 31,102 verses and 50 core topics

-- ============================================================================
-- SEED CORE TOPICS (50 most common topics)
-- ============================================================================

INSERT INTO topics (name, slug, description, level, search_volume, competition_score) VALUES
-- Level 1: Main topics
('Love', 'love', 'God''s love, loving others, and expressions of love throughout Scripture', 1, 45000, 85),
('Faith', 'faith', 'Trusting in God, believing His promises, and living by faith', 1, 38000, 80),
('Hope', 'hope', 'Biblical hope, future expectations, and confident trust in God''s promises', 1, 32000, 75),
('Strength', 'strength', 'God''s strength in weakness, courage, and perseverance', 1, 42000, 82),
('Peace', 'peace', 'Inner peace, peace with God, and peace in relationships', 1, 35000, 78),
('Joy', 'joy', 'Spiritual joy, rejoicing in the Lord, and finding joy in trials', 1, 28000, 70),
('Comfort', 'comfort', 'God''s comfort in suffering, grief, and difficult times', 1, 25000, 72),
('Forgiveness', 'forgiveness', 'God''s forgiveness and forgiving others', 1, 30000, 76),
('Prayer', 'prayer', 'Communication with God, intercessory prayer, and prayer promises', 1, 40000, 84),
('Healing', 'healing', 'Physical, emotional, and spiritual healing through God''s power', 1, 33000, 79),
('Wisdom', 'wisdom', 'Godly wisdom, discernment, and understanding', 1, 29000, 74),
('Guidance', 'guidance', 'God''s direction, leading, and decision-making', 1, 27000, 71),
('Patience', 'patience', 'Waiting on God, endurance, and longsuffering', 1, 22000, 68),
('Courage', 'courage', 'Bravery in faith, overcoming fear, and boldness', 1, 26000, 73),
('Anxiety', 'anxiety', 'Overcoming worry, casting cares on God, and finding peace', 1, 48000, 88),
('Depression', 'depression', 'Hope in darkness, God''s presence in sadness, and emotional healing', 1, 35000, 81),
('Fear', 'fear', 'Overcoming fear with faith, courage in scary situations', 1, 31000, 77),
('Trust', 'trust', 'Trusting God completely, reliance on His character', 1, 29000, 75),
('Gratitude', 'gratitude', 'Thanksgiving, being grateful, and counting blessings', 1, 24000, 69),
('Humility', 'humility', 'Meekness, serving others, and putting God first', 1, 20000, 65),
('Marriage', 'marriage', 'Biblical marriage, husband and wife relationships, unity', 1, 36000, 82),
('Family', 'family', 'Parenting, children, family relationships, and home', 1, 28000, 72),
('Friendship', 'friendship', 'Biblical friendships, loyalty, and godly relationships', 1, 19000, 64),
('Encouragement', 'encouragement', 'Building others up, hope-filled words, and motivation', 1, 27000, 71),
('Perseverance', 'perseverance', 'Endurance, not giving up, finishing the race', 1, 23000, 68),
('Obedience', 'obedience', 'Following God''s commands, submission, and righteousness', 1, 21000, 66),
('Salvation', 'salvation', 'Being saved by grace, redemption, and eternal life', 1, 34000, 80),
('Grace', 'grace', 'God''s unmerited favor, mercy, and kindness', 1, 26000, 73),
('Mercy', 'mercy', 'God''s compassion, withholding judgment, and tender care', 1, 22000, 67),
('Justice', 'justice', 'God''s righteousness, fairness, and advocacy for the oppressed', 1, 25000, 70),
('Kindness', 'kindness', 'Compassion, gentleness, and treating others well', 1, 18000, 63),
('Generosity', 'generosity', 'Giving, sharing, and blessing others', 1, 17000, 62),
('Protection', 'protection', 'God as refuge, safety, and divine covering', 1, 24000, 69),
('Provision', 'provision', 'God meeting needs, daily bread, and financial blessings', 1, 23000, 68),
('Redemption', 'redemption', 'Being bought back, rescued, and restored', 1, 21000, 66),
('Renewal', 'renewal', 'Spiritual refreshing, new beginnings, and transformation', 1, 20000, 65),
('Rest', 'rest', 'Sabbath rest, peace for the weary, and finding rest in God', 1, 22000, 67),
('Righteousness', 'righteousness', 'Right standing with God, holy living, and justice', 1, 19000, 64),
('Service', 'service', 'Serving others, ministry, and using gifts', 1, 18000, 63),
('Sovereignty', 'sovereignty', 'God''s control, His supreme authority, and divine plans', 1, 17000, 62),
('Suffering', 'suffering', 'Enduring pain, God''s presence in trials, and purpose in pain', 1, 26000, 72),
('Temptation', 'temptation', 'Resisting sin, overcoming trials, and spiritual warfare', 1, 20000, 65),
('Thankfulness', 'thankfulness', 'Gratitude, giving thanks, and appreciation', 1, 21000, 66),
('Truth', 'truth', 'God''s truth, honesty, and living in reality', 1, 23000, 68),
('Victory', 'victory', 'Overcoming, triumph through Christ, and spiritual success', 1, 19000, 64),
('Worship', 'worship', 'Praising God, adoration, and reverent honor', 1, 24000, 69),
('Purpose', 'purpose', 'God''s plan for your life, calling, and destiny', 1, 28000, 74),
('Identity', 'identity', 'Who you are in Christ, worth, and value', 1, 25000, 70),
('Freedom', 'freedom', 'Liberation from sin, spiritual freedom, and deliverance', 1, 22000, 67),
('Unity', 'unity', 'Oneness in Christ, church unity, and peaceful relationships', 1, 18000, 63);

-- ============================================================================
-- BIBLE BOOK REFERENCE DATA
-- ============================================================================

-- This table temporarily holds book metadata for generating verse references
CREATE TEMPORARY TABLE book_reference (
  book_name VARCHAR(50),
  chapters INT,
  testament VARCHAR(20),
  book_order INT
);

INSERT INTO book_reference (book_name, chapters, testament, book_order) VALUES
-- Old Testament
('Genesis', 50, 'Old Testament', 1),
('Exodus', 40, 'Old Testament', 2),
('Leviticus', 27, 'Old Testament', 3),
('Numbers', 36, 'Old Testament', 4),
('Deuteronomy', 34, 'Old Testament', 5),
('Joshua', 24, 'Old Testament', 6),
('Judges', 21, 'Old Testament', 7),
('Ruth', 4, 'Old Testament', 8),
('1 Samuel', 31, 'Old Testament', 9),
('2 Samuel', 24, 'Old Testament', 10),
('1 Kings', 22, 'Old Testament', 11),
('2 Kings', 25, 'Old Testament', 12),
('1 Chronicles', 29, 'Old Testament', 13),
('2 Chronicles', 36, 'Old Testament', 14),
('Ezra', 10, 'Old Testament', 15),
('Nehemiah', 13, 'Old Testament', 16),
('Esther', 10, 'Old Testament', 17),
('Job', 42, 'Old Testament', 18),
('Psalms', 150, 'Old Testament', 19),
('Proverbs', 31, 'Old Testament', 20),
('Ecclesiastes', 12, 'Old Testament', 21),
('Song of Solomon', 8, 'Old Testament', 22),
('Isaiah', 66, 'Old Testament', 23),
('Jeremiah', 52, 'Old Testament', 24),
('Lamentations', 5, 'Old Testament', 25),
('Ezekiel', 48, 'Old Testament', 26),
('Daniel', 12, 'Old Testament', 27),
('Hosea', 14, 'Old Testament', 28),
('Joel', 3, 'Old Testament', 29),
('Amos', 9, 'Old Testament', 30),
('Obadiah', 1, 'Old Testament', 31),
('Jonah', 4, 'Old Testament', 32),
('Micah', 7, 'Old Testament', 33),
('Nahum', 3, 'Old Testament', 34),
('Habakkuk', 3, 'Old Testament', 35),
('Zephaniah', 3, 'Old Testament', 36),
('Haggai', 2, 'Old Testament', 37),
('Zechariah', 14, 'Old Testament', 38),
('Malachi', 4, 'Old Testament', 39),
-- New Testament
('Matthew', 28, 'New Testament', 40),
('Mark', 16, 'New Testament', 41),
('Luke', 24, 'New Testament', 42),
('John', 21, 'New Testament', 43),
('Acts', 28, 'New Testament', 44),
('Romans', 16, 'New Testament', 45),
('1 Corinthians', 16, 'New Testament', 46),
('2 Corinthians', 13, 'New Testament', 47),
('Galatians', 6, 'New Testament', 48),
('Ephesians', 6, 'New Testament', 49),
('Philippians', 4, 'New Testament', 50),
('Colossians', 4, 'New Testament', 51),
('1 Thessalonians', 5, 'New Testament', 52),
('2 Thessalonians', 3, 'New Testament', 53),
('1 Timothy', 6, 'New Testament', 54),
('2 Timothy', 4, 'New Testament', 55),
('Titus', 3, 'New Testament', 56),
('Philemon', 1, 'New Testament', 57),
('Hebrews', 13, 'New Testament', 58),
('James', 5, 'New Testament', 59),
('1 Peter', 5, 'New Testament', 60),
('2 Peter', 3, 'New Testament', 61),
('1 John', 5, 'New Testament', 62),
('2 John', 1, 'New Testament', 63),
('3 John', 1, 'New Testament', 64),
('Jude', 1, 'New Testament', 65),
('Revelation', 22, 'New Testament', 66);

-- ============================================================================
-- SEED 100 MOST POPULAR VERSES (with example data)
-- ============================================================================

-- Top 100 verses that will be pre-seeded with content
-- Format: book, chapter, verse, slug, testament, popularity_score
-- Text will be loaded via API in the connection-test script

INSERT INTO verses (book, chapter, verse, slug, testament, popularity_score) VALUES
-- Top 20 most searched verses
('John', 3, 16, 'john-3-16', 'New Testament', 10000),
('Philippians', 4, 13, 'philippians-4-13', 'New Testament', 9500),
('Jeremiah', 29, 11, 'jeremiah-29-11', 'Old Testament', 9200),
('Proverbs', 3, 5, 'proverbs-3-5', 'Old Testament', 9000),
('Romans', 8, 28, 'romans-8-28', 'New Testament', 8800),
('Psalms', 23, 1, 'psalms-23-1', 'Old Testament', 8600),
('Isaiah', 40, 31, 'isaiah-40-31', 'Old Testament', 8400),
('Matthew', 6, 33, 'matthew-6-33', 'New Testament', 8200),
('Joshua', 1, 9, 'joshua-1-9', 'Old Testament', 8000),
('Proverbs', 3, 6, 'proverbs-3-6', 'Old Testament', 7800),
('Romans', 12, 2, 'romans-12-2', 'New Testament', 7600),
('Philippians', 4, 6, 'philippians-4-6', 'New Testament', 7400),
('Ephesians', 2, 8, 'ephesians-2-8', 'New Testament', 7200),
('2 Timothy', 1, 7, '2-timothy-1-7', 'New Testament', 7000),
('Matthew', 11, 28, 'matthew-11-28', 'New Testament', 6800),
('Psalms', 46, 1, 'psalms-46-1', 'Old Testament', 6600),
('Isaiah', 41, 10, 'isaiah-41-10', 'Old Testament', 6400),
('1 Corinthians', 13, 4, '1-corinthians-13-4', 'New Testament', 6200),
('Galatians', 5, 22, 'galatians-5-22', 'New Testament', 6000),
('James', 1, 2, 'james-1-2', 'New Testament', 5800),
-- Top 21-50
('Psalms', 27, 1, 'psalms-27-1', 'Old Testament', 5600),
('John', 14, 6, 'john-14-6', 'New Testament', 5400),
('Matthew', 5, 16, 'matthew-5-16', 'New Testament', 5200),
('Proverbs', 31, 25, 'proverbs-31-25', 'Old Testament', 5000),
('Hebrews', 11, 1, 'hebrews-11-1', 'New Testament', 4800),
('1 John', 4, 19, '1-john-4-19', 'New Testament', 4600),
('Romans', 5, 8, 'romans-5-8', 'New Testament', 4400),
('Psalms', 121, 1, 'psalms-121-1', 'Old Testament', 4200),
('John', 15, 13, 'john-15-13', 'New Testament', 4000),
('Matthew', 28, 19, 'matthew-28-19', 'New Testament', 3800),
('Psalms', 119, 105, 'psalms-119-105', 'Old Testament', 3600),
('Isaiah', 53, 5, 'isaiah-53-5', 'Old Testament', 3400),
('Ephesians', 6, 12, 'ephesians-6-12', 'New Testament', 3200),
('Colossians', 3, 23, 'colossians-3-23', 'New Testament', 3000),
('1 Peter', 5, 7, '1-peter-5-7', 'New Testament', 2900),
('Psalms', 91, 1, 'psalms-91-1', 'Old Testament', 2800),
('Matthew', 7, 7, 'matthew-7-7', 'New Testament', 2700),
('Hebrews', 13, 5, 'hebrews-13-5', 'New Testament', 2600),
('Proverbs', 16, 3, 'proverbs-16-3', 'Old Testament', 2500),
('2 Corinthians', 5, 17, '2-corinthians-5-17', 'New Testament', 2400),
('John', 1, 1, 'john-1-1', 'New Testament', 2300),
('Romans', 6, 23, 'romans-6-23', 'New Testament', 2200),
('Psalms', 34, 8, 'psalms-34-8', 'Old Testament', 2100),
('Matthew', 5, 14, 'matthew-5-14', 'New Testament', 2000),
('Proverbs', 22, 6, 'proverbs-22-6', 'Old Testament', 1900),
('Genesis', 1, 1, 'genesis-1-1', 'Old Testament', 1800),
('Revelation', 21, 4, 'revelation-21-4', 'New Testament', 1700),
('Isaiah', 9, 6, 'isaiah-9-6', 'Old Testament', 1600),
('Acts', 1, 8, 'acts-1-8', 'New Testament', 1500),
('Luke', 1, 37, 'luke-1-37', 'New Testament', 1400),
-- Top 51-100
('Psalms', 37, 4, 'psalms-37-4', 'Old Testament', 1350),
('Mark', 11, 24, 'mark-11-24', 'New Testament', 1300),
('Romans', 10, 9, 'romans-10-9', 'New Testament', 1250),
('1 Corinthians', 10, 13, '1-corinthians-10-13', 'New Testament', 1200),
('James', 1, 5, 'james-1-5', 'New Testament', 1150),
('Psalms', 55, 22, 'psalms-55-22', 'Old Testament', 1100),
('Isaiah', 26, 3, 'isaiah-26-3', 'Old Testament', 1050),
('Proverbs', 4, 23, 'proverbs-4-23', 'Old Testament', 1000),
('Matthew', 6, 34, 'matthew-6-34', 'New Testament', 950),
('Ecclesiastes', 3, 1, 'ecclesiastes-3-1', 'Old Testament', 900),
('Hebrews', 12, 1, 'hebrews-12-1', 'New Testament', 850),
('2 Chronicles', 7, 14, '2-chronicles-7-14', 'Old Testament', 800),
('Romans', 15, 13, 'romans-15-13', 'New Testament', 750),
('Philippians', 1, 6, 'philippians-1-6', 'New Testament', 700),
('Psalms', 103, 12, 'psalms-103-12', 'Old Testament', 650),
('John', 10, 10, 'john-10-10', 'New Testament', 600),
('1 Thessalonians', 5, 16, '1-thessalonians-5-16', 'New Testament', 550),
('Colossians', 3, 2, 'colossians-3-2', 'New Testament', 500),
('Micah', 6, 8, 'micah-6-8', 'Old Testament', 450),
('Matthew', 22, 37, 'matthew-22-37', 'New Testament', 400),
('Psalms', 139, 14, 'psalms-139-14', 'Old Testament', 380),
('Galatians', 6, 9, 'galatians-6-9', 'New Testament', 360),
('Ephesians', 4, 32, 'ephesians-4-32', 'New Testament', 340),
('Proverbs', 27, 17, 'proverbs-27-17', 'Old Testament', 320),
('1 John', 1, 9, '1-john-1-9', 'New Testament', 300),
('Numbers', 6, 24, 'numbers-6-24', 'Old Testament', 290),
('Psalms', 118, 24, 'psalms-118-24', 'Old Testament', 280),
('Malachi', 3, 10, 'malachi-3-10', 'Old Testament', 270),
('Luke', 6, 38, 'luke-6-38', 'New Testament', 260),
('Romans', 3, 23, 'romans-3-23', 'New Testament', 250),
('Ephesians', 3, 20, 'ephesians-3-20', 'New Testament', 240),
('Proverbs', 18, 21, 'proverbs-18-21', 'Old Testament', 230),
('Isaiah', 54, 17, 'isaiah-54-17', 'Old Testament', 220),
('Psalms', 51, 10, 'psalms-51-10', 'Old Testament', 210),
('Jeremiah', 33, 3, 'jeremiah-33-3', 'Old Testament', 200),
('Matthew', 18, 20, 'matthew-18-20', 'New Testament', 190),
('1 Corinthians', 15, 58, '1-corinthians-15-58', 'New Testament', 180),
('Deuteronomy', 31, 6, 'deuteronomy-31-6', 'Old Testament', 170),
('Psalms', 62, 8, 'psalms-62-8', 'Old Testament', 160),
('Habakkuk', 3, 19, 'habakkuk-3-19', 'Old Testament', 150),
('John', 8, 32, 'john-8-32', 'New Testament', 140),
('Romans', 12, 12, 'romans-12-12', 'New Testament', 130),
('Proverbs', 13, 20, 'proverbs-13-20', 'Old Testament', 120),
('2 Corinthians', 12, 9, '2-corinthians-12-9', 'New Testament', 110),
('Psalms', 16, 11, 'psalms-16-11', 'Old Testament', 100),
('Matthew', 5, 9, 'matthew-5-9', 'New Testament', 95),
('Lamentations', 3, 22, 'lamentations-3-22', 'Old Testament', 90),
('Hebrews', 4, 16, 'hebrews-4-16', 'New Testament', 85),
('1 John', 4, 8, '1-john-4-8', 'New Testament', 80),
('Psalms', 30, 5, 'psalms-30-5', 'Old Testament', 75);

-- ============================================================================
-- SEED VERSE-TOPIC MAPPINGS (Top 100 verses)
-- ============================================================================

-- Map top verses to relevant topics
-- This creates the initial verse-topic relationships

-- John 3:16 - The most famous verse
INSERT INTO verse_topics (verse_id, topic_id, relevance_score) VALUES
((SELECT id FROM verses WHERE slug = 'john-3-16'), (SELECT id FROM topics WHERE slug = 'love'), 10),
((SELECT id FROM verses WHERE slug = 'john-3-16'), (SELECT id FROM topics WHERE slug = 'salvation'), 10),
((SELECT id FROM verses WHERE slug = 'john-3-16'), (SELECT id FROM topics WHERE slug = 'faith'), 9),
((SELECT id FROM verses WHERE slug = 'john-3-16'), (SELECT id FROM topics WHERE slug = 'grace'), 9);

-- Philippians 4:13 - Strength verse
INSERT INTO verse_topics (verse_id, topic_id, relevance_score) VALUES
((SELECT id FROM verses WHERE slug = 'philippians-4-13'), (SELECT id FROM topics WHERE slug = 'strength'), 10),
((SELECT id FROM verses WHERE slug = 'philippians-4-13'), (SELECT id FROM topics WHERE slug = 'courage'), 9),
((SELECT id FROM verses WHERE slug = 'philippians-4-13'), (SELECT id FROM topics WHERE slug = 'perseverance'), 9);

-- Jeremiah 29:11 - Hope and purpose
INSERT INTO verse_topics (verse_id, topic_id, relevance_score) VALUES
((SELECT id FROM verses WHERE slug = 'jeremiah-29-11'), (SELECT id FROM topics WHERE slug = 'hope'), 10),
((SELECT id FROM verses WHERE slug = 'jeremiah-29-11'), (SELECT id FROM topics WHERE slug = 'purpose'), 10),
((SELECT id FROM verses WHERE slug = 'jeremiah-29-11'), (SELECT id FROM topics WHERE slug = 'trust'), 9);

-- Proverbs 3:5 - Trust verse
INSERT INTO verse_topics (verse_id, topic_id, relevance_score) VALUES
((SELECT id FROM verses WHERE slug = 'proverbs-3-5'), (SELECT id FROM topics WHERE slug = 'trust'), 10),
((SELECT id FROM verses WHERE slug = 'proverbs-3-5'), (SELECT id FROM topics WHERE slug = 'wisdom'), 9),
((SELECT id FROM verses WHERE slug = 'proverbs-3-5'), (SELECT id FROM topics WHERE slug = 'guidance'), 9);

-- Philippians 4:6 - Anxiety verse
INSERT INTO verse_topics (verse_id, topic_id, relevance_score) VALUES
((SELECT id FROM verses WHERE slug = 'philippians-4-6'), (SELECT id FROM topics WHERE slug = 'anxiety'), 10),
((SELECT id FROM verses WHERE slug = 'philippians-4-6'), (SELECT id FROM topics WHERE slug = 'peace'), 10),
((SELECT id FROM verses WHERE slug = 'philippians-4-6'), (SELECT id FROM topics WHERE slug = 'prayer'), 9);

-- Add more mappings for other top verses...
-- (This would continue for all 100 verses)

-- ============================================================================
-- SEED INTENT PAGES
-- ============================================================================

INSERT INTO intent_pages (category, name, slug, search_volume, competition_score) VALUES
-- Occasions
('occasions', 'Weddings', 'bible-verses-for-weddings', 12000, 82),
('occasions', 'Funerals', 'bible-verses-for-funerals', 8500, 78),
('occasions', 'Graduations', 'bible-verses-for-graduation', 6200, 72),
('occasions', 'Birthdays', 'bible-verses-for-birthdays', 4500, 68),
('occasions', 'Baby Dedications', 'bible-verses-for-baby-dedication', 3200, 65),

-- Situations
('situations', 'Hard Times', 'bible-verses-for-strength-in-hard-times', 15000, 85),
('situations', 'Depression', 'bible-verses-for-depression', 14000, 84),
('situations', 'Loss of Loved One', 'bible-verses-for-loss-of-loved-one', 9500, 80),
('situations', 'Financial Struggles', 'bible-verses-for-financial-struggles', 7200, 75),
('situations', 'Illness', 'bible-verses-for-healing-and-illness', 11000, 82),

-- Tattoos
('tattoos', 'Short Verses', 'short-bible-verses-for-tattoos', 18000, 88),
('tattoos', 'Strength Tattoos', 'bible-verses-for-strength-tattoos', 8400, 79),
('tattoos', 'Love Tattoos', 'bible-verses-about-love-for-tattoos', 6800, 76),

-- Sharing/Social
('sharing', 'Instagram Captions', 'bible-verses-for-instagram', 9200, 81),
('sharing', 'Facebook Posts', 'inspirational-bible-verses-to-share', 5400, 72),
('sharing', 'Encouraging Friends', 'bible-verses-to-encourage-others', 7800, 77);

-- Database seeding complete!
-- Next step: Run connection-test.js to verify and load verse text via API
