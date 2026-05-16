#!/bin/bash
# Quick setup script for local development

echo "🚀 ShopNest Ecommerce - Local Development Setup"
echo "================================================"

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14+"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"

# Backend setup
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -eq 0 ]; then
    echo "✓ Backend dependencies installed"
else
    echo "❌ Backend installation failed"
    exit 1
fi

# Frontend setup
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -eq 0 ]; then
    echo "✓ Frontend dependencies installed"
else
    echo "❌ Frontend installation failed"
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update environment variables:"
echo "   - backend/.env.local"
echo "   - frontend/.env.local"
echo ""
echo "2. Start the backend:"
echo "   cd backend && npm run dev"
echo ""
echo "3. Start the frontend (in another terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "🔐 Security reminder:"
echo "   - Backend runs on port 5000 (private)"
echo "   - Frontend runs on port 3000"
echo "   - All API calls from frontend proxy through secure routes"
echo ""
