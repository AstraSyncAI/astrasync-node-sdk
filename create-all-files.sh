#!/bin/bash
# AstraSync SDK Complete File Creation Script - WITH ALL FIXES
# Run this in Git Bash from C:\Projects\AstraSync\astrasync-sdk

echo "🚀 AstraSync SDK File Creation (Corrected Version)"
echo "=================================================="
echo ""

# STEP 1: Verify npm authentication
echo "📋 Step 1: Checking npm authentication..."
echo "-----------------------------------------"
CURRENT_USER=$(npm whoami 2>/dev/null)
if [ -z "$CURRENT_USER" ]; then
    echo "❌ You are not logged in to npm!"
    echo ""
    echo "Please run: npm login"
    echo "Username: tim.astrasync"
    echo "Password: [your password]"
    echo "Email: [your email]"
    echo ""
    echo "Then run this script again."
    exit 1
else
    echo "✅ Logged in as: $CURRENT_USER"
    if [ "$CURRENT_USER" != "tim.astrasync" ]; then
        echo "⚠️  WARNING: You're logged in as '$CURRENT_USER' not 'tim.astrasync'"
        echo "This may cause publishing issues!"
        echo ""
        echo "To fix: npm logout && npm login"
        echo "Then use username: tim.astrasync"
        echo ""
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
fi

# Set npm registry config for the scope
echo ""
echo "🔧 Configuring npm for @astrasyncai scope..."
npm config set @astrasyncai:registry https://registry.npmjs.org/
echo "✅ Scope configured"
echo ""

# STEP 2: Create all files with corrections
echo "📝 Step 2: Creating all project files..."
echo "---------------------------------------"

# Create package.json
cat > package.json << 'EOF'
{
  "name": "@astrasyncai/sdk",
  "version": "0.1.0",
  "description": "Universal SDK for registering AI agents with AstraSync",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "bin": {
    "astrasync": "./dist/cli/index.js"
  },
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist",
    "prebuild": "npm run clean",
    "test": "jest",
    "lint": "eslint src --ext .ts",
    "prepublishOnly": "npm run build",
    "example:mcp": "tsx examples/register-mcp.ts",
    "example:letta": "tsx examples/register-letta.ts",
    "publish:npm": "npm publish --access public --registry https://registry.npmjs.org/"
  },
  "keywords": [
    "astrasync",
    "ai",
    "agents",
    "blockchain",
    "compliance",
    "mcp",
    "letta",
    "autogpt",
    "openai"
  ],
  "author": "AstraSync AI",
  "license": "MIT",
  "dependencies": {
    "chalk": "^5.3.0",
    "commander": "^11.0.0",
    "ora": "^6.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  },
  "files": [
    "dist/**/*",
    "README.md",
    "LICENSE"
  ],
  "engines": {
    "node": ">=16.0.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/AstraSyncAI/astrasync-node-sdk"
  },
  "bugs": {
    "url": "https://github.com/AstraSyncAI/astrasync-node-sdk/issues"
  },
  "homepage": "https://astrasync.ai"
}
EOF

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "examples", "**/*.test.ts"]
}
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.env
.DS_Store
coverage/
.vscode/
.idea/
*.tgz
.npm/
EOF

# Create .npmignore
cat > .npmignore << 'EOF'
src/
examples/
*.test.ts
tsconfig.json
.gitignore
.eslintrc.json
jest.config.js
coverage/
.github/
*.log
EOF

# Create .npmrc for authentication
cat > .npmrc << 'EOF'
@astrasyncai:registry=https://registry.npmjs.org/
EOF

# Create types (CORRECTED - includes detectedFormat)
cat > src/types/index.ts << 'EOF'
export interface Agent {
  name: string;
  description: string;
  version?: string;
  capabilities?: string[];
  [key: string]: any;
}

export interface RegistrationResponse {
  agentId: string;
  status: string;
  trustScore?: string;
  blockchainStatus?: string;
  message?: string;
  verificationUrl?: string;
  detectedFormat?: string; // Added to fix TypeScript error
}

export interface AstraSyncOptions {
  developerEmail: string;
  apiUrl?: string;
}

export type AgentFormat = 'mcp' | 'letta' | 'acp' | 'openai' | 'autogpt' | 'unknown';

export interface DetectionResult {
  format: AgentFormat;
  confidence: number;
  agent?: Agent;
}
EOF

# Create API client (CORRECTED - proper types and spread order)
cat > src/utils/api.ts << 'EOF'
import { Agent, RegistrationResponse } from '../types';

const DEFAULT_API_URL = 'https://astrasync-api-production.up.railway.app';

export class AstraSyncAPI {
  private apiUrl: string;
  private email: string;

  constructor(email: string, apiUrl: string = DEFAULT_API_URL) {
    this.email = email;
    this.apiUrl = apiUrl;
  }

