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
      const formData = new FormData();
      formData.append('document', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      
      setProcessingState({
        isUploading: false,
        isProcessing: false,
        error: null,
        success: true
      });

      onFileProcessed(data.markdown, data.originalName);
    } catch (error) {
      setProcessingState({
        isUploading: false,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Upload failed',
        success: false
      });
    }
  }, [onFileProcessed, processingState, setProcessingState]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-300'}
          ${processingState.isUploading ? 'opacity-50 pointer-events-none' : 'hover:border-primary-400 hover:bg-gray-50'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          id="file-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".pdf,.docx,.pptx,.txt,.md"
          onChange={handleFileInput}
          disabled={processingState.isUploading}
        />
        
        <div className="space-y-4">
          {processingState.isUploading ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="text-sm text-gray-600">Processing document...</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <Upload className="h-12 w-12 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drop your document here, or click to browse
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supports PDF, DOCX, PPTX, TXT, and MD files (max 50MB)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {processingState.error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-800">{processingState.error}</p>
          </div>
        </div>
      )}

      {processingState.success && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <File className="h-5 w-5 text-green-400 mr-2" />
            <p className="text-sm text-green-800">Document processed successfully!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
