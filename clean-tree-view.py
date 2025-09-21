#!/usr/bin/env python3
"""
Clean tree view - filter out noise and show meaningful structure
"""

import json
from pathlib import Path

def clean_tree(tree):
    """Remove noise sections and clean up the tree"""
    cleaned = []
    
    for node in tree:
        title = node['title'].strip()
        
        # Skip noise sections
        if (title in ['SAMPLE', '* End of page *', 'AIA International Limited'] or
            title.startswith('AIA Vitality Endorsement') or
            len(title) < 3):
            continue
        
        # Clean the node
        cleaned_node = {
            'title': title,
            'level': node['level'],
            'content_words': len(node['content'].split()) if node['content'] else 0,
            'children': clean_tree(node['children']) if node['children'] else []
        }
        
        # Only add if it has content or children
        if cleaned_node['content_words'] > 5 or cleaned_node['children']:
            cleaned.append(cleaned_node)
    
    return cleaned

def print_clean_tree(tree, indent=0, max_depth=3):
    """Print cleaned tree structure"""
    if indent > max_depth:
        return
        
    for node in tree:
        prefix = "  " * indent
        level_indicator = f"H{node['level']}"
        title = node['title'][:50] + "..." if len(node['title']) > 50 else node['title']
        content_info = f" ({node['content_words']} words)" if node['content_words'] > 0 else ""
        
        print(f"{prefix}├─ [{level_indicator}] {title}{content_info}")
        
        if node['children']:
            print_clean_tree(node['children'], indent + 1, max_depth)

def main():
    trees_file = Path('parser_trees.json')
    
    if not trees_file.exists():
        print("❌ No parser trees found. Run parser-to-tree.py first!")
        return
    
    with open(trees_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    trees = data['trees']
    
    print("🌳 CLEAN DOCUMENT STRUCTURE COMPARISON")
    print("(Filtered out noise like SAMPLE, page markers, etc.)")
    print("=" * 80)
    
    for parser_name, tree in trees.items():
        cleaned_tree = clean_tree(tree)
        
        total_sections = len([node for node in cleaned_tree if node['content_words'] > 5])
        total_words = sum(node['content_words'] for node in cleaned_tree)
        
        print(f"\n🔍 {parser_name.upper()}")
        print(f"📊 Meaningful sections: {total_sections}")
        print(f"📝 Total content words: {total_words}")
        print("-" * 60)
        print_clean_tree(cleaned_tree, max_depth=2)
    
    # Find best meaningful structure
    best_parser = None
    best_score = 0
    
    for parser_name, tree in trees.items():
        cleaned_tree = clean_tree(tree)
        meaningful_sections = len([node for node in cleaned_tree if node['content_words'] > 10])
        score = meaningful_sections
        
        if score > best_score:
            best_score = score
            best_parser = parser_name
    
    print(f"\n{'=' * 80}")
    print(f"🏆 BEST FOR MEANINGFUL STRUCTURE: {best_parser.upper()}")
    print(f"📊 {best_score} meaningful sections detected")
    print("=" * 80)
    
    # Show key sections comparison
    print(f"\n🔍 KEY SECTIONS COMPARISON:")
    print("-" * 80)
    
    key_sections = ['BASIC DEFINITIONS', 'DEATH BENEFIT', 'GENERAL PROVISIONS', 
                   'PREMIUM PROVISIONS', 'TERMINAL ILLNESS BENEFIT']
    
    for section in key_sections:
        print(f"\n📋 Section: {section}")
        for parser_name, tree in trees.items():
            found = find_section_in_tree(tree, section)
            if found:
                print(f"  {parser_name:12}: ✅ Found ({found['content_words']} words)")
            else:
                print(f"  {parser_name:12}: ❌ Not found")

def find_section_in_tree(tree, target_title):
    """Find a specific section in the tree"""
    for node in tree:
        if target_title.lower() in node['title'].lower():
            return {
                'title': node['title'],
                'content_words': len(node['content'].split()) if node['content'] else 0
            }
        if node['children']:
            result = find_section_in_tree(node['children'], target_title)
            if result:
                return result
    return None

if __name__ == "__main__":
    main()
