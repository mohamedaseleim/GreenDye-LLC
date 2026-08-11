#!/bin/bash

# GreenDye Academy Setup Script
# This script helps set up the development environment

set -e

echo "🌿 GreenDye Academy Setup Script"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm $(npm --version) detected"

# Check if MongoDB is running
if command -v mongod &> /dev/null; then
    echo "✅ MongoDB is installed"
else
    echo "⚠️  MongoDB not found. Please install MongoDB or use Docker:"
    echo "   docker run -d -p 27017:27017 --name mongodb mongo:latest"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install

# Copy environment file if not exists
if [ ! -f .env ]; then
    echo "Creating backend .env file..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your configuration"
fi

cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Edit backend/.env with your configuration"
echo "  2. Start MongoDB (if not running)"
echo "  3. Run 'npm run dev' from the root directory"
echo ""
echo "📚 For more information, see SETUP.md"
echo ""
