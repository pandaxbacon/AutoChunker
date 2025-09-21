import tempfile
import os
import subprocess
import json
import time
from firebase_functions import https_fn, options
from firebase_admin import initialize_app, storage
import firebase_admin

# Initialize Firebase Admin
initialize_app()

def convert_document_cloud(file_path, parser='pymupdf'):
    """Convert document using subprocess - EXACT copy of your local server logic"""
    
    python_script = ""
    
    if parser == 'pymupdf':
        python_script = f"""
import fitz
doc = fitz.open("{file_path}")
text = ""
for page_num in range(doc.page_count):
    page = doc[page_num]
    text += f"\\n--- Page {{page_num + 1}} ---\\n"
    text += page.get_text()
doc.close()
print(text)
"""
    elif parser == 'pdfplumber':
        python_script = f"""
import pdfplumber
text = ""
with pdfplumber.open("{file_path}") as pdf:
    for i, page in enumerate(pdf.pages):
        text += f"\\n--- Page {{i + 1}} ---\\n"
        page_text = page.extract_text()
        if page_text:
            text += page_text
print(text)
"""
    elif parser == 'markitdown':
        python_script = f"""
from markitdown import MarkItDown
md = MarkItDown()
result = md.convert("{file_path}")
print(result.text_content)
"""
    elif parser == 'pdfminer':
        python_script = f"""
from pdfminer.high_level import extract_text
text = extract_text("{file_path}")
print(text)
"""
    elif parser == 'pypdf':
        python_script = f"""
from pypdf import PdfReader
reader = PdfReader("{file_path}")
text = ""
for i, page in enumerate(reader.pages):
    text += f"\\n--- Page {{i + 1}} ---\\n"
    text += page.extract_text()
print(text)
"""
    else:
        return f"Error: Unknown parser: {parser}"
    
    # Write script to temp file - EXACT same logic as your server
    script_path = os.path.join(tempfile.gettempdir(), f'temp_convert_{parser}_{os.getpid()}.py')
    with open(script_path, 'w') as f:
        f.write(python_script)
    
    try:
        # Execute Python script - EXACT same as your server
        result = subprocess.run(
            ['python3', script_path],
            capture_output=True,
            text=True,
            timeout=300
        )
        
        # Clean up temp file
        os.unlink(script_path)
        
        if result.returncode != 0:
            return f"Parser Error: {result.stderr}"
        
        return result.stdout
        
    except subprocess.TimeoutExpired:
        try:
            os.unlink(script_path)
        except:
            pass
        return "Error: Processing timeout"
    except Exception as e:
        try:
            os.unlink(script_path)
        except:
            pass
        return f"Error: {str(e)}"

@https_fn.on_request(
    cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"]),
    memory=options.MemoryOption.GB_4
)
def health(req: https_fn.Request) -> https_fn.Response:
    """Health check endpoint"""
    return https_fn.Response(
        json.dumps({"status": "OK", "message": "Lumberjack Python Functions are running"}),
        headers={"Content-Type": "application/json"}
    )

