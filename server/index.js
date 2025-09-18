const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

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
    
    console.log(`Processing file: ${originalName}`);
    
    // Convert to markdown
    const markdown = await convertToMarkdown(filePath);
    
    // Clean up uploaded file
    await fs.remove(filePath);
    
    res.json({
      success: true,
      originalName,
      markdown: markdown.trim()
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
