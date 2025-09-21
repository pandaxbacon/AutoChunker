import React, { useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, Trash2, Edit3, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { TreeNode } from '../types';
import { estimateTokens } from '../utils/markdownParser';

interface DraggableTreeEditorProps {
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
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onAddChild: (parentId: string) => void;
  isSelected: boolean;
  expandedNodes: Set<string>;
  onToggleExpanded: (id: string) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  selectedNodeId?: string;
}

const DraggableTreeNode: React.FC<TreeNodeProps> = ({
  node,
  depth,
  onSelect,
  onDelete,
  onEdit,
  onMoveUp,
  onMoveDown,
  onAddChild,
  isSelected,
  expandedNodes,
  onToggleExpanded,
  canMoveUp,
  canMoveDown,
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
          flex items-center space-x-2 p-2 rounded-md cursor-pointer group transition-colors
          ${isSelected ? 'bg-primary-100 border border-primary-300 shadow-sm' : 'hover:bg-gray-50'}
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
          className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
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
        <div className="flex-shrink-0 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Move buttons */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp(node.id);
            }}
            disabled={!canMoveUp}
            className="p-1 hover:bg-blue-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move up"
          >
            <ArrowUp className="h-3 w-3 text-blue-600" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown(node.id);
            }}
            disabled={!canMoveDown}
            className="p-1 hover:bg-blue-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move down"
          >
            <ArrowDown className="h-3 w-3 text-blue-600" />
          </button>

          {/* Add child button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(node.id);
            }}
            className="p-1 hover:bg-green-100 rounded"
            title="Add child section"
          >
            <Plus className="h-3 w-3 text-green-600" />
          </button>
          
          {/* Edit button */}
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
          
          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
            className="p-1 hover:bg-red-100 rounded"
            title="Delete section"
          >
            <Trash2 className="h-3 w-3 text-red-600" />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child, index) => (
            <DraggableTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              onDelete={onDelete}
              onEdit={onEdit}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onAddChild={onAddChild}
              isSelected={selectedNodeId === child.id}
              expandedNodes={expandedNodes}
              onToggleExpanded={onToggleExpanded}
              canMoveUp={index > 0}
              canMoveDown={index < node.children!.length - 1}
              selectedNodeId={selectedNodeId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const DraggableTreeEditor: React.FC<DraggableTreeEditorProps> = ({
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

  // Update tree when initialTree changes
  React.useEffect(() => {
    setTree(initialTree);
  }, [initialTree]);

  const handleNodeSelect = useCallback((node: TreeNode) => {
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
  }, [tree, onTreeChange]);

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

  const handleMoveUp = useCallback((nodeId: string) => {
    const moveNodeUp = (nodes: TreeNode[]): TreeNode[] => {
      const newNodes = [...nodes];
      for (let i = 1; i < newNodes.length; i++) {
        if (newNodes[i].id === nodeId) {
          [newNodes[i-1], newNodes[i]] = [newNodes[i], newNodes[i-1]];
          return newNodes;
        }
        if (newNodes[i].children) {
          newNodes[i] = { ...newNodes[i], children: moveNodeUp(newNodes[i].children!) };
        }
      }
      return newNodes;
    };

    const newTree = moveNodeUp(tree);
    setTree(newTree);
    onTreeChange(newTree);
  }, [tree, onTreeChange]);

  const handleMoveDown = useCallback((nodeId: string) => {
    const moveNodeDown = (nodes: TreeNode[]): TreeNode[] => {
      const newNodes = [...nodes];
      for (let i = 0; i < newNodes.length - 1; i++) {
        if (newNodes[i].id === nodeId) {
          [newNodes[i], newNodes[i+1]] = [newNodes[i+1], newNodes[i]];
          return newNodes;
        }
        if (newNodes[i].children) {
          newNodes[i] = { ...newNodes[i], children: moveNodeDown(newNodes[i].children!) };
        }
      }
      return newNodes;
    };

    const newTree = moveNodeDown(tree);
    setTree(newTree);
    onTreeChange(newTree);
  }, [tree, onTreeChange]);

  const handleAddChild = useCallback((parentId: string) => {
    let newNodeId = Date.now().toString();
    
    const addChildRecursive = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => {
        if (node.id === parentId) {
          const newChild: TreeNode = {
            id: `section-${newNodeId}`,
            title: 'New Section',
            level: node.level + 1,
            content: '',
            children: []
          };
          
          return {
            ...node,
            children: [...(node.children || []), newChild]
          };
        }
        if (node.children) {
          return { ...node, children: addChildRecursive(node.children) };
        }
        return node;
      });
    };

    const newTree = addChildRecursive(tree);
    setTree(newTree);
    onTreeChange(newTree);
    
    // Auto-expand parent
    setExpandedNodes(prev => new Set([...prev, parentId]));
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
    <div className="w-full h-full flex flex-col">
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Document Hierarchy</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <span>{totalNodes} sections</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>~{totalTokens.toLocaleString()} tokens total</span>
            </div>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          💡 Use arrow buttons to reorder • Plus button to add sections • Click to select
        </div>
      </div>

      <div className="flex-grow overflow-auto p-4">
        <div className="space-y-1">
          {tree.map((node, index) => (
            <DraggableTreeNode
              key={node.id}
              node={node}
              depth={0}
              onSelect={handleNodeSelect}
              onDelete={handleNodeDelete}
              onEdit={handleNodeEdit}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onAddChild={handleAddChild}
              isSelected={selectedNodeId === node.id}
              expandedNodes={expandedNodes}
              onToggleExpanded={handleToggleExpanded}
              canMoveUp={index > 0}
              canMoveDown={index < tree.length - 1}
              selectedNodeId={selectedNodeId}
            />
          ))}
        </div>
        
        {/* Add root section button */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              const newNode: TreeNode = {
                id: `section-${Date.now()}`,
                title: 'New Section',
                level: 1,
                content: '',
                children: []
              };
              const newTree = [...tree, newNode];
              setTree(newTree);
              onTreeChange(newTree);
            }}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Section</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraggableTreeEditor;
