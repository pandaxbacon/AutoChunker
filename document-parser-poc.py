#!/usr/bin/env python3
"""
Document Parser POC - Test different libraries for document extraction
Compare output quality from various PDF/document parsing libraries
"""

import os
import sys
import argparse
from pathlib import Path

def test_markitdown(file_path):
    """Test Microsoft MarkItDown library"""
    try:
        from markitdown import MarkItDown
        md = MarkItDown()
        result = md.convert(file_path)
        return {
            'library': 'MarkItDown (Microsoft)',
            'content': result.text_content,
            'success': True,
            'notes': 'Official Microsoft library, good for Office docs'
        }
    except Exception as e:
        return {
            'library': 'MarkItDown (Microsoft)',
            'content': None,
            'success': False,
            'error': str(e),
            'notes': 'Install: pip install markitdown[all]'
        }

def test_pymupdf(file_path):
    """Test PyMuPDF (fitz) library"""
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(file_path)
        text = ""
        for page_num in range(doc.page_count):
            page = doc[page_num]
            text += f"\n--- Page {page_num + 1} ---\n"
            text += page.get_text()
        doc.close()
        
        return {
            'library': 'PyMuPDF (fitz)',
            'content': text,
            'success': True,
            'notes': 'Fast, good text extraction, preserves layout'
        }
    except Exception as e:
        return {
            'library': 'PyMuPDF (fitz)',
            'content': None,
            'success': False,
            'error': str(e),
            'notes': 'Install: pip install PyMuPDF'
        }

def test_pdfplumber(file_path):
    """Test pdfplumber library"""
    try:
        import pdfplumber
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for i, page in enumerate(pdf.pages):
                text += f"\n--- Page {i + 1} ---\n"
                page_text = page.extract_text()
                if page_text:
                    text += page_text
                
                # Also try to extract tables
                tables = page.extract_tables()
                if tables:
                    text += f"\n[TABLES FOUND: {len(tables)}]\n"
                    for j, table in enumerate(tables):
                        text += f"\nTable {j+1}:\n"
                        for row in table:
                            text += " | ".join([cell or "" for cell in row]) + "\n"
        
        return {
            'library': 'pdfplumber',
            'content': text,
            'success': True,
            'notes': 'Excellent for tables and structured data'
        }
    except Exception as e:
        return {
            'library': 'pdfplumber',
            'content': None,
            'success': False,
            'error': str(e),
            'notes': 'Install: pip install pdfplumber'
        }

def test_pdfminer(file_path):
    """Test pdfminer library"""
    try:
        from pdfminer.high_level import extract_text
        text = extract_text(file_path)
        
        return {
            'library': 'pdfminer.six',
            'content': text,
            'success': True,
            'notes': 'Pure Python, good for complex layouts'
        }
    except Exception as e:
        return {
            'library': 'pdfminer.six',
            'content': None,
            'success': False,
            'error': str(e),
            'notes': 'Install: pip install pdfminer.six'
        }

def test_pypdf(file_path):
    """Test PyPDF library"""
    try:
        from pypdf import PdfReader
        reader = PdfReader(file_path)
        text = ""
        
        for i, page in enumerate(reader.pages):
            text += f"\n--- Page {i + 1} ---\n"
            text += page.extract_text()
        
        return {
            'library': 'PyPDF',
            'content': text,
            'success': True,
            'notes': 'Lightweight, good for simple PDFs'
        }
    except Exception as e:
        return {
            'library': 'PyPDF',
            'content': None,
            'success': False,
            'error': str(e),
            'notes': 'Install: pip install pypdf'
        }

def test_unstructured(file_path):
    """Test Unstructured library"""
    try:
        from unstructured.partition.auto import partition
        elements = partition(filename=file_path)
        
        text = ""
        for element in elements:
            text += str(element) + "\n"
        
        return {
            'library': 'Unstructured',
            'content': text,
            'success': True,
            'notes': 'AI-powered, excellent structure detection'
        }
    except Exception as e:
        return {
            'library': 'Unstructured',
            'content': None,
            'success': False,
            'error': str(e),
            'notes': 'Install: pip install unstructured[all-docs]'
        }

