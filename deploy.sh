#!/bin/bash

# Lumberjack - Deployment Selector
# Choose between Firebase Cloud or Local Self-Hosted deployment

set -e

echo "🪓 Lumberjack - Document Hierarchy Tree Editor"
echo "=============================================="
echo ""
echo "Choose your deployment method:"
echo ""
echo "1) 🔥 Firebase Cloud (Scalable, requires Blaze plan)"
echo "   - Serverless Firebase Functions (Python)"
echo "   - Firebase Storage for file uploads"
echo "   - Firebase Hosting for web app"
echo "   - Automatic scaling and CDN"
echo "   - Cost: ~$1-5/month for moderate usage"
echo ""
echo "2) 🏠 Local Self-Hosted (No credentials required)"
echo "   - Runs entirely on your server/computer"
echo "   - Node.js backend with Python parsers"
echo "   - Docker support for easy deployment"
echo "   - No external dependencies or costs"
echo ""

read -p "Enter your choice (1 or 2): " -n 1 -r
echo ""
echo ""

case $REPLY in
    1)
        echo "🔥 Starting Firebase Cloud deployment..."
        echo ""
        cd deployments/firebase-cloud
        ./deploy.sh
        ;;
    2)
        echo "🏠 Starting Local Self-Hosted deployment..."
        echo ""
        cd deployments/local-selfhosted
        ./start.sh
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again and choose 1 or 2."
        exit 1
        ;;
esac