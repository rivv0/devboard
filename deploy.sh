#!/bin/bash

echo "🚀 DevBoard Deployment Helper"
echo "=============================="
echo ""

# Check if .env files exist
if [ ! -f backend/.env ]; then
    echo "❌ backend/.env not found!"
    echo "Create backend/.env with:"
    echo "  MONGODB_URI=your_mongodb_uri"
    echo "  GITHUB_CLIENT_ID=your_client_id"
    echo "  GITHUB_CLIENT_SECRET=your_client_secret"
    echo "  OAUTH_CALLBACK_URL=your_callback_url"
    exit 1
fi

echo "✅ Environment files found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo ""

echo "Installing backend dependencies..."
cd backend && npm install
cd ..

echo "Installing frontend dependencies..."
cd frontend && npm install
cd ..

echo ""
echo "✅ Dependencies installed"
echo ""

# Build frontend
echo "🏗️  Building frontend..."
cd frontend && npm run build
cd ..

echo ""
echo "✅ Frontend built successfully"
echo ""

echo "=============================="
echo "✨ Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Deploy backend to Railway/Render"
echo "2. Deploy frontend to Vercel"
echo "3. Update environment variables"
echo "4. Test your deployment"
echo ""
echo "See DEPLOYMENT_GUIDE.md for detailed instructions"
