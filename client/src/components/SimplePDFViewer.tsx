import React from 'react';
import { TreeNode } from '../types';
import { FileText, ExternalLink } from 'lucide-react';

interface SimplePDFViewerProps {
  originalFilename: string;
  selectedNode?: TreeNode | null;
}

const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ originalFilename, selectedNode }) => {
  const pdfUrl = `/api/pdf/${encodeURIComponent(originalFilename)}`;

  // Clean up section title for better PDF search
  const getSearchTerm = (node: TreeNode): string => {
    let searchTerm = node.title;
    
    // Remove common markdown artifacts
    searchTerm = searchTerm.replace(/^#+\s*/, ''); // Remove # headers
    searchTerm = searchTerm.replace(/\*\*/g, ''); // Remove bold markers
    searchTerm = searchTerm.replace(/\*/g, ''); // Remove italic markers
    searchTerm = searchTerm.replace(/[_]/g, ''); // Remove underscores
    
    // Clean up common parsing artifacts
    searchTerm = searchTerm.replace(/\s+/g, ' '); // Normalize spaces
    searchTerm = searchTerm.trim();
    
    // For very short terms, try to find a more specific search
    if (searchTerm.length < 5 && node.content) {
      // Try to find the first meaningful phrase from content
      const contentWords = node.content.split(' ').filter(word => word.length > 3);
      if (contentWords.length > 0) {
        // Use first few words of content for better matching
        searchTerm = contentWords.slice(0, 3).join(' ');
      }
    }
    
    return searchTerm;
  };

  if (!originalFilename.toLowerCase().endsWith('.pdf')) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">PDF preview only available for PDF files</p>
          <p className="text-sm text-gray-400 mt-1">Current file: {originalFilename}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* PDF Controls */}
      <div className="flex-shrink-0 p-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-gray-900">📄 PDF Preview</h4>
            {selectedNode && (
              <div className="text-sm text-gray-600 bg-yellow-100 px-2 py-1 rounded">
                Highlighting: {selectedNode.title}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {selectedNode && (
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                💡 Use Ctrl+F in PDF to search: "{getSearchTerm(selectedNode)}"
              </div>
            )}
            
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-3 py-1 text-sm text-primary-600 hover:text-primary-700 border border-primary-300 rounded hover:bg-primary-50"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Open Full PDF</span>
            </a>
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-grow overflow-hidden">
        {selectedNode ? (
          <div className="h-full flex flex-col">
            {/* Search and highlight info */}
            <div className="flex-shrink-0 p-2 bg-yellow-50 border-b border-yellow-200">
              <div className="text-sm text-yellow-800">
                🔍 Auto-searching for: <strong>"{getSearchTerm(selectedNode)}"</strong>
                {getSearchTerm(selectedNode) !== selectedNode.title && (
                  <span className="text-xs text-yellow-600 ml-2">
                    (cleaned from: "{selectedNode.title}")
                  </span>
                )}
              </div>
            </div>
            
            {/* PDF with search highlighting */}
            <div className="flex-grow">
              <iframe
                src={`${pdfUrl}#search=${encodeURIComponent(getSearchTerm(selectedNode))}&zoom=100`}
                className="w-full h-full border-0"
                title={`PDF Preview: ${originalFilename}`}
                onError={() => console.error('PDF iframe failed to load')}
              />
            </div>
          </div>
        ) : (
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title={`PDF Preview: ${originalFilename}`}
            onError={() => console.error('PDF iframe failed to load')}
          />
        )}
      </div>
    </div>
  );
};

export default SimplePDFViewer;
