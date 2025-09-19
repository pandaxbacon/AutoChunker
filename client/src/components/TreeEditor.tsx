import React, { useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, Trash2, Edit3, Plus, FileText } from 'lucide-react';
import { NodeModel, TreeNode } from '../types';
import { treeToNodeModels, nodeModelsToTree, estimateTokens } from '../utils/markdownParser';

interface TreeEditorProps {
  initialTree: TreeNode[];
  onTreeChange: (tree: TreeNode[]) => void;
  onNodeSelect?: (node: TreeNode | null) => void;
  selectedNodeId?: string;
}

interface CustomNodeProps {
  node: NodeModel;
  depth: number;
  isOpen: boolean;
  onToggle: (id: string) => void;
  onSelect: (node: NodeModel) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
  isSelected: boolean;
}

const CustomNode: React.FC<CustomNodeProps> = ({
  node,
  depth,
  isOpen,
  onToggle,
  onSelect,
  onDelete,
  onEdit,
  isSelected
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(node.text);
  
  const hasChildren = node.droppable;
  const level = node.data?.level || 1;
  const tokenCount = estimateTokens(node.data?.content || '');

  const handleEditSubmit = () => {
    onEdit(node.id, editTitle);
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditTitle(node.text);
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
    <div
      className={`
        flex items-center space-x-2 p-2 rounded-md cursor-pointer
        ${isSelected ? 'bg-primary-100 border border-primary-300' : 'hover:bg-gray-50'}
      `}
      style={{ marginLeft: depth * 20 }}
      onClick={() => onSelect(node)}
    >
      {/* Expand/Collapse Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(node.id);
        }}
        className="flex-shrink-0 p-1 hover:bg-gray-200 rounded"
        disabled={!hasChildren}
      >
        {hasChildren ? (
          isOpen ? (
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
        ${level === 1 ? 'bg-blue-500' : level === 2 ? 'bg-green-500' : level === 3 ? 'bg-yellow-500' : 
          level === 4 ? 'bg-orange-500' : level === 5 ? 'bg-red-500' : 'bg-purple-500'}
      `}>
        H{level}
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
            {node.text}
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
  );
};

const TreeEditor: React.FC<TreeEditorProps> = ({
  initialTree,
  onTreeChange,
  onNodeSelect,
  selectedNodeId
}) => {
  const [treeData, setTreeData] = useState<NodeModel[]>(() => treeToNodeModels(initialTree));
  const [selectedNode, setSelectedNode] = useState<NodeModel | null>(null);

  const handleDrop = useCallback((newTreeData: NodeModel[]) => {
    setTreeData(newTreeData);
    const newTree = nodeModelsToTree(newTreeData);
    onTreeChange(newTree);
  }, [onTreeChange]);

  const handleNodeSelect = useCallback((node: NodeModel) => {
    setSelectedNode(node);
    if (onNodeSelect) {
      const tree = nodeModelsToTree(treeData);
      const selectedTreeNode = findNodeInTree(tree, node.id);
      onNodeSelect(selectedTreeNode);
    }
  }, [onNodeSelect, treeData]);

  const handleNodeDelete = useCallback((nodeId: string) => {
    const newTreeData = treeData.filter(node => 
      node.id !== nodeId && !isDescendantOf(node, nodeId, treeData)
    );
    setTreeData(newTreeData);
    
    const newTree = nodeModelsToTree(newTreeData);
    onTreeChange(newTree);
    
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
      onNodeSelect?.(null);
    }
  }, [treeData, onTreeChange, selectedNode, onNodeSelect]);

  const handleNodeEdit = useCallback((nodeId: string, newTitle: string) => {
    const newTreeData = treeData.map(node =>
      node.id === nodeId ? { ...node, text: newTitle } : node
    );
    setTreeData(newTreeData);
    
    const newTree = nodeModelsToTree(newTreeData);
    onTreeChange(newTree);
  }, [treeData, onTreeChange]);

  const totalTokens = treeData.reduce((sum, node) => 
    sum + estimateTokens(node.data?.content || ''), 0
  );

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Document Hierarchy</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>{treeData.length} sections</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>~{totalTokens} tokens total</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-auto p-4">
        <DndProvider backend={HTML5Backend}>
          <Tree
            tree={treeData}
            rootId="0"
            onDrop={handleDrop}
            render={(node, { depth, isOpen, onToggle }) => (
              <div className="group">
                <CustomNode
                  node={node}
                  depth={depth}
                  isOpen={isOpen}
                  onToggle={onToggle}
                  onSelect={handleNodeSelect}
                  onDelete={handleNodeDelete}
                  onEdit={handleNodeEdit}
                  isSelected={selectedNodeId === node.id}
                />
              </div>
            )}
            dragPreviewRender={(monitorProps) => (
              <div className="bg-primary-100 border border-primary-300 rounded px-2 py-1 shadow-lg">
                {monitorProps.item.text}
              </div>
            )}
            classes={{
              root: 'space-y-1',
              draggingSource: 'opacity-30',
              dropTarget: 'bg-primary-50 border-2 border-dashed border-primary-300'
            }}
          />
        </DndProvider>
      </div>
    </div>
  );
};

// Helper functions
function findNodeInTree(tree: TreeNode[], nodeId: string): TreeNode | null {
  for (const node of tree) {
    if (node.id === nodeId) {
      return node;
    }
    if (node.children) {
      const found = findNodeInTree(node.children, nodeId);
      if (found) return found;
    }
  }
  return null;
}

function isDescendantOf(node: NodeModel, ancestorId: string, treeData: NodeModel[]): boolean {
  let currentParent = node.parent;
  while (currentParent && currentParent !== '0') {
    if (currentParent === ancestorId) {
      return true;
    }
    const parentNode = treeData.find(n => n.id === currentParent);
    currentParent = parentNode?.parent;
  }
  return false;
}

export default TreeEditor;
