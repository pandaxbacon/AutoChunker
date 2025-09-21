# 🔥 Lumberjack - Firebase Cloud Version

This is the **Firebase Cloud version** of Lumberjack that leverages Google Firebase for scalable, serverless deployment.

## ✨ Features

- ☁️ **Serverless** - Firebase Functions with Python runtime
- 📁 **Cloud Storage** - Firebase Storage for file uploads
- 🌐 **Global CDN** - Firebase Hosting with worldwide distribution
- 📈 **Auto-scaling** - Handles traffic spikes automatically
- 🔒 **Secure** - Built-in Firebase security and authentication

## 💰 Cost & Requirements

### Required Plan
- **Firebase Blaze Plan** (Pay-as-you-go) - **REQUIRED**
- Free tier only supports Node.js functions, Python requires Blaze

### Typical Monthly Costs
- **Functions**: $0.50-2.00 (based on usage)
- **Storage**: $0.10-0.50 (1-5GB documents)
- **Hosting**: Free (generous limits)
- **Total**: ~$1-5/month for moderate usage

## 🔧 Setup Requirements

### 1. Firebase Project Setup
1. Visit [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing
3. **Upgrade to Blaze Plan** (Settings → Usage and billing)

### 2. Enable Services
- ✅ **Storage**: Firebase Console → Storage → "Get started"
- ✅ **Functions**: Will be enabled automatically
- ✅ **Hosting**: Firebase Console → Hosting → "Get started"

### 3. Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

## 🚀 Deployment

### Quick Deploy
```bash
# From project root
./deploy.sh
# Then choose option 1 (Firebase Cloud)
```

### Manual Deploy
```bash
cd deployments/firebase-cloud

# Configure environment variables
cp client/env.example client/.env
# Edit client/.env with your Firebase credentials

# Build and deploy
./deploy.sh
```

## ⚙️ Configuration

### Environment Variables

Create `client/.env`:
```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-ABC123DEF  # Optional
```

### Firebase Configuration Files

- `firebase.json` - Firebase project configuration
- `storage.rules` - Firebase Storage security rules
- `functions/main.py` - Python Cloud Functions
- `functions/requirements.txt` - Python dependencies

## 📊 API Endpoints

The deployed Firebase Functions provide these endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/parsers` | GET | List available parsers |
| `/markdown` | POST | Process markdown text |
| `/process` | POST | Process uploaded documents |

Example URLs:
```
https://us-central1-your-project.cloudfunctions.net/health
https://us-central1-your-project.cloudfunctions.net/process
```

## 📁 Project Structure

```
firebase-cloud/
├── client/                 # React frontend
│   ├── src/
│   ├── .env.example       # Environment variables template
│   └── package.json
├── functions/             # Python Cloud Functions
│   ├── main.py           # Function implementations
│   └── requirements.txt  # Python dependencies
├── firebase.json         # Firebase configuration
├── storage.rules        # Storage security rules
└── deploy.sh           # Deployment script
```

## 🔒 Security

### Storage Rules
File uploads are secured with Firebase Storage rules:
- Public read access for processed documents
- Write access with file size limits (50MB)
- File type validation (PDF, DOCX, PPTX, TXT, MD)

### Function Security
- CORS enabled for web access
- Input validation and sanitization
- Error handling and logging

## 🛠️ Development

### Local Testing
```bash
# Install dependencies
cd client && npm install
cd ../functions && pip install -r requirements.txt

# Start Firebase emulators
firebase emulators:start

# Start client development server
cd client && npm run dev
```

### Function Debugging
```bash
# View function logs
firebase functions:log

# Deploy only functions
firebase deploy --only functions

# Deploy only hosting
firebase deploy --only hosting
```

## 📊 Monitoring

### Firebase Console
- **Functions**: Monitor invocations, errors, and performance
- **Storage**: Track uploads and storage usage
- **Hosting**: View traffic and performance metrics

### Logs
```bash
# View all logs
firebase functions:log

# Follow logs in real-time
firebase functions:log --only process

# View specific function logs
firebase functions:log --only health
```

## 🐛 Troubleshooting

### Common Issues

**"Billing account required":**
- Upgrade to Blaze Plan in Firebase Console
- Python functions require paid plan

**Function deployment fails:**
- Check Python dependencies in requirements.txt
- Verify Firebase CLI is logged in: `firebase login`

**CORS errors:**
- Check function CORS configuration in main.py
- Verify domain is whitelisted

**Storage upload fails:**
- Check storage.rules permissions
- Verify Firebase config in client/.env

### Debug Commands
```bash
# Check Firebase project
firebase projects:list
firebase use --add

# Test function locally
firebase functions:shell

# Validate configuration
firebase projects:list
firebase functions:config:get
```

## 🤝 Support

- 📖 [Main Documentation](../../README.md)
- 🔥 [Firebase Documentation](https://firebase.google.com/docs)
- 🐛 [Report Issues](https://github.com/pandaxbacon/AutoChunker/issues)

---

**🔥 Firebase Cloud** • **☁️ Serverless** • **📈 Scalable** • **🌐 Global**
