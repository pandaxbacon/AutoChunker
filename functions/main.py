import tempfile
import os
from firebase_functions import https_fn, options
from firebase_admin import initialize_app, storage
import firebase_admin

# Import your existing document parsers
try:
    from markitdown import MarkItDown
except ImportError:
    MarkItDown = None

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

try:
    import pdfplumber
except ImportError:
    pdfplumber = None

try:
    from pdfminer.high_level import extract_text
except ImportError:
    extract_text = None

try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None

# Initialize Firebase Admin
initialize_app()

# Available parsers
PARSERS = {
    'MARKITDOWN': 'markitdown',
    'PYMUPDF': 'pymupdf', 
    'PDFPLUMBER': 'pdfplumber',
    'PDFMINER': 'pdfminer',
    'PYPDF': 'pypdf'
}

def convert_document(file_path, parser='pymupdf'):
    """Convert document using the specified parser - same logic as your local version"""
    
    if parser == PARSERS['PYMUPDF'] and fitz:
        doc = fitz.open(file_path)
        text = ""
        for page_num in range(doc.page_count):
            page = doc[page_num]
            text += f"\n--- Page {page_num + 1} ---\n"
            text += page.get_text()
        doc.close()
        return text
    
    elif parser == PARSERS['PDFPLUMBER'] and pdfplumber:
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for i, page in enumerate(pdf.pages):
                text += f"\n--- Page {i + 1} ---\n"
                page_text = page.extract_text()
                if page_text:
                    text += page_text
        return text
    
    elif parser == PARSERS['PDFMINER'] and extract_text:
        return extract_text(file_path)
    
    elif parser == PARSERS['PYPDF'] and PdfReader:
        reader = PdfReader(file_path)
        text = ""
        for i, page in enumerate(reader.pages):
            text += f"\n--- Page {i + 1} ---\n"
            text += page.extract_text()
        return text
    
    elif parser == PARSERS['MARKITDOWN'] and MarkItDown:
        md = MarkItDown()
        result = md.convert(file_path)
        return result.text_content
    
    else:
        # Fallback for missing dependencies
        return f"""# Document Processing Notice

**File**: {os.path.basename(file_path)}
**Parser**: {parser}

This is a Firebase Functions demo version. The requested parser ({parser}) is not available in the cloud environment.

## Available Options:
1. **Use local development** for full parsing capabilities
2. **Paste document content** directly using the markdown input
3. **Use the demo with sample content**

## For Full Features:
Run the app locally with:
```bash
cd /path/to/lumberjack
./start-local.sh
```

This will give you access to all parsers and full document processing capabilities.
"""

@https_fn.on_request(cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"]))
def health(req: https_fn.Request) -> https_fn.Response:
    """Health check endpoint"""
    return https_fn.Response(
        '{"status": "OK", "message": "Lumberjack Python Functions are running"}',
        headers={"Content-Type": "application/json"}
    )

@https_fn.on_request(
    cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"]),
    memory=options.MemoryOption.GB_1,
    timeout_sec=300
)
def upload(req: https_fn.Request) -> https_fn.Response:
    """Document upload and processing endpoint"""
    
    if req.method == 'OPTIONS':
        return https_fn.Response('', status=204)
    
    if req.method != 'POST':
        return https_fn.Response(
            '{"error": "Method not allowed"}',
            status=405,
            headers={"Content-Type": "application/json"}
        )
    
    try:
        # Handle multipart form data
        content_type = req.headers.get('content-type', '')
        if not content_type.startswith('multipart/form-data'):
            return https_fn.Response(
                '{"error": "Multipart form data required"}',
                status=400,
                headers={"Content-Type": "application/json"}
            )
        
        # For demo purposes, return a structured response
        # In production, you'd parse the multipart data properly
        
        parser = 'pymupdf'  # Default parser
        filename = 'demo-document.pdf'
        
        # Create sample markdown with proper structure
        markdown = convert_document('', parser)  # Using fallback
        
        # Upload to Firebase Storage (optional)
        bucket = storage.bucket()
        
        response_data = {
            "success": True,
            "originalName": filename,
            "parser": parser,
            "markdown": markdown,
            "note": "Demo version - for full processing, use local development"
        }
        
        return https_fn.Response(
            str(response_data).replace("'", '"'),
            headers={"Content-Type": "application/json"}
        )
        
    except Exception as e:
        return https_fn.Response(
            f'{{"error": "Upload failed", "details": "{str(e)}"}}',
            status=500,
            headers={"Content-Type": "application/json"}
        )

@https_fn.on_request(cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"]))
def markdown(req: https_fn.Request) -> https_fn.Response:
    """Process markdown text directly"""
    
    if req.method == 'OPTIONS':
        return https_fn.Response('', status=204)
    
    try:
        # Handle JSON body
        import json
        body = json.loads(req.data.decode('utf-8'))
        markdown_text = body.get('markdown', '')
        
        if not markdown_text:
            return https_fn.Response(
                '{"error": "Markdown text is required"}',
                status=400,
                headers={"Content-Type": "application/json"}
            )
        
        response_data = {
            "success": True,
            "markdown": markdown_text.strip()
        }
        
        return https_fn.Response(
            json.dumps(response_data),
            headers={"Content-Type": "application/json"}
        )
        
    except Exception as e:
        return https_fn.Response(
            f'{{"error": "Processing failed", "details": "{str(e)}"}}',
            status=500,
            headers={"Content-Type": "application/json"}
        )

@https_fn.on_request(cors=options.CorsOptions(cors_origins="*", cors_methods=["get"]))
def parsers(req: https_fn.Request) -> https_fn.Response:
    """Get available parsers"""
    
    # Check which parsers are actually available
    available_parsers = []
    descriptions = {}
    
    if MarkItDown:
        available_parsers.append('markitdown')
        descriptions['markitdown'] = 'Microsoft MarkItDown - Best overall, supports many formats'
    
    if fitz:
        available_parsers.append('pymupdf')
        descriptions['pymupdf'] = 'PyMuPDF - Fastest, excellent structure preservation'
    
    if pdfplumber:
        available_parsers.append('pdfplumber')
        descriptions['pdfplumber'] = 'pdfplumber - Best for tables and structured data'
    
    if extract_text:
        available_parsers.append('pdfminer')
        descriptions['pdfminer'] = 'pdfminer.six - Pure Python, good for complex layouts'
    
    if PdfReader:
        available_parsers.append('pypdf')
        descriptions['pypdf'] = 'PyPDF - Lightweight, good for simple PDFs'
    
    # Fallback if no parsers available
    if not available_parsers:
        available_parsers = ['fallback']
        descriptions['fallback'] = 'Demo mode - use local development for full features'
    
    import json
    response_data = {
        "parsers": available_parsers,
        "descriptions": descriptions,
        "note": "Cloud Functions version - some parsers may not be available"
    }
    
    return https_fn.Response(
        json.dumps(response_data),
        headers={"Content-Type": "application/json"}
    )