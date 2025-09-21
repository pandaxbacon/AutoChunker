# 🏠 Lumberjack - Local Self-Hosted Version

This is the **local self-hosted version** of Lumberjack that runs entirely on your own server or computer. **No Firebase credentials or cloud services required!**

## ✨ Features

- 🚀 **Zero Configuration** - No API keys or credentials needed
- 🔒 **Complete Privacy** - All processing happens locally
- 📦 **Docker Support** - One-command deployment
- 🆓 **No Costs** - No monthly fees or usage charges
- 🛠️ **Full Control** - Customize and modify as needed

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Start with Docker Compose
./start.sh

# Or manually:
docker-compose up --build -d
```

### Option 2: Manual Installation

```bash
# Install dependencies
npm install  # In both client/ and server/ directories
pip install -r server/requirements.txt

# Build and start
./start.sh
```

## 📋 Requirements

### Docker Deployment
- Docker 20.0+
- Docker Compose 2.0+

### Manual Deployment
- Node.js 18+
- Python 3.8+
- npm or yarn

## 🌐 Access

Once started, access the application at:
- **Web Interface**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## 📁 Project Structure

```
local-selfhosted/
├── client/                 # React frontend
│   ├── src/
│   ├── package.json
│   └── ...
├── server/                 # Node.js backend
│   ├── index.js
│   ├── document-parsers.js
│   ├── package.json
│   └── requirements.txt    # Python dependencies
├── docker-compose.yml      # Docker setup
├── Dockerfile
├── nginx.conf             # Optional reverse proxy
└── start.sh              # Startup script
```

## 🔧 Configuration

### Environment Variables

The local version uses minimal configuration:

```bash
# Optional environment variables
PORT=3001                   # Server port (default: 3001)
NODE_ENV=production        # Environment mode
```

### Docker Configuration

Customize `docker-compose.yml`:

```yaml
services:
  lumberjack:
    ports:
      - "3001:3001"        # Change external port here
    volumes:
      - ./uploads:/app/server/uploads  # Persistent file storage
```

## 🛠️ Development

### Local Development

```bash
# Install dependencies
cd client && npm install
cd ../server && npm install && pip install -r requirements.txt

# Start development servers
cd client && npm run dev     # Frontend on :3000
cd server && npm run dev     # Backend on :3001
```

### Production Deployment

```bash
# Build for production
cd client && npm run build

# Start production server
cd server && npm start
```

## 📊 Supported Parsers

- **PyMuPDF** - Best for PDFs (recommended)
- **pdfplumber** - Good for tables and structured data
- **MarkItDown** - Multi-format support (PDF, DOCX, PPTX)
- **pdfminer.six** - Text extraction focused
- **PyPDF** - Simple and fast

## 🔒 Security

### Production Security

For production deployment, consider:

1. **Reverse Proxy**: Use nginx (included config)
2. **HTTPS**: Add SSL certificates
3. **Rate Limiting**: Configure in nginx.conf
4. **File Upload Limits**: Adjust in server/index.js

### Docker Security

```bash
# Run with non-root user
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Change port in docker-compose.yml or:
PORT=3002 ./start.sh
```

**Python dependencies fail:**
```bash
# Install system dependencies (Ubuntu/Debian):
sudo apt-get update
sudo apt-get install python3-dev gcc g++ make libffi-dev
```

**Docker build fails:**
```bash
# Clean rebuild:
docker-compose down
docker system prune -a
docker-compose up --build
```

### Logs

```bash
# Docker logs
docker-compose logs -f

# Manual logs
tail -f server/app.log
```

## 🤝 Support

- 📖 [Main Documentation](../../README.md)
- 🐛 [Report Issues](https://github.com/pandaxbacon/AutoChunker/issues)
- 💬 [Discussions](https://github.com/pandaxbacon/AutoChunker/discussions)

---

**🏠 Local Self-Hosted** • **🔒 Private** • **🆓 Free** • **🚀 Fast**
