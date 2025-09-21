/**
 * Document Parser Library Switcher
 * Easy way to switch between different PDF parsing libraries
 */

const { exec } = require('child_process');
const util = require('util');
const path = require('path');
const fs = require('fs-extra');

const execAsync = util.promisify(exec);

// Available parsers
const PARSERS = {
    MARKITDOWN: 'markitdown',
    PYMUPDF: 'pymupdf', 
    PDFPLUMBER: 'pdfplumber',
    PDFMINER: 'pdfminer',
    PYPDF: 'pypdf'
};

/**
 * Convert document using specified parser
 */
async function convertDocument(filePath, parser = PARSERS.MARKITDOWN) {
    const venvPython = path.join(__dirname, '..', 'venv', 'bin', 'python');
    
    let pythonScript = '';
    
    switch (parser) {
        case PARSERS.MARKITDOWN:
            pythonScript = `
from markitdown import MarkItDown
md = MarkItDown()
result = md.convert("${filePath.replace(/\\/g, '\\\\')}")
print(result.text_content)
`;
            break;
            
        case PARSERS.PYMUPDF:
            pythonScript = `
import fitz
doc = fitz.open("${filePath.replace(/\\/g, '\\\\')}")
text = ""
for page_num in range(doc.page_count):
    page = doc[page_num]
    text += f"\\n--- Page {page_num + 1} ---\\n"
    text += page.get_text()
doc.close()
print(text)
`;
            break;
            
        case PARSERS.PDFPLUMBER:
            pythonScript = `
import pdfplumber
text = ""
with pdfplumber.open("${filePath.replace(/\\/g, '\\\\')}") as pdf:
    for i, page in enumerate(pdf.pages):
        text += f"\\n--- Page {i + 1} ---\\n"
        page_text = page.extract_text()
        if page_text:
            text += page_text
print(text)
`;
            break;
            
        case PARSERS.PDFMINER:
            pythonScript = `
from pdfminer.high_level import extract_text
text = extract_text("${filePath.replace(/\\/g, '\\\\')}")
print(text)
`;
            break;
            
        case PARSERS.PYPDF:
            pythonScript = `
from pypdf import PdfReader
reader = PdfReader("${filePath.replace(/\\/g, '\\\\')}")
text = ""
for i, page in enumerate(reader.pages):
    text += f"\\n--- Page {i + 1} ---\\n"
    text += page.extract_text()
print(text)
`;
            break;
            
        default:
            throw new Error(`Unknown parser: ${parser}`);
    }
    
    // Write Python script to temp file
    const tempScriptPath = path.join(__dirname, `temp_convert_${parser}.py`);
    await fs.writeFile(tempScriptPath, pythonScript);
    
    try {
        // Execute Python script
        const { stdout, stderr } = await execAsync(`"${venvPython}" "${tempScriptPath}"`);
        
        // Clean up temp file
        await fs.remove(tempScriptPath);
        
        if (stderr && !stdout) {
            throw new Error(`Parser error: ${stderr}`);
        }
        
        return stdout;
    } catch (error) {
        // Clean up temp file on error
        try {
            await fs.remove(tempScriptPath);
        } catch (cleanupError) {
            console.error('Error cleaning up temp file:', cleanupError);
        }
        throw error;
    }
}

/**
 * Get parser recommendations based on document type
 */
function getParserRecommendation(filename) {
    const ext = path.extname(filename).toLowerCase();
    
    const recommendations = {
        '.pdf': {
            best_structure: PARSERS.PYMUPDF,
            best_tables: PARSERS.PDFPLUMBER,
            fastest: PARSERS.PYPDF,
            most_reliable: PARSERS.MARKITDOWN
        },
        '.docx': {
            best: PARSERS.MARKITDOWN
        },
        '.pptx': {
            best: PARSERS.MARKITDOWN
        }
    };
    
    return recommendations[ext] || { best: PARSERS.MARKITDOWN };
}

/**
 * Test multiple parsers and return comparison
 */
async function compareParser(filePath, parsers = [PARSERS.MARKITDOWN, PARSERS.PYMUPDF, PARSERS.PDFPLUMBER]) {
    const results = [];
    
    for (const parser of parsers) {
        try {
            console.log(`Testing ${parser}...`);
            const startTime = Date.now();
            const content = await convertDocument(filePath, parser);
            const endTime = Date.now();
            
            results.push({
                parser,
                success: true,
                content,
                processingTime: endTime - startTime,
                wordCount: content.split(/\s+/).length,
                lineCount: content.split('\n').length
            });
        } catch (error) {
            results.push({
                parser,
                success: false,
                error: error.message
            });
        }
    }
    
    return results;
}

module.exports = {
    PARSERS,
    convertDocument,
    getParserRecommendation,
    compareParser
};
