import React, { useState } from 'react';
import { FileText, AlertCircle } from 'lucide-react';

interface MarkdownInputProps {
  onMarkdownProcessed: (markdown: string, filename: string) => void;
}

const MarkdownInput: React.FC<MarkdownInputProps> = ({ onMarkdownProcessed }) => {
  const [markdown, setMarkdown] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async () => {
    if (!markdown.trim()) {
      setError('Please enter some Markdown content');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/markdown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markdown: markdown.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Processing failed');
      }

      const data = await response.json();
      onMarkdownProcessed(data.markdown, 'Pasted Markdown');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      
      setMarkdown(markdown.substring(0, start) + '  ' + markdown.substring(end));
      
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className="flex items-center space-x-2">
        <FileText className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-medium text-gray-900">
          Or paste your Markdown directly
        </h3>
      </div>
      
      <div className="space-y-4">
        <textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste your Markdown content here...

Example:
# Chapter 1: Introduction
This is the introduction content...

## Section 1.1: Overview  
This is a subsection...

# Chapter 2: Main Content
More content here..."
          className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
          disabled={isProcessing}
        />
        
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            {markdown.length} characters
          </p>
          
          <button
            onClick={handleProcess}
            disabled={!markdown.trim() || isProcessing}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </div>
            ) : (
              'Process Markdown'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkdownInput;
