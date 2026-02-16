#!/usr/bin/env python3
"""
Generate Bible Verse Topic Master List with Search Volume Data
Uses DataForSEO API to gather 500+ topics with search metrics
"""
import sys
import json
from pathlib import Path
from typing import List, Dict, Any
import time

# Add DataForSEO skill to path
sys.path.insert(0, str(Path.home() / 'clawd/skills/seo-dataforseo/scripts'))
from api.labs import get_keyword_overview, get_keyword_suggestions

# Seed topics across all required categories
SEED_TOPICS = {
    "emotions": [
        "love", "fear", "joy", "hope", "peace", "anger", "sadness", "happiness",
        "courage", "faith", "trust", "worry", "anxiety", "depression", "loneliness",
        "gratitude", "forgiveness", "hate", "jealousy", "pride", "humility", "shame",
        "guilt", "contentment", "patience", "kindness", "compassion"
    ],
    "life_events": [
        "marriage", "grief", "birth", "death", "divorce", "sickness", "healing",
        "pregnancy", "retirement", "moving", "new job", "losing a job", "graduation",
        "new beginnings", "endings", "transitions", "loss", "tragedy", "suffering",
        "pain", "trials", "tribulation", "persecution", "hardship", "financial trouble"
    ],
    "virtues": [
        "faith", "hope", "love", "patience", "kindness", "goodness", "faithfulness",
        "gentleness", "self-control", "wisdom", "knowledge", "understanding",
        "discernment", "courage", "strength", "perseverance", "endurance",
        "integrity", "honesty", "truthfulness", "righteousness", "holiness",
        "purity", "humility", "meekness", "obedience"
    ],
    "struggles": [
        "anxiety", "addiction", "depression", "doubt", "temptation", "sin",
        "weakness", "fear", "stress", "burnout", "exhaustion", "illness",
        "chronic pain", "mental health", "suicidal thoughts", "self-harm",
        "eating disorders", "alcoholism", "drug addiction", "pornography",
        "gambling", "anger issues", "bitterness", "unforgiveness", "trauma", "PTSD"
    ],
    "relationships": [
        "family", "friendship", "marriage", "children", "parents", "siblings",
        "spouse", "husband", "wife", "mother", "father", "grandparents",
        "enemies", "neighbors", "coworkers", "church", "community",
        "forgiveness", "reconciliation", "conflict", "betrayal", "broken relationships",
        "unity", "fellowship", "accountability", "encouragement"
    ],
    "seasons": [
        "Easter", "Christmas", "New Year", "Thanksgiving", "Lent", "Advent",
        "Pentecost", "Good Friday", "Palm Sunday", "Resurrection Sunday",
        "Mother's Day", "Father's Day", "Valentine's Day", "birthdays",
        "anniversaries", "funerals", "weddings", "baby showers"
    ],
    "spiritual": [
        "prayer", "worship", "salvation", "grace", "mercy", "redemption",
        "sanctification", "justification", "baptism", "communion", "fasting",
        "meditation", "scripture", "reading the Bible", "Holy Spirit",
        "Trinity", "God's love", "Jesus", "Christ", "heaven", "hell",
        "eternal life", "second coming", "prophecy", "end times"
    ],
    "character": [
        "integrity", "honesty", "loyalty", "trustworthiness", "reliability",
        "responsibility", "diligence", "perseverance", "discipline", "self-control",
        "temperance", "moderation", "balance", "wisdom", "discernment"
    ],
    "purpose": [
        "purpose", "calling", "destiny", "mission", "vision", "direction",
        "guidance", "decisions", "choices", "God's will", "identity",
        "worth", "value", "significance", "meaning", "fulfillment"
    ],
    "work": [
        "work", "career", "job", "business", "leadership", "success",
        "failure", "provision", "finances", "money", "wealth", "poverty",
        "stewardship", "giving", "tithing", "generosity"
    ]
}

def slugify(text: str) -> str:
    """Convert text to URL-friendly slug"""
    return text.lower().replace(" ", "-").replace("'", "")

def extract_search_data(api_response: Dict) -> tuple:
    """Extract search volume and competition from API response"""
    try:
        if not isinstance(api_response, dict):
            return 0, 0
        
        # Navigate the nested structure
        data = api_response.get("data", {})
        tasks = data.get("tasks", [])
        
        if not tasks:
            return 0, 0
        
        result = tasks[0].get("result", [])
        if not result:
            return 0, 0
        
        items = result[0].get("items", [])
        if not items:
            return 0, 0
        
        keyword_info = items[0].get("keyword_info", {})
        search_volume = keyword_info.get("search_volume", 0) or 0
        competition = keyword_info.get("competition", 0) or 0
        
        return search_volume, competition
    
    except Exception as e:
        print(f"      ⚠ Error extracting data: {e}")
        return 0, 0

