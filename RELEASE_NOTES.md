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
