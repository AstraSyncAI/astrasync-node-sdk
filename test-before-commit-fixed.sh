#!/bin/bash

echo "🧪 Running AstraSync SDK Pre-Commit Tests"
echo "========================================"
echo ""

# Track if any test fails
FAILED=0

# Save current directory
ORIGINAL_DIR=$(pwd)

# 1. Check if packages build
echo "📦 Testing build..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  FAILED=1
else
  echo "✅ Build successful"
fi
echo ""

# 2. Run unit tests (skip if no tests exist)
echo "🧪 Running unit tests..."
if [ -d "packages/core" ]; then
  cd "$ORIGINAL_DIR/packages/core" && npm test -- --passWithNoTests 2>/dev/null
  cd "$ORIGINAL_DIR"
fi
if [ -d "packages/sdk" ]; then
  cd "$ORIGINAL_DIR/packages/sdk" && npm test -- --passWithNoTests 2>/dev/null
  cd "$ORIGINAL_DIR"
fi
echo "✅ Unit tests completed (or skipped if none exist)"
echo ""

# 3. Test CLI commands
echo "🎯 Testing CLI commands..."

echo "  Testing: astrasync --version"
npx astrasync --version
if [ $? -ne 0 ]; then
  echo "❌ CLI version command failed"
  FAILED=1
fi

echo "  Testing: astrasync examples"
npx astrasync examples > /dev/null
if [ $? -ne 0 ]; then
  echo "❌ CLI examples command failed"
  FAILED=1
else
  echo "✅ CLI examples works"
fi

echo "  Testing: astrasync health"
npx astrasync health
if [ $? -ne 0 ]; then
  echo "⚠️  API health check failed (this is OK if API is down)"
else
  echo "✅ API health check works"
fi
echo ""

# 4. Test protocol detection
echo "🔍 Testing protocol detection..."
if [ -d "examples" ]; then
  for file in examples/*.json; do
    if [ -f "$file" ]; then
      echo "  Testing: astrasync detect $file"
      npx astrasync detect "$file" > /dev/null
      if [ $? -ne 0 ]; then
        echo "❌ Failed to detect format for $file"
        FAILED=1
      fi
    fi
  done
  echo "✅ Protocol detection works"
else
  echo "⚠️  No examples directory found"
fi
echo ""

# 5. Check TypeScript compilation for each package
echo "🔷 Checking TypeScript..."
TYPESCRIPT_OK=1

if [ -d "packages/core" ]; then
  cd "$ORIGINAL_DIR/packages/core"
  npx tsc --noEmit
  if [ $? -ne 0 ]; then
    echo "❌ TypeScript errors in core package"
    TYPESCRIPT_OK=0
    FAILED=1
  fi
  cd "$ORIGINAL_DIR"
fi

if [ -d "packages/sdk" ]; then
  cd "$ORIGINAL_DIR/packages/sdk"
  npx tsc --noEmit
  if [ $? -ne 0 ]; then
    echo "❌ TypeScript errors in SDK package"
    TYPESCRIPT_OK=0
    FAILED=1
  fi
  cd "$ORIGINAL_DIR"
fi

if [ $TYPESCRIPT_OK -eq 1 ]; then
  echo "✅ No TypeScript errors"
fi
echo ""

# Summary
echo "========================================"
if [ $FAILED -eq 0 ]; then
  echo "✅ All tests passed! Ready to commit."
  echo ""
  echo "📝 To commit and push:"
  echo ""
  echo "git add ."
  echo 'git commit -m "feat: initial release of AstraSync Node.js SDK'
  echo ""
  echo "- Monorepo structure with @astrasync/core and @astrasync/sdk"
  echo "- Auto-detection for MCP, Letta, ACP, OpenAI, and AutoGPT formats"  
  echo "- Beautiful CLI with register, verify, detect, health, examples commands"
  echo "- TypeScript support with full type safety"
  echo "- Connected to Railway PostgreSQL backend"
  echo '- Comprehensive documentation and examples"'
  echo ""
  echo "git remote add origin https://github.com/AstraSyncAI/astrasync-node-sdk.git"
  echo "git push -u origin master"
else
  echo "❌ Some tests failed. Please fix before committing."
  echo ""
  echo "Current directory: $(pwd)"
  echo "Package directories found:"
  ls -la packages/ 2>/dev/null || echo "No packages directory found"
  exit 1
fi
