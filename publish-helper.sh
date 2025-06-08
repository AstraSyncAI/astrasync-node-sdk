#!/bin/bash
# Helper script for publishing to npm

echo "🚀 AstraSync SDK Publish Helper"
echo "==============================="

# Check if logged in as correct user
CURRENT_USER=$(npm whoami)
if [ "$CURRENT_USER" != "tim.astrasync" ]; then
    echo "❌ ERROR: You need to be logged in as 'tim.astrasync'"
    echo "Current user: $CURRENT_USER"
    echo ""
    echo "Fix: npm logout && npm login"
    exit 1
fi

# Ensure we're using the right registry
npm config set @astrasyncai:registry https://registry.npmjs.org/

# Build first
echo "Building project..."
npm run build

# Publish with explicit settings
echo "Publishing to npm..."
npm publish --access public --registry https://registry.npmjs.org/

echo "✅ Done!"
