# Document Hierarchy Tree Editor

A web application for uploading documents, converting them to Markdown, and creating an interactive hierarchy tree editor for optimal document chunking for vector databases.

## Features

- **Document Upload**: Support for PDF, DOCX, PPTX, TXT, and MD files
- **Markdown Conversion**: Uses Microsoft's MarkItDown library for document processing
- **Interactive Tree Editor**: Drag-and-drop interface for reorganizing document structure
- **Live Preview**: Real-time Markdown preview with section highlighting
- **Smart Chunking**: Configurable token-based chunking with overlap support
- **Multiple Export Formats**: JSON and Markdown export options
- **Responsive UI**: Modern, clean interface built with React and Tailwind CSS

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **react-dnd-treeview** for drag-and-drop tree editing
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **Microsoft MarkItDown** for document conversion
- **Multer** for file uploads

## Prerequisites

Before running this application, make sure you have:

1. **Node.js** (version 16 or higher)
2. **Python 3** (for MarkItDown)
3. **pip** (Python package manager)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AutoChunker
   ```

2. **Run the setup script** (handles everything automatically)
   ```bash
   ./setup.sh
   ```

   Or install manually:
   ```bash
   # Create Python virtual environment
   python3 -m venv venv
   source venv/bin/activate
   pip install markitdown
   
   # Install Node.js dependencies
   npm install
   cd server && npm install
   cd ../client && npm install
   ```

## Running the Application

### Easy Start (Recommended)

```bash
./start-local.sh
```

This will start both servers and open the application at `http://localhost:3000`

### Manual Start

Start backend:
```bash
cd server
node index.js
```

Start frontend (in a new terminal):
```bash
cd client
npm run dev
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend development server on `http://localhost:3000`

### Production Build

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Usage

1. **Upload Document**
   - Visit `http://localhost:3000`
   - Upload a document (PDF, DOCX, PPTX, TXT, or MD) or paste Markdown directly
   - The document will be automatically converted to Markdown

2. **Edit Hierarchy**
   - View the generated document hierarchy tree
   - Drag and drop sections to reorganize structure
   - Edit section titles by clicking the edit icon
   - Delete sections with the trash icon
   - Select sections to preview their content

3. **Export Chunks**
   - Configure chunking options (max tokens, overlap, etc.)
   - Preview the generated chunks
   - Export as JSON or Markdown format

## API Endpoints

### Backend API

- `GET /api/health` - Health check endpoint
- `POST /api/upload` - Upload document and convert to Markdown
- `POST /api/markdown` - Process raw Markdown text

## Configuration

### Chunking Options

- **Max Tokens per Chunk**: Maximum number of tokens per chunk (default: 1000)
- **Overlap Tokens**: Number of overlapping tokens between chunks (default: 100)
- **Preserve Headers**: Include section headers in chunks (default: true)
- **Include Metadata**: Include metadata in export (default: true)

### File Upload Limits

- Maximum file size: 50MB
- Supported formats: PDF, DOCX, PPTX, TXT, MD

## Project Structure

```
AutoChunker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── types.ts       # TypeScript types
│   │   ├── utils/         # Utility functions
│   │   └── App.tsx        # Main app component
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Node.js backend
│   ├── index.js           # Express server
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## Development

### Frontend Development

The frontend is built with React and Vite. Key components:

- `FileUpload`: Handles file upload and drag-and-drop
- `MarkdownInput`: Direct Markdown input interface
- `TreeEditor`: Interactive tree editing with drag-and-drop
- `MarkdownPreview`: Live preview of document content
- `ChunkExporter`: Chunk configuration and export

### Backend Development

The backend is a simple Express server that:

- Handles file uploads with Multer
- Converts documents using MarkItDown
- Serves the React app in production

### Adding New Features

1. **New Document Formats**: Add support in the backend by updating the file filter and MarkItDown integration
2. **Custom Chunking Strategies**: Extend the chunking logic in `utils/markdownParser.ts`
3. **Export Formats**: Add new export options in `ChunkExporter.tsx`

## Troubleshooting

### Common Issues

1. **MarkItDown not found**
   - Ensure Python 3 is installed
   - Install MarkItDown: `pip install markitdown`

2. **File upload fails**
   - Check file size (max 50MB)
   - Ensure file format is supported

3. **Tree editor not working**
   - Check browser console for JavaScript errors
   - Ensure all dependencies are installed

### Error Messages

- `"MarkItDown error"`: Python or MarkItDown installation issue
- `"File too large"`: File exceeds 50MB limit
- `"Invalid file type"`: Unsupported file format

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Microsoft MarkItDown for document conversion
- React DnD Treeview for the tree editing interface
- Tailwind CSS for styling
- Lucide React for icons
