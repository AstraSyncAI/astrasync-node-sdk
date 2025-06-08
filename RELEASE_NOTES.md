# Release Notes

## v0.1.0 - Initial Public Release 🚀

**Released:** January 7, 2025

We're excited to announce the first public release of the AstraSync SDK! This SDK provides a universal interface for registering AI agents with the AstraSync blockchain-based compliance platform.

### ✨ Features

#### Auto-Detection for 5 Major Protocols
The SDK automatically detects and handles agent formats from:
- **MCP** (Model Context Protocol) - Anthropic's protocol
- **Letta** (formerly MemGPT) - Memory-enabled agents
- **ACP** (Agent Communication Protocol) - IBM's protocol  
- **OpenAI** Assistants API format
- **AutoGPT** - Autonomous GPT agents

#### Beautiful Developer Experience
- 🛠️ **Zero configuration** - Works out of the box
- 📦 **Simple installation** - One npm command
- 🎨 **Beautiful CLI** - Progress indicators and colored output
- 🔍 **TypeScript support** - Full type definitions included

#### Trust Score System
- Dynamic trust scores (70-95%) based on agent metadata
- Scoring considers completeness, capabilities, and compliance features
- Transparent scoring algorithm

#### Developer Preview API
- Register agents and receive temporary IDs
- Verify agent existence
- Check API health
- Fast response times (<100ms)

### 📦 Installation

```bash
# Install the SDK
npm install @astrasyncai/sdk

# Or install globally for CLI usage
npm install -g @astrasyncai/sdk
```

### 🚀 Quick Start

```javascript
const { AstraSync } = require('@astrasyncai/sdk');

const client = new AstraSync({
  developerEmail: 'your@email.com'
});

// The SDK auto-detects your agent format!
const result = await client.register(yourAgentData);
console.log(`Registered: ${result.agentId}`);
```

### 🔧 CLI Commands

```bash
astrasync register agent.json --email your@email.com
astrasync verify TEMP-123456
astrasync detect agent.json
astrasync health
```

### 📊 Technical Details

- **Package size:** ~35KB unpacked
- **Dependencies:** Minimal (chalk, commander, ora)
- **Node.js:** Requires v16.0.0 or higher
- **TypeScript:** Full support with strict mode
- **License:** MIT

### 🔗 Links

- **npm Package:** https://www.npmjs.com/package/@astrasyncai/sdk
- **GitHub Repository:** https://github.com/AstraSyncAI/astrasync-node-sdk
- **Documentation:** https://github.com/AstraSyncAI/astrasync-node-sdk#readme
- **Issues & Support:** https://github.com/AstraSyncAI/astrasync-node-sdk/issues

### 🙏 Acknowledgments

Special thanks to our developer preview testers who provided valuable feedback during development.

### 📮 Feedback

We'd love to hear your feedback! Please open an issue on GitHub or reach out to support@astrasync.ai.

---

**What's Next?**
- Python SDK (coming Week 2)
- Go SDK (coming Week 3)  
- Enhanced trust score algorithms
- Production blockchain integration
- Batch registration support

Thank you for being part of the AstraSync journey! 🚀
