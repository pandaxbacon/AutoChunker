#!/usr/bin/env python3
"""
Generate visual tree images from parser outputs
Creates PNG/SVG files showing document hierarchy
"""

import json
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch
import numpy as np
from pathlib import Path

def create_tree_visualization(tree, parser_name, output_dir='tree_images'):
    """Create a visual tree diagram"""
    
    # Create output directory
    Path(output_dir).mkdir(exist_ok=True)
    
    # Calculate tree dimensions
    max_depth = get_max_depth(tree)
    total_nodes = count_nodes(tree)
    
    # Set up the plot
    fig, ax = plt.subplots(figsize=(max(12, max_depth * 3), max(8, total_nodes * 0.3)))
    ax.set_xlim(0, max_depth + 2)
    ax.set_ylim(0, total_nodes + 2)
    ax.axis('off')
    
    # Colors for different levels
    level_colors = {
        1: '#3B82F6',  # Blue
        2: '#10B981',  # Green  
        3: '#F59E0B',  # Yellow
        4: '#EF4444',  # Red
        5: '#8B5CF6',  # Purple
        6: '#F97316'   # Orange
    }
    
    # Draw the tree
    y_position = total_nodes
    draw_tree_nodes(ax, tree, 0, y_position, level_colors, max_depth)
    
    # Add title
    plt.title(f'Document Hierarchy Tree - {parser_name.upper()}', 
              fontsize=16, fontweight='bold', pad=20)
    
    # Add legend
    legend_elements = []
    for level, color in level_colors.items():
        if level <= max_depth:
            legend_elements.append(patches.Patch(color=color, label=f'Level {level} (H{level})'))
    
    if legend_elements:
        ax.legend(handles=legend_elements, loc='upper right', bbox_to_anchor=(1, 1))
    
    # Save the image
    output_file = Path(output_dir) / f'{parser_name}_tree.png'
    plt.tight_layout()
    plt.savefig(output_file, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    
    return output_file

def draw_tree_nodes(ax, nodes, x_start, y_start, colors, max_width, parent_x=None, parent_y=None):
    """Recursively draw tree nodes"""
    y_pos = y_start
    
    for i, node in enumerate(nodes):
        # Calculate position
        x_pos = x_start + node['level'] * 2
        
        # Draw connection line to parent
        if parent_x is not None and parent_y is not None:
            ax.plot([parent_x + 0.5, x_pos], [parent_y, y_pos], 'k-', alpha=0.3, linewidth=1)
        
        # Prepare node text
        title = node['title'][:30] + "..." if len(node['title']) > 30 else node['title']
        content_words = len(node['content'].split()) if node['content'] else 0
        
        # Node color based on level
        color = colors.get(node['level'], '#6B7280')
        
        # Draw node box
        width = min(2.5, max_width - x_pos - 0.5)
        height = 0.6
        
        # Create fancy box
        box = FancyBboxPatch(
            (x_pos, y_pos - height/2), width, height,
            boxstyle="round,pad=0.05",
            facecolor=color,
            edgecolor='white',
            linewidth=2,
            alpha=0.8
        )
        ax.add_patch(box)
        
        # Add text
        ax.text(x_pos + width/2, y_pos, f'H{node["level"]}\n{title}', 
                ha='center', va='center', fontsize=8, 
                color='white', fontweight='bold',
                wrap=True)
        
        # Add word count
        if content_words > 0:
            ax.text(x_pos + width + 0.1, y_pos, f'{content_words}w', 
                    ha='left', va='center', fontsize=6, 
                    color='gray', style='italic')
        
        # Draw children
        if node['children']:
            child_y = draw_tree_nodes(ax, node['children'], x_start, y_pos - 1, 
                                    colors, max_width, x_pos + width/2, y_pos)
            y_pos = child_y
        else:
            y_pos -= 1
    
    return y_pos

def get_max_depth(tree):
    """Get maximum depth of the tree"""
    if not tree:
        return 0
    
    max_depth = 0
    for node in tree:
        depth = node['level']
        if node['children']:
            child_depth = get_max_depth(node['children'])
            depth = max(depth, child_depth)
        max_depth = max(max_depth, depth)
    
    return max_depth

def count_nodes(tree):
    """Count total nodes in tree"""
    if not tree:
        return 0
    
    count = 0
    for node in tree:
        count += 1
        if node['children']:
            count += count_nodes(node['children'])
    
    return count

def create_comparison_chart(trees, output_dir='tree_images'):
    """Create a comparison chart of all parsers"""
    
    Path(output_dir).mkdir(exist_ok=True)
    
    # Prepare data
    parser_names = list(trees.keys())
    meaningful_sections = []
    content_words = []
    
    for parser_name, tree in trees.items():
        # Count meaningful sections (with content > 10 words)
        meaningful = count_meaningful_sections(tree)
        total_words = count_total_words(tree)
        
        meaningful_sections.append(meaningful)
        content_words.append(total_words)
    
    # Create comparison chart
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
    
    # Chart 1: Meaningful Sections
    bars1 = ax1.bar(parser_names, meaningful_sections, color=['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'])
    ax1.set_title('Meaningful Sections Detected', fontsize=14, fontweight='bold')
    ax1.set_ylabel('Number of Sections')
    ax1.tick_params(axis='x', rotation=45)
    
    # Add value labels on bars
    for bar, value in zip(bars1, meaningful_sections):
        ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5, 
                str(value), ha='center', va='bottom', fontweight='bold')
    
    # Chart 2: Content Words
    bars2 = ax2.bar(parser_names, content_words, color=['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'])
    ax2.set_title('Content Words Extracted', fontsize=14, fontweight='bold')
    ax2.set_ylabel('Number of Words')
    ax2.tick_params(axis='x', rotation=45)
    
    # Add value labels on bars
    for bar, value in zip(bars2, content_words):
        ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 50, 
                str(value), ha='center', va='bottom', fontweight='bold')
    
    plt.tight_layout()
    comparison_file = Path(output_dir) / 'parser_comparison_chart.png'
    plt.savefig(comparison_file, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    
    return comparison_file

def count_meaningful_sections(tree):
    """Count sections with meaningful content (>10 words)"""
    count = 0
    for node in tree:
        # Skip noise sections
        title = node['title'].strip()
        if title not in ['SAMPLE', '* End of page *', 'AIA International Limited']:
            content_words = len(node['content'].split()) if node['content'] else 0
            if content_words > 10:
                count += 1
        
        if node['children']:
            count += count_meaningful_sections(node['children'])
    
    return count

def count_total_words(tree):
    """Count total content words in tree"""
    total = 0
    for node in tree:
        if node['content']:
            total += len(node['content'].split())
        if node['children']:
            total += count_total_words(node['children'])
    
    return total

def main():
    trees_file = Path('parser_trees.json')
    
    if not trees_file.exists():
        print("❌ No parser trees found. Run parser-to-tree.py first!")
        return
    
    with open(trees_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    trees = data['trees']
    
    print("🎨 Generating visual tree diagrams...")
    print("=" * 50)
    
    output_dir = 'tree_images'
    generated_files = []
    
    # Generate individual tree images
    for parser_name, tree in trees.items():
        print(f"📊 Creating tree diagram for {parser_name}...")
        
        try:
            # Filter to meaningful sections only
            meaningful_tree = filter_meaningful_sections(tree)
            
            if meaningful_tree:
                output_file = create_tree_visualization(meaningful_tree, parser_name, output_dir)
                generated_files.append(output_file)
                print(f"✅ Saved: {output_file}")
            else:
                print(f"❌ No meaningful sections found for {parser_name}")
                
        except Exception as e:
            print(f"❌ Error generating {parser_name}: {e}")
    
    # Generate comparison chart
    print(f"\n📊 Creating comparison chart...")
    try:
        comparison_file = create_comparison_chart(trees, output_dir)
        generated_files.append(comparison_file)
        print(f"✅ Saved: {comparison_file}")
    except Exception as e:
        print(f"❌ Error generating comparison: {e}")
    
    print(f"\n🎉 Generated {len(generated_files)} visual files in '{output_dir}/' directory:")
    for file in generated_files:
        print(f"   📁 {file}")
    
    print(f"\n💡 Open the '{output_dir}/' folder to view the tree diagrams!")

def filter_meaningful_sections(tree):
    """Filter out noise sections to show only meaningful content"""
    filtered = []
    
    for node in tree:
        title = node['title'].strip()
        
        # Skip noise sections
        if (title in ['SAMPLE', '* End of page *'] or
            title.startswith('AIA International Limited') or
            len(title) < 4):
            # But include children if they're meaningful
            if node['children']:
                child_filtered = filter_meaningful_sections(node['children'])
                filtered.extend(child_filtered)
            continue
        
        # Include meaningful sections
        content_words = len(node['content'].split()) if node['content'] else 0
        filtered_children = filter_meaningful_sections(node['children']) if node['children'] else []
        
        if content_words > 5 or filtered_children:
            filtered_node = {
                'title': title,
                'level': node['level'],
                'content': node['content'],
                'children': filtered_children
            }
            filtered.append(filtered_node)
    
    return filtered

if __name__ == "__main__":
    main()
