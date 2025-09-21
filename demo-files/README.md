# Demo Files

This directory contains sample PDF documents for testing the Lumberjack document parser.

## Files

- `wisdom-term-contract-english.pdf` - Insurance contract document with complex structure and definitions
- `IM80_brochure_en.pdf.coredownload.inline.pdf` - Product brochure with mixed content types

## Usage

These files can be used to test:
- Different parser libraries (PyMuPDF, pdfplumber, MarkItDown, etc.)
- Document structure analysis and hierarchy detection
- Chunking strategies for vector databases
- Firebase Storage upload and processing workflow

## Testing Locally

```bash
# Use these files with the local development server
npm run dev

# Or test with the deployed Firebase Functions
# Upload via https://lumberjack-23104.web.app
```
