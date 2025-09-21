#!/usr/bin/env python3
"""
Convert parser outputs to tree structures for easy comparison
"""

import os
import re
from pathlib import Path
import json

def parse_markdown_to_tree(content, parser_name):
    """Parse markdown content into a tree structure"""
    lines = content.split('\n')
    sections = []
    current_content = []
    section_id = 0

    # Skip header info
    content_start = content.find('=' * 50)
    if content_start != -1:
        content = content[content_start + 52:]
        lines = content.split('\n')

    # First pass: identify all headers and their content
    for i, line in enumerate(lines):
        line_stripped = line.strip()
        
        # Check for traditional markdown headers (# ## ###)
        header_match = re.match(r'^(#{1,6})\s+(.+)$', line)
        
        # Check for implicit headers (all caps, standalone lines, or bold text)
        is_implicit_header = (
            # All caps standalone line with significant length
            (re.match(r'^[A-Z\s]{3,50}$', line_stripped) and len(line_stripped) > 2) or
            # Lines that look like section titles
            (re.match(r'^[A-Z][A-Za-z\s]+:?\s*$', line_stripped) and len(line_stripped) > 5 and len(line_stripped) < 80) or
            # Bold text that might be headers
            re.match(r'^\*\*(.+)\*\*$', line_stripped) or
            # Page markers from some parsers
            re.match(r'^--- Page \d+ ---$', line_stripped)
        )
        
        if header_match or is_implicit_header:
            # Save previous section's content if exists
            if sections:
                sections[-1]['content'] = '\n'.join(current_content).strip()
            
            if header_match:
                # Traditional markdown header
                level = len(header_match.group(1))
                title = header_match.group(2).strip()
            else:
                # Implicit header - determine level based on characteristics
                if re.match(r'^--- Page \d+ ---$', line_stripped):
                    # Page markers - skip these
                    continue
                elif re.match(r'^[A-Z\s]+$', line_stripped):
                    # All caps = major section (level 1)
                    level = 1
                    title = line_stripped
                elif re.match(r'^\*\*(.+)\*\*$', line_stripped):
                    # Bold text = subsection (level 2)
                    level = 2
                    title = re.match(r'^\*\*(.+)\*\*$', line_stripped).group(1)
                else:
                    # Other patterns = level 2
                    level = 2
                    title = line_stripped.rstrip(':')
            
            sections.append({
                'id': f'section-{section_id}',
                'title': title.strip(),
                'level': level,
                'content': '',
                'children': []
            })
            section_id += 1
            current_content = []
        else:
            if line_stripped:  # Only add non-empty lines
                current_content.append(line)
    
    # Handle last section
    if sections and current_content:
        sections[-1]['content'] = '\n'.join(current_content).strip()
    
    # Handle case where there's no headers - create a single section
    if not sections:
        return [{
            'id': 'section-0',
            'title': f'{parser_name.upper()} Content',
            'level': 1,
            'content': content.strip(),
            'children': []
        }]
    
    # Second pass: build tree structure
    return build_tree_from_sections(sections)

def build_tree_from_sections(sections):
    """Build hierarchical tree from flat sections"""
    tree = []
    stack = []
    
    for section in sections:
        # Find the correct parent level
        while stack and stack[-1]['level'] >= section['level']:
            stack.pop()
        
        if not stack:
            # Top level node
            tree.append(section)
        else:
            # Child node
            parent = stack[-1]
            parent['children'].append(section)
        
        stack.append(section)
    
    return tree

def print_tree(tree, indent=0, show_content=False):
    """Print tree structure in a readable format"""
    for node in tree:
        prefix = "  " * indent
        level_indicator = f"H{node['level']}"
        title = node['title'][:60] + "..." if len(node['title']) > 60 else node['title']
        
        # Count content words
        content_words = len(node['content'].split()) if node['content'] else 0
        content_info = f" ({content_words} words)" if content_words > 0 else ""
        
        print(f"{prefix}├─ [{level_indicator}] {title}{content_info}")
        
        if show_content and node['content'] and content_words > 0:
            content_preview = node['content'][:100].replace('\n', ' ').strip()
            if len(node['content']) > 100:
                content_preview += "..."
            print(f"{prefix}│  💬 {content_preview}")
        
        if node['children']:
            print_tree(node['children'], indent + 1, show_content)

