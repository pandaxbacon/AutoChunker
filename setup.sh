#!/bin/bash

# Lumberjack Setup Script
echo "🪓 Setting up Lumberjack Document Parser..."

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

# Setup Firebase credentials
echo -e "${YELLOW}🔐 Setting up Firebase credentials...${NC}"
if [ ! -f "client/.env" ]; then
    if [ -f "client/env.example" ]; then
        cp client/env.example client/.env
        echo -e "${YELLOW}⚠️  Please edit client/.env with your Firebase credentials${NC}"
    else
        echo -e "${RED}❌ env.example not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Firebase credentials already configured${NC}"
fi

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
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Edit client/.env with your Firebase credentials"
echo "2. For local development: ./start-local.sh"
echo "3. For production deployment: ./deploy.sh"
echo ""
echo -e "${YELLOW}Live demo:${NC} https://lumberjack-23104.web.app"
