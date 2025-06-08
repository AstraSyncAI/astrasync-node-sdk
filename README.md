# AstraSync SDK

> 🚀 **Universal SDK for AI Agent Registration** - One SDK, all protocols

[![npm version](https://img.shields.io/npm/v/@astrasync/sdk.svg)](https://www.npmjs.com/package/@astrasync/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Register any AI agent with AstraSync in seconds. Automatic format detection, beautiful CLI, zero configuration.

## ✨ Features

- 🔍 **Auto-Detection** - Automatically detects MCP, Letta, ACP, OpenAI, and AutoGPT formats
- 🎯 **One Import** - Single SDK for all agent protocols
- 🎨 **Beautiful CLI** - Gorgeous command-line interface with progress indicators
- 🔐 **Auth Ready** - Built-in support for future authentication (currently in preview)
- 📊 **Trust Scores** - Dynamic trust score calculation based on agent metadata
- 🌐 **All Protocols** - Support for every major agent framework

## 🚀 Quick Start

### Install

```bash
npm install @astrasync/sdk
# or
yarn add @astrasync/sdk
# or
pnpm add @astrasync/sdk
```

### Register Any Agent (Auto-Detection)

```typescript
import { AstraSync } from '@astrasync/sdk';

const client = new AstraSync({ 
  email: 'developer@example.com' 
});

// IT JUST WORKS - auto-detects format
const result = await client.register('./agent.af');        // Letta
const result2 = await client.register(mcpAgentObject);     // MCP
const result3 = await client.register('./agent.json');     // Any format!

console.log(`Agent ID: ${result.agentId}`);
console.log(`Trust Score: ${result.trustScore}`);
```

### CLI Usage

```bash
# Register from file
astrasync register agent.json --email dev@example.com

# Register inline JSON
astrasync register '{"name":"My Agent","type":"mcp"}' --email dev@example.com

# Verify agent
astrasync verify TEMP-123456

# Check API health
astrasync health

# Detect agent format
astrasync detect agent.af

# See examples
astrasync examples
```

## 📚 Documentation

Full documentation available at [docs.astrasync.ai](https://docs.astrasync.ai)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT © AstraSync

---

Built with ❤️ by the AstraSync team. Making AI agent identity simple, secure, and universal.
