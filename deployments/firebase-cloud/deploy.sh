#!/bin/bash

# Lumberjack - Firebase Cloud Deployment Script
# Requires Firebase project with Blaze plan

set -e

echo "🔥 Deploying Lumberjack to Firebase Cloud"
echo "=========================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found"
    echo "Please install: npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please login to Firebase..."
    firebase login
fi

# Check for environment variables
if [ ! -f "client/.env" ]; then
    echo "⚠️  Warning: client/.env not found"
    echo "Please copy client/env.example to client/.env and configure your Firebase credentials"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Build the client
echo "🔨 Building React client..."
cd client
npm run build
cd ..

echo "🚀 Deploying to Firebase..."
echo ""

# Deploy everything
firebase deploy

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your app is live at:"
firebase hosting:channel:list --json | grep -o '"url":"[^"]*' | grep -o 'https://[^"]*' | head -1
echo ""
echo "🔍 Function URLs:"
echo "https://$(firebase use --current)-default-rtdb.firebaseio.com/"
echo ""
echo "📊 View in Firebase Console:"
echo "https://console.firebase.google.com/project/$(firebase use --current)"