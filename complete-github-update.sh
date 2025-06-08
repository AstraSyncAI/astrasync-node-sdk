#!/bin/bash
# Complete GitHub Update Script for AstraSync SDK
# Run this from: C:\Projects\AstraSync\astrasync-sdk

echo "🚀 Complete GitHub Update for AstraSync SDK"
echo "=========================================="
echo ""

# 1. Check current directory
echo "📍 Current directory: $(pwd)"
if [[ ! -f "package.json" ]]; then
    echo "❌ ERROR: Not in the SDK directory. Please run from astrasync-sdk folder"
    exit 1
fi
echo "✅ In correct directory"
echo ""

# 2. Initialize Git if needed
if [[ ! -d ".git" ]]; then
    echo "🔧 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi
echo ""

# 3. Configure Git (if needed)
echo "🔧 Configuring Git..."
git config user.name "Tim Williams" 2>/dev/null
git config user.email "tim@astrasync.ai" 2>/dev/null
echo "✅ Git configured"
echo ""

# 4. Add safe directory (Windows fix)
echo "🔧 Adding safe directory..."
git config --global --add safe.directory C:/Projects/AstraSync/astrasync-sdk
echo "✅ Safe directory added"
echo ""

# 5. Add all files
echo "📝 Adding all files to Git..."
git add .
echo "✅ Files added"
echo ""

# 6. Commit everything
echo "💾 Creating commit..."
git commit -m "🎉 Initial release - AstraSync SDK v0.1.0

- Universal SDK for AI agent registration  
- Auto-detection for 5 protocols (MCP, Letta, ACP, OpenAI, AutoGPT)
- Beautiful CLI with progress indicators
- Full TypeScript support with strict mode
- Zero configuration required
- Dynamic trust score calculation (70-95%)
- Published to npm as @astrasyncai/sdk

Features:
- Automatic agent format detection
- Support for major AI agent protocols
- Clean API with async/await
- Global CLI tool
- Comprehensive TypeScript types
- Extensive error handling

npm: https://www.npmjs.com/package/@astrasyncai/sdk" 2>/dev/null || echo "✅ Already committed"
echo ""

# 7. Set main branch
echo "🔧 Setting main branch..."
git branch -M main
echo "✅ Main branch set"
echo ""

# 8. Add GitHub remote
echo "🔧 Adding GitHub remote..."
git remote remove origin 2>/dev/null  # Remove if exists
git remote add origin https://github.com/AstraSyncAI/astrasync-node-sdk.git
echo "✅ GitHub remote added"
echo ""

# 9. Push to GitHub (force to overwrite)
echo "📤 Pushing to GitHub..."
echo "This will overwrite the existing repository content."
git push -u origin main --force
echo "✅ Pushed to GitHub"
echo ""

# 10. Create and push version tag
echo "🏷️ Creating version tag..."
git tag -a v0.1.0 -m "Version 0.1.0 - Initial public release" --force 2>/dev/null
git push origin v0.1.0 --force
echo "✅ Version tag created and pushed"
echo ""

# 11. Create release notes file
echo "📝 Creating release notes..."
cat > RELEASE_NOTES.md << 'EOF'
# Release Notes - v0.1.0

## 🎉 Initial Public Release

### Features
- **Auto-detection** for 5 major AI agent protocols:
  - MCP (Model Context Protocol) - Anthropic
  - Letta (formerly MemGPT)  
  - ACP (Agent Communication Protocol) - IBM
  - OpenAI Assistants
  - AutoGPT

- **Beautiful CLI** with progress indicators
- **Full TypeScript support** with comprehensive type definitions
- **Zero configuration** - works out of the box
- **Dynamic trust scores** (70-95%) based on agent metadata

### Installation
```bash
npm install @astrasyncai/sdk
```

### Quick Start
```javascript
const { AstraSync } = require('@astrasyncai/sdk');

const client = new AstraSync({
  developerEmail: 'developer@example.com'
});

const result = await client.register(agentData);
console.log(`Agent registered: ${result.agentId}`);
```

### CLI Usage
```bash
# Install globally
npm install -g @astrasyncai/sdk

# Use the CLI
astrasync register agent.json --email your@email.com
astrasync verify TEMP-123456
astrasync health
```

### Links
- npm: https://www.npmjs.com/package/@astrasyncai/sdk
- GitHub: https://github.com/AstraSyncAI/astrasync-node-sdk
- Documentation: https://github.com/AstraSyncAI/astrasync-node-sdk#readme
EOF

git add RELEASE_NOTES.md
git commit -m "📝 Add release notes for v0.1.0" 2>/dev/null
git push origin main
echo "✅ Release notes added"
echo ""

echo "=========================================="
echo "✅ GitHub update complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Go to: https://github.com/AstraSyncAI/astrasync-node-sdk/releases/new"
echo "2. Click 'Choose a tag' and select 'v0.1.0'"
echo "3. Set release title: 'v0.1.0 - Initial Release 🚀'"
echo "4. Copy the content from RELEASE_NOTES.md into the description"
echo "5. Click 'Publish release'"
echo ""
echo "Your repository is now fully updated!"
echo "Ready to announce on LinkedIn! 🎉"