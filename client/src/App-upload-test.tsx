import React, { useState } from 'react';

function App() {
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setResult('');

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
        // Count sections by looking for common patterns
        const lines = data.markdown.split('\n');
        const sections = lines.filter(line => {
          const trimmed = line.trim();
          return /^[A-Z\s]{5,50}$/.test(trimmed) && trimmed.length > 3;
        });

        setResult(`✅ SUCCESS!
        
📄 File: ${data.originalName}
🔧 Parser: ${data.parser}
📊 Content: ${data.markdown.length} characters
📝 Lines: ${data.markdown.split('\n').length}
🔤 Words: ~${data.markdown.split(' ').length}
📋 Sections found: ${sections.length}

🎯 First few sections:
${sections.slice(0, 5).map(s => `• ${s}`).join('\n')}

📝 First 300 characters:
${data.markdown.substring(0, 300)}...`);
      } else {
        setResult(`❌ FAILED: ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ ERROR: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🌲 AutoChunker - Upload Test</h1>
      <p>Test document upload and parsing</p>
      
      <div style={{ margin: '20px 0' }}>
        <input
          type="file"
          onChange={handleFileUpload}
          accept=".pdf,.docx,.pptx,.txt,.md"
          disabled={isLoading}
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      {isLoading && (
        <div style={{ padding: '20px', backgroundColor: '#e3f2fd', border: '1px solid #1976d2', borderRadius: '4px', margin: '20px 0' }}>
          ⏳ Processing document...
        </div>
      )}

      {result && (
        <div style={{ 
          padding: '20px', 
          backgroundColor: result.includes('SUCCESS') ? '#e8f5e8' : '#ffebee', 
          border: `1px solid ${result.includes('SUCCESS') ? '#4caf50' : '#f44336'}`, 
          borderRadius: '4px',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          {result}
        </div>
      )}
    </div>
  );
}

export default App;
