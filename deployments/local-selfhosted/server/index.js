const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const { PARSERS, convertDocument, getParserRecommendation, compareParser } = require('./document-parsers');

const app = express();
const PORT = process.env.PORT || 3001;
const execAsync = util.promisify(exec);

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.pptx', '.txt', '.md'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Supported types: PDF, DOCX, PPTX, TXT, MD'));
    }
  }
});

// Helper function to convert file to markdown using MarkItDown
async function convertToMarkdown(filePath) {
  try {
    // Use Python to run markitdown
    const pythonScript = `
import sys
from markitdown import MarkItDown

md = MarkItDown()
result = md.convert("${filePath.replace(/\\/g, '\\\\')}")
print(result.text_content)
`;
    
    // Write Python script to temp file
    const tempScriptPath = path.join(__dirname, 'temp_convert.py');
    await fs.writeFile(tempScriptPath, pythonScript);
    
    // Execute Python script using the virtual environment
    const venvPython = path.join(__dirname, '..', 'venv', 'bin', 'python');
    const { stdout, stderr } = await execAsync(`"${venvPython}" "${tempScriptPath}"`);
    
    // Clean up temp file
    await fs.remove(tempScriptPath);
    
    if (stderr && !stdout) {
      throw new Error(`MarkItDown error: ${stderr}`);
    }
    
    return stdout;
  } catch (error) {
    console.error('Error converting to markdown:', error);
    throw error;
  }
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Document Hierarchy Server is running' });
});

app.post('/api/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const parser = req.body.parser || PARSERS.PYMUPDF; // Use PyMuPDF as default for best performance
    
    console.log(`Processing file: ${originalName} with ${parser}`);
    
    // Convert to markdown using selected parser
    const markdown = await convertDocument(filePath, parser);
    
    // Get parser recommendation
    const recommendation = getParserRecommendation(originalName);
    
    // For PDF files, keep a copy for preview (copy to a predictable location)
    let pdfPreviewPath = null;
    if (originalName.toLowerCase().endsWith('.pdf')) {
      const previewDir = path.join(__dirname, 'pdf_previews');
      await fs.ensureDir(previewDir);
      pdfPreviewPath = path.join(previewDir, originalName);
      await fs.copy(filePath, pdfPreviewPath);
    }
    
    // Clean up uploaded file
    await fs.remove(filePath);
    
    res.json({
      success: true,
      originalName,
      parser: parser,
      markdown: markdown.trim(),
      recommendation
    });
    
  } catch (error) {
    console.error('Upload/conversion error:', error);
    
    // Clean up file if it exists
    if (req.file?.path) {
      try {
        await fs.remove(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to process document', 
      details: error.message 
    });
  }
});

// Route to accept markdown text directly
app.post('/api/markdown', (req, res) => {
  try {
    const { markdown } = req.body;
    
    if (!markdown || typeof markdown !== 'string') {
      return res.status(400).json({ error: 'Markdown text is required' });
    }
    
    res.json({
      success: true,
      markdown: markdown.trim()
    });
    
  } catch (error) {
    console.error('Markdown processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process markdown', 
      details: error.message 
    });
  }
});

// Route to get available parsers
app.get('/api/parsers', (req, res) => {
  res.json({
    parsers: Object.values(PARSERS),
    descriptions: {
      [PARSERS.MARKITDOWN]: 'Microsoft MarkItDown - Best overall, supports many formats',
      [PARSERS.PYMUPDF]: 'PyMuPDF - Fastest, excellent structure preservation',
      [PARSERS.PDFPLUMBER]: 'pdfplumber - Best for tables and structured data',
      [PARSERS.PDFMINER]: 'pdfminer.six - Pure Python, good for complex layouts',
      [PARSERS.PYPDF]: 'PyPDF - Lightweight, good for simple PDFs'
    }
  });
});

// Route to serve PDF files for preview
app.get('/api/pdf/:filename', async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    
    // Look for the PDF in multiple locations
    const possiblePaths = [
      path.join(__dirname, 'pdf_previews', filename), // Uploaded PDFs
      path.join(__dirname, '..', filename), // Project root
      path.join(__dirname, 'uploads', filename) // Temp uploads
    ];
    
    let pdfPath = null;
    for (const testPath of possiblePaths) {
      if (await fs.pathExists(testPath)) {
        pdfPath = testPath;
        break;
      }
    }
    
    if (!pdfPath) {
      console.log(`PDF not found: ${filename}. Searched paths:`, possiblePaths);
      return res.status(404).json({ error: 'PDF file not found for preview' });
    }
    
    console.log(`Serving PDF: ${pdfPath}`);
    
    // Set proper headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Stream the PDF file
    const fileStream = require('fs').createReadStream(pdfPath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('PDF serve error:', error);
    res.status(500).json({ error: 'Failed to serve PDF' });
  }
});

// Route to compare parsers on a document
app.post('/api/compare', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const parsersToTest = req.body.parsers ? 
      req.body.parsers.split(',') : 
      [PARSERS.MARKITDOWN, PARSERS.PYMUPDF, PARSERS.PDFPLUMBER];
    
    console.log(`Comparing parsers for: ${originalName}`);
    
    // Compare parsers
    const results = await compareParser(filePath, parsersToTest);
    
    // Clean up uploaded file
    await fs.remove(filePath);
    
    res.json({
      success: true,
      originalName,
      comparison: results
    });
    
  } catch (error) {
    console.error('Parser comparison error:', error);
    
    // Clean up file if it exists
    if (req.file?.path) {
      try {
        await fs.remove(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to compare parsers', 
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
    }
  }
  
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Make sure you have Python 3 and markitdown installed:');
  console.log('pip install markitdown');
});
