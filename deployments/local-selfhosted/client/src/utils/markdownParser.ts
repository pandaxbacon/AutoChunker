import { TreeNode, NodeModel } from '../types';

export interface ParsedSection {
  id: string;
  title: string;
  level: number;
  content: string;
  startIndex: number;
  endIndex: number;
}

export function parseMarkdownToTree(markdown: string): TreeNode[] {
  const lines = markdown.split('\n');
  const sections: ParsedSection[] = [];
  let currentContent: string[] = [];
  let sectionId = 0;

  // First pass: identify all headers and their content
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Check for traditional markdown headers (# ## ###)
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    
    // Check for implicit headers (all caps, standalone lines, or bold text)
    const isImplicitHeader = 
      // All caps standalone line with significant length
      (/^[A-Z\s]{3,}$/.test(trimmedLine) && trimmedLine.length > 2 && trimmedLine.length < 50) ||
      // Lines that look like section titles
      (/^[A-Z][A-Za-z\s]+:?\s*$/.test(trimmedLine) && trimmedLine.length > 5 && trimmedLine.length < 80) ||
      // Bold text that might be headers
      (/^\*\*(.+)\*\*$/.test(trimmedLine));
    
    if (headerMatch || isImplicitHeader) {
      // Save previous section's content if exists
      if (sections.length > 0) {
        sections[sections.length - 1].content = currentContent.join('\n').trim();
        sections[sections.length - 1].endIndex = i - 1;
      }
      
      let level: number;
      let title: string;
      
      if (headerMatch) {
        // Traditional markdown header
        level = headerMatch[1].length;
        title = headerMatch[2].trim();
      } else {
        // Implicit header - determine level based on characteristics
        if (/^[A-Z\s]+$/.test(trimmedLine)) {
          // All caps = major section (level 1)
          level = 1;
          title = trimmedLine;
        } else if (/^\*\*(.+)\*\*$/.test(trimmedLine)) {
          // Bold text = subsection (level 2)
          level = 2;
          title = trimmedLine.replace(/^\*\*(.+)\*\*$/, '$1');
        } else {
          // Other patterns = level 2
          level = 2;
          title = trimmedLine.replace(/:$/, ''); // Remove trailing colon
        }
      }
      
      sections.push({
        id: `section-${sectionId++}`,
        title: title.trim(),
        level,
        content: '',
        startIndex: i,
        endIndex: i
      });
      
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  
  // Handle last section
  if (sections.length > 0) {
    sections[sections.length - 1].content = currentContent.join('\n').trim();
    sections[sections.length - 1].endIndex = lines.length - 1;
  }
  
  // Handle case where there's no headers - create a single section
  if (sections.length === 0) {
    return [{
      id: 'section-0',
      title: 'Document Content',
      level: 1,
      content: markdown.trim(),
      children: []
    }];
  }
  
  // Second pass: build tree structure
  return buildTreeFromSections(sections);
}

function buildTreeFromSections(sections: ParsedSection[]): TreeNode[] {
  const tree: TreeNode[] = [];
  const stack: TreeNode[] = [];
  
  for (const section of sections) {
    const node: TreeNode = {
      id: section.id,
      title: section.title,
      level: section.level,
      content: section.content,
      children: []
    };
    
    // Find the correct parent level
    while (stack.length > 0 && stack[stack.length - 1].level >= section.level) {
      stack.pop();
    }
    
    if (stack.length === 0) {
      // Top level node
      tree.push(node);
    } else {
      // Child node
      const parent = stack[stack.length - 1];
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(node);
      node.parent = parent.id;
    }
    
    stack.push(node);
  }
  
  return tree;
}

export function treeToNodeModels(tree: TreeNode[]): NodeModel[] {
  const models: NodeModel[] = [];
  let index = 0;
  
  function traverse(nodes: TreeNode[], parentId: string = '0') {
    for (const node of nodes) {
      models.push({
        id: node.id,
        parent: parentId,
        text: node.title,
        droppable: true,
        data: {
          level: node.level,
          content: node.content,
          originalIndex: index++
        }
      });
      
      if (node.children && node.children.length > 0) {
        traverse(node.children, node.id);
      }
    }
  }
  
  traverse(tree);
  return models;
}

export function nodeModelsToTree(models: NodeModel[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();
  const rootNodes: TreeNode[] = [];
  
  // Create all nodes first
  for (const model of models) {
    const node: TreeNode = {
      id: model.id,
      title: model.text,
      level: model.data?.level || 1,
      content: model.data?.content || '',
      children: []
    };
    nodeMap.set(model.id, node);
  }
  
  // Build parent-child relationships
  for (const model of models) {
    const node = nodeMap.get(model.id)!;
    
    if (model.parent === '0') {
      rootNodes.push(node);
    } else {
      const parent = nodeMap.get(model.parent);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(node);
        node.parent = parent.id;
      }
    }
  }
  
  return rootNodes;
}

export function treeToMarkdown(tree: TreeNode[]): string {
  let markdown = '';
  
  function traverse(nodes: TreeNode[]) {
    for (const node of nodes) {
      // Add header
      const headerPrefix = '#'.repeat(node.level);
      markdown += `${headerPrefix} ${node.title}\n\n`;
      
      // Add content if exists
      if (node.content.trim()) {
        markdown += `${node.content}\n\n`;
      }
      
      // Process children
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  }
  
  traverse(tree);
  return markdown.trim();
}

// Simple token counting (approximation: 1 token ≈ 4 characters)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
