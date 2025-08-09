# Generating API Keys for PunchAI MCP Server

This guide explains different methods to generate secure API keys for your PunchAI MCP Server.

## Why API Keys Are Important

API keys are essential for securing your publicly hosted MCP server. They:
- Authenticate legitimate clients
- Prevent unauthorized access
- Allow you to revoke access when needed

## Method 1: Using the Setup Scripts

The easiest way to generate API keys is to use one of the provided setup scripts.

### For Windows Users

1. Open a command prompt in your PunchAI directory
2. Run the setup script:
   ```batch
   scripts\setup-env.bat
   ```
3. When prompted with "Generate a secure random API key? (Y/n):", press Enter or type Y
4. The script will generate a secure 32-character hexadecimal API key
5. You can add additional API keys when prompted

### For Linux/macOS Users

1. Open a terminal in your PunchAI directory
2. Make the script executable (if not already):
   ```bash
   chmod +x scripts/setup-env.sh
   ```
3. Run the setup script:
   ```bash
   ./scripts/setup-env.sh
   ```
4. When prompted with "Generate a secure random API key? (Y/n):", press Enter or type Y
5. The script will generate a secure 32-character hexadecimal API key using OpenSSL
6. You can add additional API keys when prompted

### For Node.js Users (Cross-Platform)

1. Open a terminal or command prompt in your PunchAI directory
2. Run the Node.js setup script:
   ```bash
   node scripts/setup-env.js
   ```
3. When prompted with "Generate a secure random API key? (Y/n):", press Enter or type Y
4. The script will generate a secure 32-character hexadecimal API key using Node.js crypto module
5. You can add additional API keys when prompted

> **Note**: All Node.js scripts in this project use ES modules. Make sure your `package.json` has `"type": "module"` or rename the scripts with a `.mjs` extension if you prefer CommonJS as your default.

## Method 2: Manual Generation

If you prefer to generate API keys manually, here are several secure methods:

### Using Node.js

#### CommonJS (Traditional Node.js)

```javascript
// Run this in a Node.js REPL or save as generate-key.js
const crypto = require('crypto');
const apiKey = crypto.randomBytes(32).toString('hex');
console.log(apiKey);
```

Run with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### ES Modules (Modern Node.js)

```javascript
// Save as generate-key.mjs or use in a project with "type": "module" in package.json
import crypto from 'crypto';
const apiKey = crypto.randomBytes(32).toString('hex');
console.log(apiKey);
```

Run with:
```bash
node --input-type=module -e "import crypto from 'crypto'; console.log(crypto.randomBytes(32).toString('hex'))"
```

### Using OpenSSL (Linux/macOS/Windows with OpenSSL)

```bash
openssl rand -hex 32
```

### Using PowerShell (Windows)

```powershell
$apiKey = -join ((48..57) + (97..102) | Get-Random -Count 64 | ForEach-Object {[char]$_})
$apiKey
```

## Method 3: Online Generators

You can use online tools to generate secure random strings, but be cautious as these may not be suitable for production use due to security concerns:

- [Random.org](https://www.random.org/strings/)
- [GRC's Perfect Passwords](https://www.grc.com/passwords.htm)

## Adding API Keys to Your Server

Once you've generated your API key(s), you need to add them to your server's configuration:

1. Open your `.env` file in the PunchAI directory
2. Find the `API_KEYS` line
3. Add your key(s) as a comma-separated list:
   ```
   API_KEYS=key1,key2,key3
   ```

## Best Practices for API Key Management

1. **Length and Complexity**: Use keys that are at least 32 characters long with high entropy
2. **Storage**: Store API keys securely, never in public repositories
3. **Rotation**: Change keys periodically, especially after team member changes
4. **Least Privilege**: Issue different keys for different clients with appropriate access levels
5. **Monitoring**: Log and monitor API key usage to detect suspicious activity
6. **Revocation**: Have a process to quickly revoke compromised keys

## Using API Keys in Clients

When connecting to your MCP server from a client, include the API key in the connection:

```javascript
// Example from examples/client.js
const WebSocket = require('ws');

// Connect to the MCP server with API key authentication
const ws = new WebSocket('ws://localhost:3000/mcp', {
  headers: {
    'X-API-Key': 'your-api-key-here'
  }
});
```

## Troubleshooting

- **Authentication Failures**: Ensure the API key in your client exactly matches one of the keys in your server's `API_KEYS` environment variable
- **Key Format Issues**: API keys should not contain spaces or special characters that might need URL encoding
- **Environment Variable Problems**: Verify your `.env` file is being properly loaded by the server

## Conclusion

Secure API keys are a critical component of your PunchAI MCP Server's security when hosting publicly. By following the methods in this guide, you can generate and manage strong API keys to protect your server from unauthorized access.