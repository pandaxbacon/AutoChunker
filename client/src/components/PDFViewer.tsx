import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { TreeNode } from '../types';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText } from 'lucide-react';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  originalFilename: string;
  selectedNode?: TreeNode | null;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ originalFilename, selectedNode }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get PDF file URL - assuming it's available in the uploads folder
  const pdfUrl = `/api/pdf/${encodeURIComponent(originalFilename)}`;

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    setError('Failed to load PDF. PDF preview not available.');
    setIsLoading(false);
    console.error('PDF load error:', error);
  }, []);

  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(numPages, prev + 1));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(2.0, prev + 0.2));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.2));
  };

  // Try to determine which page contains the selected section
  const getEstimatedPage = (selectedNode: TreeNode): number => {
    if (!selectedNode) return 1;
    
    // Simple heuristic: look for page markers in the content
    const content = selectedNode.content || '';
    const pageMatch = content.match(/Page (\d+)/i);
    if (pageMatch) {
      return parseInt(pageMatch[1], 10);
    }
    
    // Fallback: estimate based on section position
    // This is a rough estimate - in a real app you'd track page positions
    return Math.min(currentPage, numPages);
  };

  React.useEffect(() => {
    if (selectedNode && numPages > 0) {
      const estimatedPage = getEstimatedPage(selectedNode);
      if (estimatedPage !== currentPage && estimatedPage <= numPages) {
        setCurrentPage(estimatedPage);
      }
    }
  }, [selectedNode, numPages, currentPage]);

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
            {/* Page Navigation */}
            <div className="flex items-center space-x-1">
              <button
                onClick={goToPrevPage}
                disabled={currentPage <= 1}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <span className="text-sm text-gray-600 min-w-[60px] text-center">
                {numPages > 0 ? `${currentPage} / ${numPages}` : '...'}
              </span>
              
              <button
                onClick={goToNextPage}
                disabled={currentPage >= numPages}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 border-l pl-2">
              <button
                onClick={zoomOut}
                className="p-1 hover:bg-gray-100 rounded"
                title="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              
              <span className="text-xs text-gray-500 min-w-[40px] text-center">
                {Math.round(scale * 100)}%
              </span>
              
              <button
                onClick={zoomIn}
                className="p-1 hover:bg-gray-100 rounded"
                title="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-grow overflow-auto bg-gray-100 p-4">
        <div className="flex justify-center">
          {isLoading && (
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
              <span>Loading PDF...</span>
            </div>
          )}
          
          {error && (
            <div className="text-center p-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{error}</p>
              <p className="text-sm text-gray-400 mt-2">
                PDF preview requires the original file to be accessible
              </p>
            </div>
          )}
          
          {!error && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center space-x-2 text-gray-600 justify-center py-8">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                    <span>Loading PDF...</span>
                  </div>
                }
                options={{
                  cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
                  cMapPacked: true,
                }}
              >
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="shadow-lg border border-gray-200"
                />
              </Document>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
