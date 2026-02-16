#!/usr/bin/env python3
import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path.home() / 'clawd/skills/seo-dataforseo/scripts'))
from api.labs import get_keyword_overview

# Test with a known keyword
keyword = "bible verses about love"
print(f"Testing: {keyword}\n")

result = get_keyword_overview(
    keywords=[keyword],
    location_name="United States"
)

print(f"Type of result: {type(result)}")
print(f"Keys in result: {list(result.keys()) if isinstance(result, dict) else 'NOT A DICT'}\n")

# Try to extract search volume
if isinstance(result, dict):
    data = result.get("data", {})
    print(f"Has 'data' key: {bool(data)}")
    
    if data:
        tasks = data.get("tasks", [])
        print(f"Number of tasks: {len(tasks)}")
        
        if tasks:
            task = tasks[0]
            result_list = task.get("result", [])
            print(f"Number of results: {len(result_list)}")
            
            if result_list:
                result_obj = result_list[0]
                items = result_obj.get("items", [])
                print(f"Number of items: {len(items)}")
                
                if items:
                    item = items[0]
                    keyword_info = item.get("keyword_info", {})
                    search_volume = keyword_info.get("search_volume", 0)
                    competition = keyword_info.get("competition", 0)
                    
                    print(f"\nExtracted data:")
                    print(f"  Search volume: {search_volume}")
                    print(f"  Competition: {competition}")
                else:
                    print("No items found")
