#!/bin/bash

# Simple Firebase deployment script for Lumberjack
echo "🪓 Deploying Lumberjack to Firebase..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI not found. Please install it first:${NC}"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Build the client
echo -e "${YELLOW}📦 Building React client...${NC}"
cd client
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

cd ..

# Deploy to Firebase
echo -e "${YELLOW}🚀 Deploying to Firebase...${NC}"
firebase deploy --only hosting,storage,functions

if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 Deployment successful!${NC}"
    echo ""
    echo -e "${YELLOW}Your Lumberjack app is now live at:${NC}"
    firebase hosting:channel:open live
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi
