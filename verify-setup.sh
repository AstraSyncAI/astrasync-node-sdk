#!/bin/bash
# Verify everything before publishing
echo "✅ Verifying AstraSync SDK Setup"
echo "================================"
echo ""

# 1. Check login
echo "1️⃣ NPM Authentication:"
CURRENT_USER=$(npm whoami)
echo "   Logged in as: $CURRENT_USER"
if [ "$CURRENT_USER" == "tim.astrasync" ]; then
    echo "   ✅ Correct user!"
else
    echo "   ⚠️  WARNING: Expected tim.astrasync"
fi
echo ""

# 2. Check if package exists (it shouldn't yet)
echo "2️⃣ Package Status:"
npm view @astrasyncai/sdk version 2>/dev/null
if [ $? -eq 0 ]; then
    echo "   ⚠️  Package already exists on npm"
else
    echo "   ✅ Package not yet published (expected)"
fi
echo ""

# 3. Verify build works
echo "3️⃣ Build Status:"
if [ -d "dist" ]; then
    echo "   ✅ dist/ directory exists"
    echo "   Files: $(find dist -name "*.js" | wc -l) JavaScript files"
else
    echo "   ❌ No dist/ directory - run: npm run build"
fi
echo ""

# 4. Check package.json
echo "4️⃣ Package Configuration:"
PACKAGE_NAME=$(node -p "require('./package.json').name")
PACKAGE_VERSION=$(node -p "require('./package.json').version")
echo "   Name: $PACKAGE_NAME"
echo "   Version: $PACKAGE_VERSION"
echo ""

# 5. Dry run test
echo "5️⃣ Publish Dry Run:"
echo "   Running: npm publish --dry-run --access public"
echo ""
npm publish --dry-run --access public 2>&1 | grep -E "(notice|error)" | head -20
echo ""

echo "================================"
echo "📋 READY TO PUBLISH?"
echo "================================"
echo ""
echo "If everything looks good above, publish with:"
echo ""
echo "  npm publish --access public"
echo ""
echo "Or use the helper script:"
echo "  ./publish-helper.sh"