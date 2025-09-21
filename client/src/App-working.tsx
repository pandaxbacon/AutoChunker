import React, { useState } from 'react';
import { Upload, FileText } from 'lucide-react';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setIsProcessing(true);
    setError('');
    setResult('');

    try {
      const formData = new FormData();
      formData.append('document', uploadedFile);
      formData.append('parser', 'pdfplumber');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setResult(`✅ Success! Processed ${uploadedFile.name} with ${data.parser}
      
📄 Extracted ${data.markdown.length} characters
🔤 Word count: ~${data.markdown.split(' ').length}
📝 Line count: ${data.markdown.split('\n').length}

📋 First 500 characters:
${data.markdown.substring(0, 500)}...`);
      
    } catch (err) {
      setError(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🌲 AutoChunker - Document Parser Test
          </h1>
          <p className="text-lg text-gray-600">
            Upload documents and test different parsing libraries
          </p>
        </div>

        {/* File Upload */}
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors mb-6"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            type="file"
            onChange={handleFileInput}
            accept=".pdf,.docx,.pptx,.txt,.md"
            className="hidden"
            id="file-input"
          />
          <label htmlFor="file-input" className="cursor-pointer">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900">
              Drop your document here, or click to browse
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports PDF, DOCX, PPTX, TXT, and MD files
            </p>
          </label>
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-800">Processing {file?.name}...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <pre className="text-red-800 text-sm">{error}</pre>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <FileText className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-medium text-green-800">Processing Complete</span>
            </div>
            <pre className="text-green-800 text-sm whitespace-pre-wrap font-mono">{result}</pre>
          </div>
        )}

        {/* Status */}
        <div className="mt-8 text-center">
          <div className="flex justify-center space-x-8 text-sm text-gray-600">
            <div>Backend: ✅ Running</div>
            <div>Parser: 🔧 pdfplumber (default)</div>
            <div>Frontend: ✅ Working</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
