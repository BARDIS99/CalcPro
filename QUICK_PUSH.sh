#!/bin/bash
# CalcPro - Quick GitHub Push Script
# Run this script to push your app to GitHub

set -e

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║          CalcPro - GitHub Push Helper Script                    ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "index.html" ]; then
    echo "❌ Error: Please run this script from the calcpro directory"
    exit 1
fi

echo "✅ In correct directory: $(pwd)"
echo ""

# Check git status
echo "📊 Checking git status..."
git status --short
echo ""

# Check if authenticated
echo "🔐 Checking GitHub authentication..."
if gh auth status &> /dev/null; then
    echo "✅ Already authenticated with GitHub!"
    echo ""
    
    # Ask if they want to create repo
    echo "Ready to create repository and push?"
    echo ""
    echo "This will run:"
    echo "  gh repo create calcpro --public --source=. --remote=origin --push"
    echo ""
    read -p "Continue? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "🚀 Creating repository and pushing..."
        gh repo create calcpro --public --source=. --remote=origin --push
        
        echo ""
        echo "════════════════════════════════════════════════════════════════"
        echo "✅ SUCCESS! Your code is on GitHub!"
        echo "════════════════════════════════════════════════════════════════"
        echo ""
        echo "📍 View your repository:"
        echo "   gh repo view --web"
        echo ""
        echo "🌐 Repository URL:"
        gh repo view --json url -q .url 2>/dev/null || echo "   https://github.com/YOUR_USERNAME/calcpro"
        echo ""
    else
        echo "Cancelled."
        exit 0
    fi
else
    echo "❌ Not authenticated with GitHub"
    echo ""
    echo "Please run first:"
    echo "  gh auth login"
    echo ""
    echo "Then run this script again."
    exit 1
fi