def analyze_content_quality(content, library_name):
    """Analyze the quality of extracted content"""
    if not content:
        return {
            'word_count': 0,
            'line_count': 0,
            'has_structure': False,
            'quality_score': 0
        }
    
    lines = content.split('\n')
    words = content.split()
    
    # Look for structural elements
    has_headers = any(line.strip().isupper() and len(line.strip()) > 3 for line in lines)
    has_bullets = '•' in content or '*' in content or '-' in content
    has_numbers = any(char.isdigit() for char in content)
    has_formatting = '**' in content or '__' in content or '#' in content
    
    # Calculate quality score
    quality_score = 0
    if len(words) > 50:
        quality_score += 30
    if has_headers:
        quality_score += 25
    if has_bullets:
        quality_score += 15
    if has_numbers:
        quality_score += 15
    if has_formatting:
        quality_score += 15
    
    return {
        'word_count': len(words),
        'line_count': len([l for l in lines if l.strip()]),
        'has_headers': has_headers,
        'has_bullets': has_bullets,
        'has_formatting': has_formatting,
        'quality_score': min(quality_score, 100)
    }

def main():
    parser = argparse.ArgumentParser(description='Test different document parsing libraries')
    parser.add_argument('file_path', help='Path to the document to test')
    parser.add_argument('--output-dir', default='./parser_outputs', 
                       help='Directory to save output files')
    parser.add_argument('--libraries', nargs='+', 
                       choices=['markitdown', 'pymupdf', 'pdfplumber', 'pdfminer', 'pypdf', 'unstructured'],
                       default=['markitdown', 'pymupdf', 'pdfplumber', 'pdfminer', 'pypdf'],
                       help='Libraries to test')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.file_path):
        print(f"Error: File {args.file_path} not found")
        sys.exit(1)
    
    # Create output directory
    output_dir = Path(args.output_dir)
    output_dir.mkdir(exist_ok=True)
    
    print(f"🔍 Testing document parsing libraries on: {args.file_path}")
    print("=" * 80)
    
    # Test functions mapping
    test_functions = {
        'markitdown': test_markitdown,
        'pymupdf': test_pymupdf,
        'pdfplumber': test_pdfplumber,
        'pdfminer': test_pdfminer,
        'pypdf': test_pypdf,
        'unstructured': test_unstructured,
    }
    
    results = []
    
    for lib_name in args.libraries:
        print(f"\n📚 Testing {lib_name.upper()}...")
        
        test_func = test_functions[lib_name]
        result = test_func(args.file_path)
        
        if result['success']:
            # Analyze content quality
            analysis = analyze_content_quality(result['content'], result['library'])
            result['analysis'] = analysis
            
            # Save output to file
            output_file = output_dir / f"{lib_name}_output.txt"
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(f"Library: {result['library']}\n")
                f.write(f"Notes: {result['notes']}\n")
                f.write("=" * 50 + "\n\n")
                f.write(result['content'])
            
            print(f"✅ {result['library']}")
            print(f"   📊 Words: {analysis['word_count']}, Lines: {analysis['line_count']}")
            print(f"   🎯 Quality Score: {analysis['quality_score']}/100")
            print(f"   📁 Output saved to: {output_file}")
            
        else:
            print(f"❌ {result['library']}: {result['error']}")
            print(f"   💡 {result['notes']}")
        
        results.append(result)
    
    # Summary report
    print("\n" + "=" * 80)
    print("📊 SUMMARY REPORT")
    print("=" * 80)
    
    successful_results = [r for r in results if r['success']]
    if successful_results:
        # Sort by quality score
        successful_results.sort(key=lambda x: x.get('analysis', {}).get('quality_score', 0), reverse=True)
        
        print(f"{'Rank':<4} {'Library':<20} {'Words':<8} {'Lines':<8} {'Quality':<8} {'Notes'}")
        print("-" * 80)
        
        for i, result in enumerate(successful_results, 1):
            analysis = result.get('analysis', {})
            print(f"{i:<4} {result['library']:<20} {analysis.get('word_count', 0):<8} "
                  f"{analysis.get('line_count', 0):<8} {analysis.get('quality_score', 0):<8} "
                  f"{result['notes'][:30]}...")
    
    print(f"\n💡 All outputs saved to: {output_dir}")
    print("\n🔍 Compare the output files to choose the best library for your use case!")

if __name__ == "__main__":
    main()