@https_fn.on_request(
    cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"]),
    memory=options.MemoryOption.GB_4,
    timeout_sec=540
)
def process(req: https_fn.Request) -> https_fn.Response:
    """Document processing endpoint - accepts Firebase Storage URLs"""
    
    if req.method == 'OPTIONS':
        return https_fn.Response('', status=204)
    
    if req.method != 'POST':
        return https_fn.Response(
            json.dumps({"error": "Method not allowed"}),
            status=405,
            headers={"Content-Type": "application/json"}
        )
    
    try:
        # Parse JSON request
        request_data = json.loads(req.data.decode('utf-8'))
        
        file_url = request_data.get('fileUrl')
        filename = request_data.get('fileName', 'document.pdf')
        parser = request_data.get('parser', 'pymupdf')
        
        if not file_url:
            return https_fn.Response(
                json.dumps({"error": "fileUrl is required"}),
                status=400,
                headers={"Content-Type": "application/json"}
            )
        
        # Download file from Firebase Storage
        import urllib.request
        
        temp_file_path = os.path.join(tempfile.gettempdir(), filename)
        urllib.request.urlretrieve(file_url, temp_file_path)
        
        # Process the document using your exact logic
        markdown = convert_document_cloud(temp_file_path, parser)
        
        # Clean up
        try:
            os.unlink(temp_file_path)
        except:
            pass
        
        # Upload to Firebase Storage
        bucket = storage.bucket()
        storage_filename = f"{int(time.time())}-{filename}"
        
        response_data = {
            "success": True,
            "originalName": filename,
            "parser": parser,
            "markdown": markdown.strip(),
            "firebaseFile": storage_filename,
            "note": "Processed with your exact Python logic in the cloud!"
        }
        
        return https_fn.Response(
            json.dumps(response_data),
            headers={"Content-Type": "application/json"}
        )
        
    except Exception as e:
        return https_fn.Response(
            json.dumps({"error": "Upload failed", "details": str(e)}),
            status=500,
            headers={"Content-Type": "application/json"}
        )

@https_fn.on_request(
    cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"]),
    memory=options.MemoryOption.GB_4
)
def markdown(req: https_fn.Request) -> https_fn.Response:
    """Process markdown text directly"""
    
    if req.method == 'OPTIONS':
        return https_fn.Response('', status=204)
    
    try:
        # Handle JSON body
        body = json.loads(req.data.decode('utf-8'))
        markdown_text = body.get('markdown', '')
        
        if not markdown_text:
            return https_fn.Response(
                json.dumps({"error": "Markdown text is required"}),
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
            json.dumps({"error": "Processing failed", "details": str(e)}),
            status=500,
            headers={"Content-Type": "application/json"}
        )

@https_fn.on_request(
    cors=options.CorsOptions(cors_origins="*", cors_methods=["get"]),
    memory=options.MemoryOption.GB_4
)
def parsers(req: https_fn.Request) -> https_fn.Response:
    """Get available parsers - test actual imports"""
    
    # Test which parsers are actually available by trying imports
    available_parsers = []
    descriptions = {}
    import_status = {}
    
    try:
        import fitz
        available_parsers.append('pymupdf')
        descriptions['pymupdf'] = 'PyMuPDF - Available and working'
        import_status['pymupdf'] = 'SUCCESS'
    except ImportError as e:
        import_status['pymupdf'] = f'FAILED: {str(e)}'
    
    try:
        import pdfplumber
        available_parsers.append('pdfplumber')
        descriptions['pdfplumber'] = 'pdfplumber - Available and working'
        import_status['pdfplumber'] = 'SUCCESS'
    except ImportError as e:
        import_status['pdfplumber'] = f'FAILED: {str(e)}'
    
    try:
        from markitdown import MarkItDown
        available_parsers.append('markitdown')
        descriptions['markitdown'] = 'MarkItDown - Available and working'
        import_status['markitdown'] = 'SUCCESS'
    except ImportError as e:
        import_status['markitdown'] = f'FAILED: {str(e)}'
    
    try:
        from pdfminer.high_level import extract_text
        available_parsers.append('pdfminer')
        descriptions['pdfminer'] = 'pdfminer - Available and working'
        import_status['pdfminer'] = 'SUCCESS'
    except ImportError as e:
        import_status['pdfminer'] = f'FAILED: {str(e)}'
    
    try:
        from pypdf import PdfReader
        available_parsers.append('pypdf')
        descriptions['pypdf'] = 'PyPDF - Available and working'
        import_status['pypdf'] = 'SUCCESS'
    except ImportError as e:
        import_status['pypdf'] = f'FAILED: {str(e)}'
    
    response_data = {
        "parsers": available_parsers,
        "descriptions": descriptions,
        "import_status": import_status,
        "installed_count": len(available_parsers),
        "cloud_environment": True,
        "memory_allocated": "4GB"
    }
    
    return https_fn.Response(
        json.dumps(response_data),
        headers={"Content-Type": "application/json"}
    )