# 🪓 Lumberjack - Document Hierarchy Tree Editor

> Transform your documents into perfectly structured, AI-ready chunks with our intelligent document parser and interactive tree editor.

![Hero Demo](screenshots/hero-demo.png)

## ✨ Features

- **🔄 Multiple Document Formats**: Support for PDF, DOCX, PPTX, TXT, and MD files with Firebase Storage
- **🤖 5 AI-Powered Parsers**: Choose from MarkItDown, PyMuPDF, pdfplumber, pdfminer.six, and PyPDF
- **☁️ Cloud Processing**: Files uploaded to Firebase Storage and processed in Firebase Functions
- **🌳 Interactive Tree Editor**: Visualize and edit document hierarchy with expand/collapse
- **🎯 Smart Chunking**: Configurable token-based chunking with overlap support for vector databases
- **📊 Real-time Analytics**: Token counting, word counts, and document statistics
- **🎨 Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- **🚀 Production Ready**: Fully deployed on Firebase with Functions and Hosting

## 🎯 Perfect for

- **AI/ML Engineers** preparing documents for vector databases
- **Content Managers** organizing large document collections  
- **Researchers** structuring academic papers and reports
- **Developers** building RAG (Retrieval Augmented Generation) systems

## 🚀 Live Demo

**Try it now:** [https://lumberjack-23104.web.app](https://lumberjack-23104.web.app)

## 📸 Screenshots

### Document Upload & Parser Selection
![File Upload](screenshots/file-upload.png)
*Choose from 5 different document parsers optimized for different content types*

![Parser Selection](screenshots/parser-selection.png)
*Each parser has unique strengths for different document structures*

### Interactive Document Hierarchy
![Tree Hierarchy](screenshots/tree-hierarchy.png)
*Navigate through your document structure with an intuitive tree interface*

### Content Editing & Preview
![Markdown Preview](screenshots/markdown-preview.png)
*Edit content directly with real-time token counting and markdown preview*

### Smart Chunking & Export
![Chunk Export](screenshots/chunk-export.png)
*Export perfectly sized chunks for your vector database or AI system*

### Mobile Responsive Design
![Mobile View](screenshots/mobile-responsive.png)
*Works beautifully on all devices with responsive design*

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript for robust component architecture
- **Vite** for lightning-fast development and optimized builds
- **Tailwind CSS** for beautiful, responsive styling
- **Firebase SDK** for seamless cloud integration
- **Lucide React** for crisp, modern icons

### Backend
- **Firebase Functions** with Python runtime for document processing
- **5 Document Parsers**: MarkItDown, PyMuPDF, pdfplumber, pdfminer.six, PyPDF
- **Firebase Storage** for secure, scalable file uploads
- **Node.js** with Express (for local development)

### Cloud Infrastructure
- **Firebase Hosting** for global CDN delivery
- **Firebase Functions** for serverless document processing
- **Firebase Storage** for secure file management
- **Automatic scaling** and **99.9% uptime** SLA

## 🏃‍♂️ Quick Start

### Option 1: Use the Live Demo
1. Visit [https://lumberjack-23104.web.app](https://lumberjack-23104.web.app)
2. Upload your document or paste markdown content
3. Choose your preferred parser
4. Edit and export your structured content

### Option 2: Run Locally

```bash
# Clone the repository
git clone https://github.com/pandaxbacon/AutoChunker.git
cd AutoChunker

# Automated setup (recommended)
./setup.sh

# Manual setup
cp client/env.example client/.env
# Edit client/.env with your Firebase credentials
npm install
cd server && npm install
cd ../client && npm install
cd ..

# Start development servers
./start-local.sh
```

## 📋 Prerequisites

- **Node.js** 16+ for the frontend
- **Python 3** for document parsing (handled automatically in cloud)
- **Firebase Project** with Storage and Functions enabled

## 🔧 Configuration

### Environment Variables

Copy `client/env.example` to `client/.env` and configure:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Storage, Functions, and Hosting
3. Install Firebase CLI: `npm install -g firebase-tools`
4. Login: `firebase login`

## 🚀 Deployment

```bash
# Deploy everything (hosting + functions + storage rules)
./deploy.sh

# Or deploy individually
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only storage
```

## 📊 Parser Comparison

| Parser | Speed | Structure | Tables | Images | Best For |
|--------|-------|-----------|--------|---------|----------|
| **PyMuPDF** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | General purpose, fast processing |
| **pdfplumber** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | Complex layouts, tables |
| **MarkItDown** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | Microsoft documents |
| **PyPDF** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | Lightweight, simple PDFs |
| **pdfminer** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | Complex layouts, research papers |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- **Documentation**: Check our [Wiki](https://github.com/pandaxbacon/AutoChunker/wiki)
- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/pandaxbacon/AutoChunker/issues)
- **Discussions**: Join our [GitHub Discussions](https://github.com/pandaxbacon/AutoChunker/discussions)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=pandaxbacon/AutoChunker&type=Date)](https://star-history.com/#pandaxbacon/AutoChunker&Date)

---

<div align="center">

**Built with ❤️ by developers, for developers**

[Live Demo](https://lumberjack-23104.web.app) • [Documentation](https://github.com/pandaxbacon/AutoChunker/wiki) • [Report Bug](https://github.com/pandaxbacon/AutoChunker/issues) • [Request Feature](https://github.com/pandaxbacon/AutoChunker/issues)

</div>
