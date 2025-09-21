import React, { useState, useCallback } from 'react';
import { Settings, FileText, Package } from 'lucide-react';
import { TreeNode, DocumentChunk } from '../types';
import { estimateTokens } from '../utils/markdownParser';

interface ChunkExporterProps {
  tree: TreeNode[];
  originalFilename?: string;
}

interface ChunkingOptions {
  maxTokens: number;
  overlapTokens: number;
  preserveHeaders: boolean;
  includeMetadata: boolean;
}

const ChunkExporter: React.FC<ChunkExporterProps> = ({ tree, originalFilename }) => {
  const [options, setOptions] = useState<ChunkingOptions>({
    maxTokens: 1000,
    overlapTokens: 100,
    preserveHeaders: true,
    includeMetadata: true
  });
  const [showOptions, setShowOptions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const generateChunks = useCallback((): DocumentChunk[] => {
    const chunks: DocumentChunk[] = [];
    let chunkId = 1;

    function processNode(node: TreeNode, parentChunk?: DocumentChunk): void {
      const nodeContent = node.content.trim();
      const headerText = options.preserveHeaders ? `${'#'.repeat(node.level)} ${node.title}\n\n` : '';
      const fullContent = headerText + nodeContent;
      const tokenCount = estimateTokens(fullContent);

      if (tokenCount <= options.maxTokens) {
        // Node fits in one chunk
        chunks.push({
          id: `chunk-${chunkId++}`,
          title: node.title,
          content: fullContent.trim(),
          level: node.level,
          tokenCount,
          parentId: parentChunk?.id
        });
      } else {
        // Node needs to be split
        const sentences = nodeContent.split(/(?<=[.!?])\s+/);
        let currentChunk = headerText;
        let currentTokens = estimateTokens(headerText);
        let chunkCount = 1;

        for (const sentence of sentences) {
          const sentenceTokens = estimateTokens(sentence);
          
          if (currentTokens + sentenceTokens > options.maxTokens && currentChunk.trim() !== headerText.trim()) {
            // Save current chunk
            chunks.push({
              id: `chunk-${chunkId++}`,
              title: `${node.title} (Part ${chunkCount})`,
              content: currentChunk.trim(),
              level: node.level,
              tokenCount: currentTokens,
              parentId: parentChunk?.id
            });

            // Start new chunk with overlap
            const overlap = options.overlapTokens > 0 ? 
              currentChunk.split(' ').slice(-Math.floor(options.overlapTokens / 4)).join(' ') : '';
            currentChunk = headerText + overlap + (overlap ? ' ' : '') + sentence;
            currentTokens = estimateTokens(currentChunk);
            chunkCount++;
          } else {
            currentChunk += (currentChunk.endsWith(headerText.trim()) ? '' : ' ') + sentence;
            currentTokens += sentenceTokens;
          }
        }

        // Save final chunk if it has content
        if (currentChunk.trim() !== headerText.trim()) {
          chunks.push({
            id: `chunk-${chunkId++}`,
            title: chunkCount > 1 ? `${node.title} (Part ${chunkCount})` : node.title,
            content: currentChunk.trim(),
            level: node.level,
            tokenCount: currentTokens,
            parentId: parentChunk?.id
          });
        }
      }

      // Process children
      if (node.children) {
        const lastChunk = chunks[chunks.length - 1];
        for (const child of node.children) {
          processNode(child, lastChunk);
        }
      }
    }

    for (const rootNode of tree) {
      processNode(rootNode);
    }

    return chunks;
  }, [tree, options]);

  const handleExportJSON = useCallback(() => {
    setIsExporting(true);
    try {
      const chunks = generateChunks();
      const exportData = {
        metadata: {
          originalFilename: originalFilename || 'document',
          exportDate: new Date().toISOString(),
          totalChunks: chunks.length,
          chunkingOptions: options,
          totalTokens: chunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0)
        },
        chunks: options.includeMetadata ? chunks : chunks.map(chunk => ({
          id: chunk.id,
          title: chunk.title,
          content: chunk.content
        }))
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${originalFilename || 'document'}_chunks.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [generateChunks, originalFilename, options]);

  const handleExportMarkdown = useCallback(() => {
    setIsExporting(true);
    try {
      const chunks = generateChunks();
      let markdown = `# Document Chunks Export\n\n`;
      markdown += `**Original File:** ${originalFilename || 'document'}\n`;
      markdown += `**Export Date:** ${new Date().toLocaleString()}\n`;
      markdown += `**Total Chunks:** ${chunks.length}\n`;
      markdown += `**Max Tokens per Chunk:** ${options.maxTokens}\n\n`;
      markdown += `---\n\n`;

      chunks.forEach((chunk, index) => {
        markdown += `## Chunk ${index + 1}: ${chunk.title}\n\n`;
        markdown += `**Tokens:** ${chunk.tokenCount}\n`;
        markdown += `**Level:** H${chunk.level}\n`;
        if (chunk.parentId) {
          markdown += `**Parent:** ${chunk.parentId}\n`;
        }
        markdown += `\n${chunk.content}\n\n---\n\n`;
      });

      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${originalFilename || 'document'}_chunks.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [generateChunks, originalFilename, options]);

  const chunks = generateChunks();
  const totalTokens = chunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0);
  const avgTokensPerChunk = Math.round(totalTokens / chunks.length);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Export Chunks</h3>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            <Settings className="h-4 w-4" />
            <span>Options</span>
          </button>
        </div>
      </div>

      {/* Options Panel */}
      {showOptions && (
        <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Tokens per Chunk
              </label>
              <input
                type="number"
                value={options.maxTokens}
                onChange={(e) => setOptions(prev => ({ 
                  ...prev, 
                  maxTokens: Math.max(100, parseInt(e.target.value) || 1000) 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="100"
                max="4000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Overlap Tokens
              </label>
              <input
                type="number"
                value={options.overlapTokens}
                onChange={(e) => setOptions(prev => ({ 
                  ...prev, 
                  overlapTokens: Math.max(0, parseInt(e.target.value) || 100) 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="0"
                max="500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.preserveHeaders}
                onChange={(e) => setOptions(prev => ({ 
                  ...prev, 
                  preserveHeaders: e.target.checked 
                }))}
                className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Preserve headers in chunks</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeMetadata}
                onChange={(e) => setOptions(prev => ({ 
                  ...prev, 
                  includeMetadata: e.target.checked 
                }))}
                className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Include metadata in export</span>
            </label>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary-600">{chunks.length}</div>
            <div className="text-sm text-gray-600">Total Chunks</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{totalTokens.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Tokens</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{avgTokensPerChunk}</div>
            <div className="text-sm text-gray-600">Avg Tokens/Chunk</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {Math.max(...chunks.map(c => c.tokenCount))}
            </div>
            <div className="text-sm text-gray-600">Max Tokens</div>
          </div>
        </div>
      </div>

      {/* Chunk Preview */}
      <div className="flex-grow overflow-auto p-4">
        <div className="space-y-3">
          {chunks.map((chunk, index) => (
            <div key={chunk.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`
                    w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white
                    ${chunk.level === 1 ? 'bg-blue-500' : 
                      chunk.level === 2 ? 'bg-green-500' : 
                      chunk.level === 3 ? 'bg-yellow-500' : 
                      chunk.level === 4 ? 'bg-orange-500' : 
                      chunk.level === 5 ? 'bg-red-500' : 'bg-purple-500'}
                  `}>
                    {index + 1}
                  </div>
                  <h4 className="font-medium text-gray-900">{chunk.title}</h4>
                </div>
                <div className="text-sm text-gray-500">
                  {chunk.tokenCount} tokens
                </div>
              </div>
              <div className="text-sm text-gray-600 line-clamp-3">
                {chunk.content.substring(0, 200)}
                {chunk.content.length > 200 && '...'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex space-x-3">
          <button
            onClick={handleExportJSON}
            disabled={isExporting || chunks.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Package className="h-4 w-4" />
            )}
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            disabled={isExporting || chunks.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <FileText className="h-4 w-4" />
            )}
            <span>Export Markdown</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChunkExporter;
