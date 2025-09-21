import React, { useCallback, useState } from 'react';
import { Upload, File, AlertCircle } from 'lucide-react';
import { ProcessingState } from '../types';

interface FileUploadProps {
  onFileProcessed: (markdown: string, filename: string) => void;
  processingState: ProcessingState;
  setProcessingState: (state: ProcessingState) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileProcessed, 
  processingState, 
  setProcessingState 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedParser, setSelectedParser] = useState('pymupdf');

  const handleFiles = useCallback(async (files: FileList) => {
    if (files.length === 0) return;
    
    const file = files[0];
    const allowedTypes = ['.pdf', '.docx', '.pptx', '.txt', '.md'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      setProcessingState({
        ...processingState,
        error: 'Invalid file type. Supported types: PDF, DOCX, PPTX, TXT, MD'
      });
      return;
    }

    setProcessingState({
      isUploading: true,
      isProcessing: false,
      error: null,
      success: false
    });

    try {
      // Create FormData for file upload (traditional multipart upload)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('parser', selectedParser);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      if (result.success && result.markdown) {
        onFileProcessed(result.markdown, result.originalName || file.name);
        setProcessingState({
          isUploading: false,
          isProcessing: false,
          error: null,
          success: true
        });
      } else {
        throw new Error(result.error || 'Failed to process document');
      }

    } catch (error) {
      console.error('Upload error:', error);
      setProcessingState({
        isUploading: false,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Upload failed',
        success: false
      });
    }
  }, [selectedParser, onFileProcessed, processingState, setProcessingState]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Upload Document
        </h2>
        <p className="text-gray-600 mb-6">
          Convert your documents to hierarchical markdown for AI processing
        </p>
      </div>

      {/* Parser Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Document Parser
        </label>
        <select
          value={selectedParser}
          onChange={(e) => setSelectedParser(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          disabled={processingState.isUploading || processingState.isProcessing}
        >
          <option value="pymupdf">PyMuPDF (Recommended for PDFs)</option>
          <option value="pdfplumber">pdfplumber (Good for tables)</option>
          <option value="markitdown">MarkItDown (Multi-format support)</option>
          <option value="pdfminer">pdfminer (Text extraction)</option>
          <option value="pypdf">PyPDF (Simple parsing)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          PyMuPDF is recommended for most PDF documents
        </p>
      </div>

      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-primary-400 bg-primary-50'
            : processingState.error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-primary-400'
        }`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".pdf,.docx,.pptx,.txt,.md"
          onChange={handleFileSelect}
          disabled={processingState.isUploading || processingState.isProcessing}
        />
        
        <div className="space-y-4">
          {processingState.isUploading || processingState.isProcessing ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-sm text-gray-600">
                {processingState.isUploading ? 'Uploading file...' : 'Processing document...'}
              </p>
            </div>
          ) : processingState.error ? (
            <div className="flex flex-col items-center text-red-600">
              <AlertCircle className="h-8 w-8" />
              <p className="mt-2 text-sm">{processingState.error}</p>
            </div>
          ) : processingState.success ? (
            <div className="flex flex-col items-center text-green-600">
              <File className="h-8 w-8" />
              <p className="mt-2 text-sm">Document processed successfully!</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                <span className="font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PDF, DOCX, PPTX, TXT, or MD files
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Local Self-Hosted Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Local Self-Hosted Version
            </h3>
            <div className="mt-1 text-sm text-blue-700">
              <p>
                This is the self-hosted version that runs entirely on your local machine. 
                No cloud services or credentials required!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;