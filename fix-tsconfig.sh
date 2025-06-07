#!/bin/bash

echo "🔧 Fixing TypeScript configuration..."

# Fix packages/core/tsconfig.json
cat > packages/core/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true
  },
  "include": ["src/**/*"],
  "exclude": ["**/*.test.ts", "**/*.spec.ts"]
}
EOF

# Also update packages/sdk/tsconfig.json to be safe
cat > packages/sdk/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true
  },
  "include": ["src/**/*"],
  "exclude": ["**/*.test.ts", "**/*.spec.ts"],
  "references": [
    { "path": "../core" }
  ]
}
EOF

echo "✅ Fixed TypeScript configurations"
echo ""
echo "🔨 Building packages..."
npm run build

echo ""
echo "🔗 Linking packages for local development..."
cd packages/core && npm link && cd ../..
cd packages/sdk && npm link @astrasync/core && npm link && cd ../..

echo ""
echo "✅ Build complete! Testing CLI..."
echo ""

# Make the CLI executable
chmod +x packages/sdk/dist/cli/index.js

# Test the CLI
npx astrasync --help

echo ""
echo "🎉 SDK is ready! Try these commands:"
echo "  npx astrasync examples"
echo "  npx astrasync health"
echo "  npx astrasync register examples/mcp-agent.json --email your@email.com"