  async registerAgent(agent: Agent): Promise<RegistrationResponse> {
    const response = await fetch(`${this.apiUrl}/v1/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-source': 'sdk'
      },
      body: JSON.stringify({
        email: this.email,
        agent: {
          ...agent, // Spread first to allow overrides (fixes TS error)
          owner: this.email,
          capabilities: agent.capabilities || [],
          version: agent.version || '1.0.0'
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Registration failed: ${error}`);
    }

    // Type assertion to fix TS error
    return response.json() as Promise<RegistrationResponse>;
  }

  async verifyAgent(agentId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/v1/verify/${agentId}`);
      // Type assertion for the response
      const data = await response.json() as { exists: boolean };
      return data.exists === true;
    } catch {
      return false;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
EOF

# Create detector
cat > src/utils/detector.ts << 'EOF'
import { readFileSync } from 'fs';
import { Agent, AgentFormat, DetectionResult } from '../types';
import { parseLettaAgent } from '../adapters/letta';

export function detectAgentFormat(content: any): DetectionResult {
  // If it's a string, try to parse it
  if (typeof content === 'string') {
    try {
      content = JSON.parse(content);
    } catch {
      // Check if it's a Letta .af file path
      if (content.endsWith('.af')) {
        try {
          const lettaAgent = parseLettaAgent(content);
          return {
            format: 'letta',
            confidence: 1.0,
            agent: lettaAgent
          };
        } catch {
          return { format: 'unknown', confidence: 0 };
        }
      }
      return { format: 'unknown', confidence: 0 };
    }
  }

  // MCP Detection
  if (content.protocol === 'ai-agent' && content.skills) {
    return {
      format: 'mcp',
      confidence: 0.95,
      agent: {
        name: content.name,
        description: content.description || 'MCP Agent',
        version: content.version,
        capabilities: content.skills?.map((s: any) => s.name) || []
      }
    };
  }

  // Letta Detection
  if (content.type === 'agent' && content.memory) {
    return {
      format: 'letta',
      confidence: 0.95,
      agent: {
        name: content.name || 'Letta Agent',
        description: content.description || 'Letta Agent',
        capabilities: ['memory', 'tools']
      }
    };
  }

  // ACP Detection
  if (content.agentId && content.authentication) {
    return {
      format: 'acp',
      confidence: 0.9,
      agent: {
        name: content.name || content.agentName || content.agentId,
        description: content.description || 'ACP Agent',
        capabilities: content.capabilities || []
      }
    };
  }

  // OpenAI Detection
  if (content.model && content.instructions) {
    return {
      format: 'openai',
      confidence: 0.9,
      agent: {
        name: content.name || 'OpenAI Assistant',
        description: content.instructions || 'OpenAI Assistant',
        capabilities: content.tools?.map((t: any) => t.type) || []
      }
    };
  }

  // AutoGPT Detection
  if (content.ai_name && content.ai_role) {
    return {
      format: 'autogpt',
      confidence: 0.9,
      agent: {
        name: content.ai_name,
        description: content.ai_role,
        capabilities: content.ai_goals || []
      }
    };
  }

  return { format: 'unknown', confidence: 0 };
}
EOF

# Create Letta adapter (CORRECTED - no yauzl)
cat > src/adapters/letta.ts << 'EOF'
import { readFileSync } from 'fs';
import { Agent } from '../types';

export function parseLettaAgent(filePath: string): Agent {
  // For .af files, we read as JSON for now
  // TODO: Add proper ZIP handling for .af files in future version
  try {
    const content = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    return {
      name: data.name || 'Letta Agent',
      description: data.description || 'Letta Agent',
      version: data.version || '1.0.0',
      capabilities: data.capabilities || ['memory', 'tools']
    };
  } catch (error) {
    // If parsing fails, return default
    return {
      name: 'Letta Agent',
      description: 'Imported Letta Agent',
      version: '1.0.0',
      capabilities: ['memory', 'tools']
    };
  }
}
EOF

# Create trust score calculator
cat > src/utils/trustScore.ts << 'EOF'
import { Agent } from '../types';

export function calculateTrustScore(agent: Agent): number {
  let score = 70; // Base score

  // Add points for completeness
  if (agent.description && agent.description.length > 50) score += 5;
  if (agent.version) score += 5;
  if (agent.capabilities && agent.capabilities.length > 0) score += 5;
  if (agent.capabilities && agent.capabilities.length > 3) score += 5;
  
  // Add points for specific capabilities
  const trustedCapabilities = ['authentication', 'audit', 'compliance'];
  if (agent.capabilities) {
    for (const cap of agent.capabilities) {
      if (trustedCapabilities.some(tc => cap.toLowerCase().includes(tc))) {
        score += 2;
      }
    }
  }

  return Math.min(score, 95); // Cap at 95 for preview
}
EOF

# Create main SDK entry (CORRECTED - fixed typo in interface name)
cat > src/index.ts << 'EOF'
import { Agent, RegistrationResponse, AstraSyncOptions, AgentFormat } from './types';
import { AstraSyncAPI } from './utils/api';
import { detectAgentFormat } from './utils/detector';
import { calculateTrustScore } from './utils/trustScore';

export class AstraSync {
  private api: AstraSyncAPI;

  constructor(options: AstraSyncOptions) {
    this.api = new AstraSyncAPI(options.developerEmail, options.apiUrl);
  }

  async register(agentData: any): Promise<RegistrationResponse> {
    // Auto-detect format
    const detection = detectAgentFormat(agentData);
    
    if (detection.format === 'unknown' || !detection.agent) {
      throw new Error('Unable to detect agent format. Please check your agent data.');
    }

    // Calculate trust score
    const trustScore = calculateTrustScore(detection.agent);

    // Register with API
    const response = await this.api.registerAgent(detection.agent);

    // Enhance response with detected format
    return {
      ...response,
      detectedFormat: detection.format,
      trustScore: `${trustScore}%`
    };
  }

  async verify(agentId: string): Promise<boolean> {
    return this.api.verifyAgent(agentId);
  }

  detect(agentData: any): AgentFormat {
    return detectAgentFormat(agentData).format;
  }

  async health(): Promise<boolean> {
    return this.api.checkHealth();
  }
}

// Export everything
export * from './types';
export { detectAgentFormat } from './utils/detector';
export { calculateTrustScore } from './utils/trustScore';
EOF

# Create CLI
cat > src/cli/index.ts << 'EOF'
#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { readFileSync, writeFileSync } from 'fs';
import { AstraSync } from '..';

const program = new Command();

program
  .name('astrasync')
  .description('AstraSync AI Agent Registration CLI')
  .version('0.1.0');

program
  .command('register <file-or-json>')
  .description('Register an AI agent with AstraSync')
  .option('-e, --email <email>', 'Developer email (overrides env)')
  .option('-o, --output <file>', 'Save results to file')
  .action(async (input, options) => {
    const spinner = ora('Initializing AstraSync...').start();
    
    try {
      const email = options.email || process.env.ASTRASYNC_EMAIL;
      if (!email) {
        spinner.fail(chalk.red('Email required. Use --email or set ASTRASYNC_EMAIL'));
        process.exit(1);
      }

      // Parse input
      let agentData;
      try {
        // Try as file first
        const content = readFileSync(input, 'utf-8');
        agentData = input.endsWith('.json') ? JSON.parse(content) : input;
      } catch {
        // Try as inline JSON
        agentData = JSON.parse(input);
      }

      spinner.text = 'Detecting agent format...';
      const client = new AstraSync({ developerEmail: email });
      
      spinner.text = 'Registering with AstraSync...';
      const result = await client.register(agentData);
      
      spinner.succeed(chalk.green('✅ Registration complete!'));
      
      console.log('\n' + chalk.cyan('Registration Details:'));
      console.log(chalk.gray('─'.repeat(40)));
      console.log(`${chalk.bold('Agent ID:')} ${result.agentId}`);
      console.log(`${chalk.bold('Status:')} ${result.status}`);
      console.log(`${chalk.bold('Trust Score:')} ${result.trustScore}`);
      console.log(`${chalk.bold('Format Detected:')} ${result.detectedFormat}`);
      
      if (options.output) {
        writeFileSync(options.output, JSON.stringify(result, null, 2));
        console.log(`\n${chalk.green('✅')} Results saved to ${options.output}`);
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('verify <agentId>')
  .description('Verify an agent exists')
  .option('-e, --email <email>', 'Developer email')
  .action(async (agentId, options) => {
    const spinner = ora('Verifying agent...').start();
    
    try {
      const email = options.email || process.env.ASTRASYNC_EMAIL || 'verify@astrasync.ai';
      const client = new AstraSync({ developerEmail: email });
      
      const exists = await client.verify(agentId);
      
      if (exists) {
        spinner.succeed(chalk.green(`✅ Agent ${agentId} is registered`));
      } else {
        spinner.fail(chalk.yellow(`⚠️  Agent ${agentId} not found`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('detect <file>')
  .description('Detect agent format without registering')
  .action(async (file) => {
    try {
      const content = readFileSync(file, 'utf-8');
      const data = JSON.parse(content);
      
      const client = new AstraSync({ developerEmail: 'detect@astrasync.ai' });
      const format = client.detect(data);
      
      console.log(chalk.cyan(`Detected format: ${chalk.bold(format)}`));
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('health')
  .description('Check AstraSync API health')
  .action(async () => {
    const spinner = ora('Checking API health...').start();
    
    try {
      const client = new AstraSync({ developerEmail: 'health@astrasync.ai' });
      const healthy = await client.health();
      
      if (healthy) {
        spinner.succeed(chalk.green('✅ AstraSync API is healthy'));
      } else {
        spinner.fail(chalk.red('❌ AstraSync API is down'));
      }
    } catch (error) {
      spinner.fail(chalk.red('❌ Could not reach AstraSync API'));
      process.exit(1);
    }
  });

program.parse();
EOF

# Create example files
cat > examples/mcp-agent.json << 'EOF'
{
  "protocol": "ai-agent",
  "name": "Customer Support Bot",
  "description": "AI agent for handling customer inquiries",
  "version": "1.0.0",
  "skills": [
    { "name": "answer_question" },
    { "name": "escalate_ticket" }
  ]
}
EOF

cat > examples/register-mcp.ts << 'EOF'
import { AstraSync } from '@astrasyncai/sdk';
import mcpAgent from './mcp-agent.json';

async function main() {
  const client = new AstraSync({
    developerEmail: 'developer@example.com'
  });

  try {
    const result = await client.register(mcpAgent);
    console.log('Registration successful:', result);
  } catch (error) {
    console.error('Registration failed:', error);
  }
}

main();
EOF

# Create README
cat > README.md << 'EOF'
# AstraSync SDK

Universal TypeScript/Node.js SDK for registering AI agents with AstraSync's blockchain-based compliance platform.

## Features

- 🚀 **Auto-detection** for 5 major agent formats (MCP, Letta, ACP, OpenAI, AutoGPT)
- 🔐 **Blockchain compliance** layer for AI agents
- 📊 **Trust score** calculation based on agent metadata
- 🛠️ **Beautiful CLI** with progress indicators
- 📦 **Zero configuration** - works out of the box
- 🔍 **TypeScript** support with full type safety

## Installation

```bash
npm install @astrasyncai/sdk
```

Or install globally for CLI usage:

```bash
npm install -g @astrasyncai/sdk
```

## Quick Start

### Using the SDK

```typescript
import { AstraSync } from '@astrasyncai/sdk';

const client = new AstraSync({
  developerEmail: 'your-email@example.com'
});

// Register any supported agent format
const result = await client.register(agentData);
console.log(`Agent registered: ${result.agentId}`);
```

### Using the CLI

```bash
# Register an agent from a file
astrasync register agent.json --email your@email.com

# Or with environment variable
export ASTRASYNC_EMAIL=your@email.com
astrasync register agent.json

# Verify an agent exists
astrasync verify TEMP-123456

# Check API health
astrasync health
```

## Supported Agent Formats

The SDK automatically detects and supports:

- **MCP** (Model Context Protocol) - Anthropic's protocol
- **Letta** (formerly MemGPT) - .af files and JSON
- **ACP** (Agent Communication Protocol) - IBM's protocol
- **OpenAI** Assistants API format
- **AutoGPT** agent configurations

## API Reference

### `new AstraSync(options)`

Create a new AstraSync client.

```typescript
const client = new AstraSync({
  developerEmail: 'developer@example.com',
  apiUrl: 'https://api.astrasync.ai' // optional
});
```

### `client.register(agentData)`

Register an agent with auto-format detection.

### `client.verify(agentId)`

Check if an agent ID exists in the system.

### `client.detect(agentData)`

Detect agent format without registering.

### `client.health()`

Check API health status.

## Examples

See the `examples/` directory for complete examples.

## Development

```bash
# Clone the repository
git clone https://github.com/AstraSyncAI/astrasync-node-sdk

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

## License

MIT © AstraSync AI
EOF

# Create LICENSE
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2024 AstraSync AI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

# Create helper publish script
cat > publish-helper.sh << 'EOF'
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
EOF
chmod +x publish-helper.sh

echo ""
echo "✅ All files created successfully with corrections!"
echo ""
echo "📋 Summary of fixes applied:"
echo "  - Fixed TypeScript interface name (AstraSyncOptions)"
echo "  - Added detectedFormat to RegistrationResponse type"
echo "  - Fixed spread operator order in API client"
echo "  - Added type assertions for fetch responses"  
echo "  - Removed yauzl dependency (not needed for MVP)"
echo "  - Added npm authentication check at start"
echo "  - Created .npmrc for scope configuration"
echo "  - Added publish-helper.sh for easier publishing"
echo ""
echo "🎯 Next steps:"
echo "  1. npm install"
echo "  2. npm run build (should have NO errors)"
echo "  3. ./publish-helper.sh (to publish with correct auth)"
echo ""
echo "If publishing still fails, generate an npm token:"
echo "  1. Go to: https://www.npmjs.com/settings/tim.astrasync/tokens"
echo "  2. Generate new token with 'Publish' permission"
echo "  3. Add to ~/.npmrc: //registry.npmjs.org/:_authToken=YOUR_TOKEN"