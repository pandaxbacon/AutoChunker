#!/bin/bash

# Simple local startup script
echo "🪓 Starting Lumberjack locally..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create uploads directory if it doesn't exist
mkdir -p server/uploads

# Start backend server
echo -e "${YELLOW}🔧 Starting backend server on http://localhost:3001...${NC}"
cd server
node index.js &
SERVER_PID=$!
cd ..

# Wait a moment for server to start
sleep 2

# Test if server is running
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo -e "${GREEN}✅ Backend server is running${NC}"
else
    echo -e "${RED}❌ Backend server failed to start${NC}"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Start frontend server
echo -e "${YELLOW}🔧 Starting frontend server on http://localhost:3000...${NC}"
cd client
npm run dev &
CLIENT_PID=$!
cd ..

echo -e "${GREEN}🎉 Application started!${NC}"
echo ""
echo -e "${YELLOW}Frontend:${NC} http://localhost:3000"
echo -e "${YELLOW}Backend:${NC}  http://localhost:3001"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping servers...${NC}"
    kill $SERVER_PID 2>/dev/null
    kill $CLIENT_PID 2>/dev/null
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Wait for background processes
wait
