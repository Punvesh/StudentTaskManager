# API Key Generation for PunchAI MCP Server

This README provides an overview of all the tools and methods available for generating API keys for your PunchAI MCP Server.

## Why API Keys Matter

API keys are essential for securing your publicly hosted MCP server. They provide a simple but effective authentication mechanism to ensure only authorized clients can connect to your server.

## Available Tools

The PunchAI MCP Server provides several tools for generating API keys to suit different preferences and environments:

### 1. Interactive Setup Scripts

These scripts guide you through the entire environment setup process, including API key generation:

- **Node.js (Cross-platform)**: `scripts/setup-env.js`
- **Windows Batch**: `scripts/setup-env.bat`
- **Linux/macOS Shell**: `scripts/setup-env.sh`

### 2. Dedicated API Key Generators

These tools focus specifically on API key generation:

- **Node.js (Cross-platform)**: `scripts/generate-api-key.js`
- **PowerShell (Windows)**: `scripts/generate-api-key.ps1`
- **Bash (Linux/macOS)**: `scripts/generate-api-key.sh`
- **Web Interface**: `public/api-key-generator.html`
- **Command-line Utility**: `scripts/quick-api-key.js`

## Usage Guide

### Interactive Setup Scripts

These scripts will guide you through the entire environment setup, including API key generation:

```bash
# Node.js (Cross-platform)
node scripts/setup-env.js

# Windows
scripts\setup-env.bat

# Linux/macOS
./scripts/setup-env.sh
```

### Dedicated API Key Generators

#### Node.js Generator

```bash
node scripts/generate-api-key.js
```

This interactive script will:
1. Generate a secure random API key
2. Optionally generate additional keys
3. Optionally update your `.env` file

> **Note**: All Node.js scripts in this project use ES modules. Make sure your `package.json` has `"type": "module"` or rename the scripts with a `.mjs` extension if you prefer CommonJS as your default.

#### PowerShell Generator (Windows)

```powershell
.\scripts\generate-api-key.ps1
```

Similar to the Node.js version but implemented in PowerShell for Windows users.

#### Bash Generator (Linux/macOS)

```bash
./scripts/generate-api-key.sh
```

Similar to the Node.js version but implemented in Bash for Linux/macOS users.

#### Web Interface

Open `public/api-key-generator.html` in your web browser to use the graphical interface for generating API keys. This tool:

1. Runs entirely in your browser (no server communication)
2. Allows customizing key length and count
3. Provides easy copying of generated keys
4. Offers a downloadable `.env` file

#### Quick Command-line Utility

For non-interactive usage or scripting:

```bash
# Generate a single API key
node scripts/quick-api-key.js

# Generate 3 API keys
node scripts/quick-api-key.js --count 3

# Generate a 64-byte key in JSON format
node scripts/quick-api-key.js --length 64 --format json

# Generate keys in .env file format
node scripts/quick-api-key.js --count 2 --format env
```

## Manual Generation Methods

If you prefer to use your own tools, here are some reliable methods for generating secure API keys:

### Using Node.js

```javascript
const crypto = require('crypto');
const apiKey = crypto.randomBytes(32).toString('hex');
console.log(apiKey);
```

### Using OpenSSL

```bash
openssl rand -hex 32
```

### Using PowerShell

```powershell
$apiKey = -join ((48..57) + (97..102) | Get-Random -Count 64 | ForEach-Object {[char]$_})
$apiKey
```

## Using API Keys in Your Server

After generating your API keys, add them to your `.env` file:

```
API_KEYS=key1,key2,key3
```

Multiple keys can be separated by commas.

## Using API Keys in Clients

When connecting to your MCP server from a client, include the API key in the WebSocket connection headers:

```javascript
const WebSocket = require('ws');

const ws = new WebSocket('ws://your-server:3000/mcp', {
  headers: {
    'X-API-Key': 'your-api-key-here'
  }
});
```

## Best Practices

1. **Use Long Keys**: Generate keys that are at least 32 bytes (64 hex characters) long
2. **Keep Keys Secret**: Never commit API keys to public repositories
3. **Use Different Keys**: Issue different keys for different clients or services
4. **Rotate Regularly**: Change keys periodically, especially after team changes
5. **Revocation Plan**: Have a process to quickly revoke and replace compromised keys

## Additional Resources

For more detailed information, see:

- `api_key_guide.md` - Comprehensive guide to API key generation and management
- `env_setup_guide.md` - Guide to environment variable setup, including API keys
- `deployment_guide.md` - Information on deploying your server securely

## Troubleshooting

If you encounter issues with API key authentication:

1. Verify the key in your client exactly matches one in your server's `API_KEYS` variable
2. Check that your `.env` file is being properly loaded
3. Ensure there are no spaces or special characters in your API keys
4. Confirm your client is correctly sending the API key in the `X-API-Key` header