import React, { useState } from 'react';
import { TreeNode } from '../types';
import { treeToMarkdown, estimateTokens } from '../utils/markdownParser';
import { FileText, Hash, Edit3, Save, X } from 'lucide-react';

interface MarkdownPreviewProps {
  tree: TreeNode[];
  selectedNode?: TreeNode | null;
  originalMarkdown?: string;
  originalFilename?: string;
  onContentChange?: (nodeId: string, newContent: string) => void;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ 
  tree, 
  selectedNode, 
  onContentChange 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const currentMarkdown = treeToMarkdown(tree);
  const tokenCount = estimateTokens(currentMarkdown);

  const handleStartEdit = () => {
    if (selectedNode) {
      setEditContent(selectedNode.content || '');
      setIsEditing(true);
      setHasUnsavedChanges(false);
    }
  };

  const handleSaveEdit = () => {
    if (selectedNode && onContentChange) {
      onContentChange(selectedNode.id, editContent);
      setIsEditing(false);
      setHasUnsavedChanges(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent('');
    setHasUnsavedChanges(false);
  };

  const handleContentChange = (value: string) => {
    setEditContent(value);
    setHasUnsavedChanges(value !== (selectedNode?.content || ''));
  };

  const renderMarkdownContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      // Handle headers
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const text = headerMatch[2];
        const HeaderTag = `h${level}` as keyof JSX.IntrinsicElements;
        const className = {
          1: 'text-2xl font-bold text-gray-900 mt-6 mb-4',
          2: 'text-xl font-bold text-gray-800 mt-5 mb-3',
          3: 'text-lg font-bold text-gray-800 mt-4 mb-2',
          4: 'text-base font-bold text-gray-700 mt-3 mb-2',
          5: 'text-sm font-bold text-gray-700 mt-2 mb-1',
          6: 'text-xs font-bold text-gray-600 mt-2 mb-1'
        }[level] || 'text-base font-bold text-gray-700 mt-2 mb-1';
        
        return (
          <HeaderTag key={index} className={`${className} text-left`}>
            {text}
          </HeaderTag>
        );
      }
      
      // Handle empty lines
      if (!line.trim()) {
        return <br key={index} />;
      }
      
      // Handle regular content
      return (
        <p key={index} className="text-gray-700 mb-2 leading-relaxed text-left">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedNode ? 'Selected Section' : 'Document Preview'}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Hash className="h-4 w-4" />
              <span>~{tokenCount} tokens</span>
            </div>
            <div className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>{currentMarkdown.split('\n').length} lines</span>
            </div>
          </div>
        </div>
        
        {selectedNode && (
          <div className="mt-2 p-2 bg-primary-50 border border-primary-200 rounded">
            <div className="flex items-center space-x-2">
              <div className={`
                w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white
                ${selectedNode.level === 1 ? 'bg-blue-500' : 
                  selectedNode.level === 2 ? 'bg-green-500' : 
                  selectedNode.level === 3 ? 'bg-yellow-500' : 
                  selectedNode.level === 4 ? 'bg-orange-500' : 
                  selectedNode.level === 5 ? 'bg-red-500' : 'bg-purple-500'}
              `}>
                H{selectedNode.level}
              </div>
              <span className="font-medium text-gray-900 text-sm">{selectedNode.title}</span>
              <span className="text-xs text-gray-500">
                ({estimateTokens(selectedNode.content || selectedNode.title)} tokens)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content - Full height preview and editor */}
      <div className="flex-grow overflow-auto p-6">
        {selectedNode ? (
          <div className="max-w-none space-y-4">
            {/* Section Header with Edit Button */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="border-l-4 border-primary-400 pl-4">
                <h2 className="text-xl font-bold text-gray-900 text-left">
                  {'#'.repeat(selectedNode.level)} {selectedNode.title}
                </h2>
              </div>
              
              <div className="flex items-center space-x-2">
                {hasUnsavedChanges && (
                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                    Unsaved changes
                  </span>
                )}
                
                {!isEditing ? (
                  <button
                    onClick={handleStartEdit}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-primary-600 hover:text-primary-700 border border-primary-300 rounded hover:bg-primary-50"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Content</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSaveEdit}
                      className="flex items-center space-x-1 px-3 py-1 text-sm text-green-600 hover:text-green-700 border border-green-300 rounded hover:bg-green-50"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </button>
                    
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Content Editor/Viewer */}
            <div className="space-y-4">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Section Content
                    </label>
                    <div className="text-xs text-gray-500">
                      {estimateTokens(editContent)} tokens • {editContent.split('\n').length} lines
                    </div>
                  </div>
                  
                  <textarea
                    value={editContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                    placeholder="Enter section content here..."
                  />
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>💡 Tip: Use plain text or markdown formatting</span>
                    <span>Characters: {editContent.length}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedNode.content.trim() ? (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="whitespace-pre-wrap font-mono text-sm text-gray-700 text-left leading-relaxed">
                        {selectedNode.content}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 mb-2">No content for this section</p>
                      <button
                        onClick={handleStartEdit}
                        className="text-primary-600 hover:text-primary-700 text-sm"
                      >
                        Click "Edit Content" to add content
                      </button>
                    </div>
                  )}
                  
                  {/* Content Statistics */}
                  <div className="grid grid-cols-3 gap-4 p-3 bg-blue-50 rounded border border-blue-200">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {estimateTokens(selectedNode.content || '')}
                      </div>
                      <div className="text-xs text-blue-600">Tokens</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {(selectedNode.content || '').split(' ').length}
                      </div>
                      <div className="text-xs text-green-600">Words</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">
                        {(selectedNode.content || '').split('\n').length}
                      </div>
                      <div className="text-xs text-orange-600">Lines</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-none">
            {currentMarkdown ? (
              <div className="space-y-2 text-left">
                {renderMarkdownContent(currentMarkdown)}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No content to preview</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default MarkdownPreview;