def gather_topics() -> List[Dict[str, Any]]:
    """Gather Bible verse topics with search volume data"""
    all_topics = {}
    
    print("\n" + "="*80)
    print("GATHERING BIBLE VERSE TOPICS WITH SEARCH VOLUME DATA")
    print("="*80 + "\n")
    
    # Process each category
    for category, topics in SEED_TOPICS.items():
        print(f"\n📚 Processing category: {category.upper()}")
        print(f"   Topics: {len(topics)}")
        
        for topic in topics:
            keyword = f"bible verses about {topic}"
            slug = slugify(topic)
            
            # Skip if already processed
            if slug in all_topics:
                continue
            
            try:
                print(f"   🔍 {keyword}")
                
                # Get keyword data
                result = get_keyword_overview(
                    keywords=[keyword],
                    location_name="United States"
                )
                
                # Extract search volume and competition
                search_volume, competition = extract_search_data(result)
                
                # Only include if search volume > 100
                if search_volume >= 100:
                    all_topics[slug] = {
                        "slug": slug,
                        "title": topic.title(),
                        "searchVolume": search_volume,
                        "competition": int(competition * 100) if competition else 0
                    }
                    print(f"      ✓ Added: {search_volume:,} searches/mo, competition: {int(competition * 100)}")
                else:
                    print(f"      ✗ Skipped (volume: {search_volume})")
                
                # Small delay to avoid rate limiting
                time.sleep(0.2)
                
            except Exception as e:
                print(f"      ⚠ Error: {e}")
                continue
    
    # Also gather keyword suggestions to expand the list
    print("\n\n📊 EXPANDING WITH KEYWORD SUGGESTIONS...")
    
    try:
        print(f"\n🔍 Getting suggestions for: bible verses about")
        suggestions = get_keyword_suggestions(
            keyword="bible verses about",
            location_name="United States",
            limit=500
        )
        
        # Extract suggestions from response
        if isinstance(suggestions, dict):
            data = suggestions.get("data", {})
            tasks = data.get("tasks", [])
            
            if tasks:
                result = tasks[0].get("result", [])
                if result:
                    items = result[0].get("items", [])
                    
                    for item in items:
                        keyword_text = item.get("keyword", "")
                        keyword_info = item.get("keyword_info", {})
                        search_volume = keyword_info.get("search_volume", 0) or 0
                        competition = keyword_info.get("competition", 0) or 0
                        
                        # Extract topic from keyword
                        if keyword_text.startswith("bible verses about "):
                            topic = keyword_text.replace("bible verses about ", "")
                            slug = slugify(topic)
                            
                            if slug not in all_topics and search_volume >= 100:
                                all_topics[slug] = {
                                    "slug": slug,
                                    "title": topic.title(),
                                    "searchVolume": search_volume,
                                    "competition": int(competition * 100) if competition else 0
                                }
                                print(f"   ✓ Added: {topic} ({search_volume:,} searches/mo)")
    
    except Exception as e:
        print(f"   ⚠ Error getting suggestions: {e}")
    
    # Convert to list and sort by search volume
    topics_list = sorted(
        all_topics.values(),
        key=lambda x: x["searchVolume"],
        reverse=True
    )
    
    return topics_list

def main():
    """Main execution"""
    # Gather topics
    topics = gather_topics()
    
    # Print summary
    print("\n\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    print(f"Total topics gathered: {len(topics)}")
    print(f"Total search volume: {sum(t['searchVolume'] for t in topics):,}")
    
    if topics:
        print(f"\nTop 10 topics by search volume:")
        for i, topic in enumerate(topics[:10], 1):
            print(f"  {i}. {topic['title']}: {topic['searchVolume']:,} searches/mo")
    
    # Save to output file
    output_path = Path.home() / 'clawd/projects/bible-verse-randomizer/data/topics-master.json'
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(topics, f, indent=2)
    
    print(f"\n✅ Saved to: {output_path}")
    print(f"   Total topics: {len(topics)}")
    
    if len(topics) < 500:
        print(f"\n⚠️  WARNING: Only {len(topics)} topics gathered (target: 500+)")
        print("   Consider adding more seed topics or expanding keyword suggestions")
    else:
        print(f"\n🎉 SUCCESS: {len(topics)} topics gathered (exceeded target of 500+)")
    
    return topics

if __name__ == "__main__":
    main()
