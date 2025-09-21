import React, { useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, Trash2, Edit3, FileText } from 'lucide-react';
import { TreeNode } from '../types';
import { estimateTokens } from '../utils/markdownParser';

interface SimpleTreeEditorProps {
  initialTree: TreeNode[];
  onTreeChange: (tree: TreeNode[]) => void;
  onNodeSelect?: (node: TreeNode | null) => void;
  selectedNodeId?: string;
}

interface TreeNodeProps {
  node: TreeNode;
  depth: number;
  onSelect: (node: TreeNode) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
  isSelected: boolean;
  expandedNodes: Set<string>;
  onToggleExpanded: (id: string) => void;
  selectedNodeId?: string;
}

const TreeNodeComponent: React.FC<TreeNodeProps> = ({
  node,
  depth,
  onSelect,
  onDelete,
  onEdit,
  isSelected,
  expandedNodes,
  onToggleExpanded,
  selectedNodeId
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(node.title);
  
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  const tokenCount = estimateTokens(node.content || '');

  const handleEditSubmit = () => {
    onEdit(node.id, editTitle);
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditTitle(node.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  return (
    <div>
      <div
        className={`
          flex items-center space-x-2 p-2 rounded-md cursor-pointer group
          ${isSelected ? 'bg-primary-100 border border-primary-300' : 'hover:bg-gray-50'}
        `}
        style={{ marginLeft: depth * 20 }}
        onClick={() => onSelect(node)}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) {
              onToggleExpanded(node.id);
            }
          }}
          className="flex-shrink-0 p-1 hover:bg-gray-200 rounded"
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            )
          ) : (
            <div className="h-4 w-4" />
          )}
        </button>

        {/* Level indicator */}
        <div className={`
          flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white
          ${node.level === 1 ? 'bg-blue-500' : 
            node.level === 2 ? 'bg-green-500' : 
            node.level === 3 ? 'bg-yellow-500' : 
            node.level === 4 ? 'bg-orange-500' : 
            node.level === 5 ? 'bg-red-500' : 'bg-purple-500'}
        `}>
          H{node.level}
        </div>

        {/* Title */}
        <div className="flex-grow min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleEditSubmit}
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
          ) : (
            <span className="text-sm font-medium text-gray-900 truncate block">
              {node.title}
            </span>
          )}
        </div>

        {/* Token count */}
        <div className="flex-shrink-0 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {tokenCount} tokens
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex space-x-1 opacity-0 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-1 hover:bg-gray-200 rounded"
            title="Edit title"
          >
            <Edit3 className="h-3 w-3 text-gray-600" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
            className="p-1 hover:bg-red-100 rounded"
            title="Delete node"
          >
            <Trash2 className="h-3 w-3 text-red-600" />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              onDelete={onDelete}
              onEdit={onEdit}
              isSelected={selectedNodeId === child.id}
              expandedNodes={expandedNodes}
              onToggleExpanded={onToggleExpanded}
              selectedNodeId={selectedNodeId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SimpleTreeEditor: React.FC<SimpleTreeEditorProps> = ({
  initialTree,
  onTreeChange,
  onNodeSelect,
  selectedNodeId
}) => {
  const [tree, setTree] = useState<TreeNode[]>(initialTree);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    // Auto-expand first level by default
    const initialExpanded = new Set<string>();
    initialTree.forEach(node => {
      if (node.children && node.children.length > 0) {
        initialExpanded.add(node.id);
      }
    });
    return initialExpanded;
  });
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);

  // Update tree when initialTree changes
  React.useEffect(() => {
    setTree(initialTree);
  }, [initialTree]);

  const handleNodeSelect = useCallback((node: TreeNode) => {
    setSelectedNode(node);
    onNodeSelect?.(node);
  }, [onNodeSelect]);

  const handleNodeDelete = useCallback((nodeId: string) => {
    const deleteNodeRecursive = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.filter(node => {
        if (node.id === nodeId) {
          return false;
        }
        if (node.children) {
          node.children = deleteNodeRecursive(node.children);
        }
        return true;
      });
    };

    const newTree = deleteNodeRecursive(tree);
    setTree(newTree);
    onTreeChange(newTree);
    
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
      onNodeSelect?.(null);
    }
  }, [tree, onTreeChange, selectedNode, onNodeSelect]);

  const handleNodeEdit = useCallback((nodeId: string, newTitle: string) => {
    const editNodeRecursive = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, title: newTitle };
        }
        if (node.children) {
          return { ...node, children: editNodeRecursive(node.children) };
        }
        return node;
      });
    };

    const newTree = editNodeRecursive(tree);
    setTree(newTree);
    onTreeChange(newTree);
  }, [tree, onTreeChange]);

  const handleToggleExpanded = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  const totalTokens = React.useMemo(() => {
    const countTokens = (nodes: TreeNode[]): number => {
      return nodes.reduce((sum, node) => {
        let nodeTokens = estimateTokens(node.content || '');
        if (node.children) {
          nodeTokens += countTokens(node.children);
        }
        return sum + nodeTokens;
      }, 0);
    };
    return countTokens(tree);
  }, [tree]);

  const totalNodes = React.useMemo(() => {
    const countNodes = (nodes: TreeNode[]): number => {
      return nodes.reduce((sum, node) => {
        let count = 1;
        if (node.children) {
          count += countNodes(node.children);
        }
        return sum + count;
      }, 0);
    };
    return countNodes(tree);
  }, [tree]);

  return (
    <div className="w-full h-full flex flex-col max-h-full">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Document Hierarchy</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>{totalNodes} sections</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>~{totalTokens.toLocaleString()} tokens</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Tree Content */}
      <div className="flex-grow overflow-y-auto overflow-x-hidden p-4 min-h-0 bg-white">
        <div className="space-y-1 pb-4">
          {tree.map((node) => (
            <TreeNodeComponent
              key={node.id}
              node={node}
              depth={0}
              onSelect={handleNodeSelect}
              onDelete={handleNodeDelete}
              onEdit={handleNodeEdit}
              isSelected={selectedNodeId === node.id}
              expandedNodes={expandedNodes}
              onToggleExpanded={handleToggleExpanded}
              selectedNodeId={selectedNodeId}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimpleTreeEditor;
