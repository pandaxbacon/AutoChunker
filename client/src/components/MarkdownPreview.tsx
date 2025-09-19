import React from 'react';
import { TreeNode } from '../types';
import { treeToMarkdown, estimateTokens } from '../utils/markdownParser';
import { FileText, Hash } from 'lucide-react';

interface MarkdownPreviewProps {
  tree: TreeNode[];
  selectedNode?: TreeNode | null;
  originalMarkdown?: string;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ 
  tree, 
  selectedNode, 
  originalMarkdown 
}) => {
  const currentMarkdown = treeToMarkdown(tree);
  const tokenCount = estimateTokens(currentMarkdown);

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
          <HeaderTag key={index} className={className}>
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
        <p key={index} className="text-gray-700 mb-2 leading-relaxed">
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
              <span className="font-medium text-gray-900">{selectedNode.title}</span>
              <span className="text-sm text-gray-500">
                (~{estimateTokens(selectedNode.content)} tokens)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-grow overflow-auto p-6">
        {selectedNode ? (
          <div className="prose max-w-none">
            <div className="space-y-4">
              <div className="border-l-4 border-primary-400 pl-4">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  {'#'.repeat(selectedNode.level)} {selectedNode.title}
                </h2>
              </div>
              
              {selectedNode.content.trim() && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="whitespace-pre-wrap font-mono text-sm text-gray-700">
                    {selectedNode.content}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="prose max-w-none">
            {currentMarkdown ? (
              <div className="space-y-2">
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

      {/* Footer with stats */}
      <div className="flex-shrink-0 p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div>
            {selectedNode ? 'Selected section preview' : 'Full document preview'}
          </div>
          <div className="flex space-x-4">
            <span>Characters: {currentMarkdown.length}</span>
            <span>Words: ~{Math.ceil(currentMarkdown.split(/\s+/).length)}</span>
            <span>Est. tokens: ~{tokenCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownPreview;
