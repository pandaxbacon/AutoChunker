#!/bin/bash

# Lumberjack - Local Self-Hosted Version Startup Script
# No Firebase credentials required!

set -e

echo "🪓 Starting Lumberjack - Local Self-Hosted Version"
echo "================================================="

# Check if Docker is available
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "🐳 Docker detected - Starting with Docker Compose..."
    echo ""
    
    # Build and start with Docker
    docker-compose up --build -d
    
    echo ""
    echo "✅ Lumberjack is starting up!"
    echo "🌐 Web Interface: http://localhost:3001"
    echo "🔍 API Health: http://localhost:3001/api/health"
    echo ""
    echo "📋 To view logs: docker-compose logs -f"
    echo "🛑 To stop: docker-compose down"
    
elif command -v node &> /dev/null && command -v python3 &> /dev/null; then
    echo "⚡ Starting in development mode..."
    echo ""
    
    # Install Python dependencies
    echo "📦 Installing Python dependencies..."
    cd server
    if [ ! -f "requirements_installed.flag" ]; then
        python3 -m pip install -r requirements.txt
        touch requirements_installed.flag
        echo "✅ Python dependencies installed"
    else
        echo "✅ Python dependencies already installed"
    fi
    cd ..
    
    # Install Node.js dependencies for client
    echo "📦 Installing client dependencies..."
    cd client
    if [ ! -d "node_modules" ]; then
        npm install
        echo "✅ Client dependencies installed"
    else
        echo "✅ Client dependencies already installed"
    fi
    
    # Build client
    echo "🔨 Building client..."
    npm run build
    echo "✅ Client built successfully"
    cd ..
    
    # Install Node.js dependencies for server
    echo "📦 Installing server dependencies..."
    cd server
    if [ ! -d "node_modules" ]; then
        npm install
        echo "✅ Server dependencies installed"
    else
        echo "✅ Server dependencies already installed"
    fi
    
    # Start the server
    echo ""
    echo "🚀 Starting Lumberjack server..."
    echo "🌐 Web Interface: http://localhost:3001"
    echo "🔍 API Health: http://localhost:3001/api/health"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    
    node index.js
    
else
    echo "❌ Error: Missing dependencies"
    echo ""
    echo "Please install one of the following:"
    echo ""
    echo "Option 1 - Docker (Recommended):"
    echo "  - Docker: https://docs.docker.com/get-docker/"
    echo "  - Docker Compose: https://docs.docker.com/compose/install/"
    echo ""
    echo "Option 2 - Manual Installation:"
    echo "  - Node.js 18+: https://nodejs.org/"
    echo "  - Python 3.8+: https://python.org/"
    echo ""
    exit 1
fi
