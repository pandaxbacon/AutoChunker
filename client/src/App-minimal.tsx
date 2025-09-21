import React, { useState } from 'react';

function App() {
  const [markdown, setMarkdown] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('parser', 'pdfplumber');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setMarkdown(data.markdown);
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (error) {
      alert('Error: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple tree parser
  const parseToTree = (text: string) => {
    const lines = text.split('\n');
    const sections = [];
    let currentSection = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Detect headers (all caps lines)
      if (/^[A-Z\s]{5,50}$/.test(trimmed) && trimmed.length > 3) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = `📋 ${trimmed}\n`;
      } else if (trimmed) {
        currentSection += line + '\n';
      }
    }
    
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return sections;
  };

  const sections = markdown ? parseToTree(markdown) : [];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          🌲 AutoChunker - Working Version
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">📤 Upload Document</h2>
            
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.docx,.pptx,.txt,.md"
              className="w-full p-3 border border-gray-300 rounded"
              disabled={isLoading}
            />
            
            {isLoading && (
              <div className="mt-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Processing with pdfplumber...</p>
              </div>
            )}
            
            {markdown && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 font-medium">
                  ✅ Document processed successfully!
                </p>
                <p className="text-sm text-green-600">
                  Found {sections.length} sections, {markdown.split(' ').length} words
                </p>
              </div>
            )}
          </div>

          {/* Sections */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">📋 Document Sections</h2>
            
            {sections.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-auto">
                {sections.map((section, index) => {
                  const lines = section.split('\n');
                  const title = lines[0] || `Section ${index + 1}`;
                  const content = lines.slice(1).join('\n').trim();
                  const wordCount = content.split(' ').length;
                  
                  return (
                    <div key={index} className="border border-gray-200 rounded p-3 hover:bg-gray-50">
                      <div className="font-medium text-gray-900 mb-1">
                        {title}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {wordCount} words • ~{Math.ceil(wordCount / 4)} tokens
                      </div>
                      <div className="text-sm text-gray-600 line-clamp-3">
                        {content.substring(0, 150)}...
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Upload a document to see sections</p>
              </div>
            )}
          </div>
        </div>

        {/* Raw Output */}
        {markdown && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">📝 Raw Markdown Output</h2>
            <textarea
              value={markdown}
              readOnly
              className="w-full h-64 p-3 border border-gray-300 rounded font-mono text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