def analyze_tree_quality(tree):
    """Analyze the quality of the tree structure"""
    def count_nodes(nodes, level_counts=None):
        if level_counts is None:
            level_counts = {}
        
        total = 0
        for node in nodes:
            total += 1
            level = node['level']
            level_counts[level] = level_counts.get(level, 0) + 1
            
            if node['children']:
                child_count = count_nodes(node['children'], level_counts)
                total += child_count
        
        return total
    
    level_counts = {}
    total_nodes = count_nodes(tree, level_counts)
    
    # Calculate content distribution
    total_content_words = 0
    nodes_with_content = 0
    
    def count_content(nodes):
        nonlocal total_content_words, nodes_with_content
        for node in nodes:
            if node['content']:
                words = len(node['content'].split())
                total_content_words += words
                if words > 0:
                    nodes_with_content += 1
            if node['children']:
                count_content(node['children'])
    
    count_content(tree)
    
    return {
        'total_nodes': total_nodes,
        'level_distribution': level_counts,
        'total_content_words': total_content_words,
        'nodes_with_content': nodes_with_content,
        'avg_words_per_node': total_content_words / max(nodes_with_content, 1)
    }

def main():
    parser_outputs_dir = Path('parser_outputs')
    
    if not parser_outputs_dir.exists():
        print("❌ No parser outputs found. Run document-parser-poc.py first!")
        return
    
    print("🌳 DOCUMENT TREE STRUCTURE COMPARISON")
    print("=" * 80)
    
    trees = {}
    analyses = {}
    
    # Process each parser output
    for output_file in parser_outputs_dir.glob('*_output.txt'):
        parser_name = output_file.stem.replace('_output', '')
        
        with open(output_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        print(f"\n🔍 Processing {parser_name.upper()}...")
        tree = parse_markdown_to_tree(content, parser_name)
        trees[parser_name] = tree
        analyses[parser_name] = analyze_tree_quality(tree)
        
        print(f"📊 Found {analyses[parser_name]['total_nodes']} sections")
        print(f"📝 Level distribution: {analyses[parser_name]['level_distribution']}")
        
        print(f"\n🌳 Tree Structure for {parser_name.upper()}:")
        print("-" * 60)
        print_tree(tree, show_content=False)
    
    # Comparison summary
    print(f"\n{'=' * 80}")
    print("📊 TREE QUALITY COMPARISON")
    print("=" * 80)
    
    print(f"{'Parser':<15} {'Nodes':<8} {'H1':<6} {'H2':<6} {'H3+':<6} {'Words':<8} {'Quality'}")
    print("-" * 80)
    
    for parser_name, analysis in analyses.items():
        levels = analysis['level_distribution']
        h1_count = levels.get(1, 0)
        h2_count = levels.get(2, 0) 
        h3_plus = sum(levels.get(i, 0) for i in range(3, 7))
        
        # Calculate quality score
        quality_score = min(100, 
            (analysis['total_nodes'] * 10) + 
            (h1_count * 5) + 
            (h2_count * 3) +
            (h3_plus * 2) +
            min(analysis['total_content_words'] // 100, 30)
        )
        
        print(f"{parser_name:<15} {analysis['total_nodes']:<8} {h1_count:<6} {h2_count:<6} {h3_plus:<6} {analysis['total_content_words']:<8} {quality_score}/100")
    
    # Find best parser
    best_parser = max(analyses.items(), key=lambda x: x[1]['total_nodes'])
    print(f"\n🏆 Best tree structure: {best_parser[0].upper()} ({best_parser[1]['total_nodes']} sections)")
    
    # Save trees to JSON for further analysis
    output_file = Path('parser_trees.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            'trees': trees,
            'analyses': analyses,
            'recommendation': best_parser[0]
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Tree structures saved to: {output_file}")
    print("\n💡 Use --detailed flag to see content previews")
    print("💡 Use --parser <name> to see only one parser's tree")

if __name__ == "__main__":
    import sys
    
    if '--help' in sys.argv:
        print("Usage: python parser-to-tree.py [--detailed] [--parser <name>]")
        print("  --detailed: Show content previews")
        print("  --parser <name>: Show only specific parser")
        sys.exit(0)
    
    main()
