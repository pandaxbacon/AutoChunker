#!/bin/bash

# Document Hierarchy Tree Editor Setup Script
echo "🌲 Setting up Document Hierarchy Tree Editor..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 16+ and try again.${NC}"
    exit 1
fi

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed. Please install Python 3 and try again.${NC}"
    exit 1
fi

# Check if pip is installed
if ! command -v pip &> /dev/null && ! command -v pip3 &> /dev/null; then
    echo -e "${RED}❌ pip is not installed. Please install pip and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Install Python dependencies in virtual environment
echo -e "${YELLOW}📦 Creating Python virtual environment...${NC}"
python3 -m venv venv

echo -e "${YELLOW}📦 Installing Python dependencies...${NC}"
source venv/bin/activate && pip install 'markitdown[all]'

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install Python dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Python dependencies installed${NC}"

# Install Node.js dependencies
echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
npm install
cd server && npm install
cd ../client && npm install
cd ..

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install Node.js dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js dependencies installed${NC}"

# Create uploads directory
mkdir -p server/uploads

echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo -e "${YELLOW}To start the application:${NC}"
echo "  npm run dev"
echo ""
echo -e "${YELLOW}Then open your browser to:${NC}"
echo "  http://localhost:3000"
echo ""
echo -e "${YELLOW}For production build:${NC}"
echo "  npm run build"
echo "  npm start"
