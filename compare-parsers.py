#!/usr/bin/env python3
"""
Quick comparison tool for parser outputs
"""

import os
import re
from pathlib import Path

def analyze_structure(content, library_name):
    """Analyze the structural quality of parsed content"""
    lines = content.split('\n')
    
    # Count different types of structural elements
    headers = []
    bullets = []
    definitions = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # All caps lines (potential headers)
        if re.match(r'^[A-Z\s]{5,50}$', line):
            headers.append(line)
        
        # Bullet points
        if line.startswith(('•', '-', '*', '◦')):
            bullets.append(line)
        
        # Definitions (quoted terms)
        if line.startswith('"') and line.endswith('"'):
            definitions.append(line)
    
    # Check for clean formatting
    clean_lines = [l for l in lines if l.strip() and not l.startswith('---')]
    spacing_quality = len([l for l in lines if not l.strip()]) / max(len(lines), 1)
    
    return {
        'headers': len(headers),
        'bullets': len(bullets), 
        'definitions': len(definitions),
        'clean_lines': len(clean_lines),
        'spacing_quality': spacing_quality,
        'sample_headers': headers[:3],
        'sample_definitions': definitions[:3]
    }

def main():
    output_dir = Path('parser_outputs')
    
    if not output_dir.exists():
        print("❌ No parser outputs found. Run the POC script first!")
        return
    
    print("🔍 PARSER COMPARISON ANALYSIS")
    print("=" * 80)
    
    results = {}
    
    for file_path in output_dir.glob('*_output.txt'):
        library = file_path.stem.replace('_output', '')
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip the header info
        content_start = content.find('=' * 50)
        if content_start != -1:
            content = content[content_start + 52:]
        
        analysis = analyze_structure(content, library)
        results[library] = analysis
        
        print(f"\n📚 {library.upper()}")
        print(f"   Headers detected: {analysis['headers']}")
        print(f"   Definitions found: {analysis['definitions']}")
        print(f"   Clean lines: {analysis['clean_lines']}")
        print(f"   Spacing quality: {analysis['spacing_quality']:.2f}")
        
        if analysis['sample_headers']:
            print(f"   Sample headers: {analysis['sample_headers'][0][:50]}...")
    
    # Recommendations
    print("\n" + "=" * 80)
    print("🎯 RECOMMENDATIONS")
    print("=" * 80)
    
    # Best for structure detection
    best_headers = max(results.items(), key=lambda x: x[1]['headers'])
    print(f"🏆 Best for header detection: {best_headers[0]} ({best_headers[1]['headers']} headers)")
    
    # Best for definitions
    best_definitions = max(results.items(), key=lambda x: x[1]['definitions'])
    print(f"📖 Best for definitions: {best_definitions[0]} ({best_definitions[1]['definitions']} definitions)")
    
    # Best overall clean output
    best_clean = max(results.items(), key=lambda x: x[1]['clean_lines'])
    print(f"✨ Cleanest output: {best_clean[0]} ({best_clean[1]['clean_lines']} clean lines)")
    
    print(f"\n💡 For your AutoChunker app:")
    print(f"   • If you want the cleanest structure: Use {best_clean[0]}")
    print(f"   • If you want best header detection: Use {best_headers[0]}")
    print(f"   • If you want best definitions: Use {best_definitions[0]}")
    
    # Show differences in first 200 chars
    print(f"\n🔍 CONTENT PREVIEW COMPARISON:")
    print("-" * 80)
    for lib, analysis in results.items():
        with open(f'parser_outputs/{lib}_output.txt', 'r') as f:
            content = f.read()
            content_start = content.find('=' * 50)
            if content_start != -1:
                content = content[content_start + 52:]
            preview = content[:200].replace('\n', ' ').strip()
            print(f"{lib:12}: {preview}...")

if __name__ == "__main__":
    main()
