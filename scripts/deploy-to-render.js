#!/usr/bin/env node

/**
 * Helper script to prepare and deploy the PunchAI MCP Server to Render
 * 
 * This script:
 * 1. Verifies the project is ready for deployment
 * 2. Creates necessary configuration files if they don't exist
 * 3. Provides instructions for deploying to Render
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { execSync } from 'child_process';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 PunchAI MCP Server - Render Deployment Helper');
console.log('===============================================');

// Check if running from the project root
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: Please run this script from the project root directory');
  process.exit(1);
}

// Function to ask questions
const ask = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Main function
const prepareForRender = async () => {
  try {
    // Step 1: Check for required files
    console.log('\n📄 Checking for required files...');
    
    // Check for server.js
    if (!fs.existsSync('src/server.js')) {
      console.error('❌ Error: src/server.js not found.');
      console.log('Please make sure you have migrated to the public WebSocket server.');
      console.log('Run: node scripts/migrate-to-public.js');
      process.exit(1);
    } else {
      console.log('✅ src/server.js exists');
    }
    
    // Check for websocket-transport.js
    if (!fs.existsSync('src/websocket-transport.js')) {
      console.error('❌ Error: src/websocket-transport.js not found.');
      console.log('Please make sure you have migrated to the public WebSocket server.');
      console.log('Run: node scripts/migrate-to-public.js');
      process.exit(1);
    } else {
      console.log('✅ src/websocket-transport.js exists');
    }
    
    // Step 2: Check for render.yaml
    if (!fs.existsSync('render.yaml')) {
      console.log('Creating render.yaml...');
      
      const repoUrl = await ask('Enter your GitHub repository URL (e.g., https://github.com/yourusername/punchai): ');
      
      const renderYaml = `# Render deployment configuration for PunchAI MCP Server

services:
  # Web service configuration
  - type: web
    name: punchai-mcp-server
    env: node
    plan: starter # Choose appropriate plan (starter, standard, etc.)
    buildCommand: npm install
    startCommand: node src/server.js
    healthCheckPath: /health
    # Auto-deploy on changes to main branch
    repo: ${repoUrl || 'https://github.com/yourusername/punchai'}
    branch: main
    # Configure environment variables
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: API_KEYS
        # For sensitive values, use Render's environment variable UI
        sync: false
      - key: DB_PATH
        value: data/data.db
      - key: RATE_LIMIT_MAX
        value: 100
      - key: RATE_LIMIT_WINDOW_MS
        value: 900000
    # Disk configuration for persistent storage
    disk:
      name: data
      mountPath: /app/data
      sizeGB: 1 # Adjust based on your needs

# Uncomment this section if you want to use a PostgreSQL database
# databases:
#   - name: punchai-postgres
#     plan: starter # Choose appropriate plan
#     databaseName: punchai
#     user: punchai
#     # This will automatically set DATABASE_URL environment variable
#     # You'll need to update your code to use this instead of SQLite
`;
      
      fs.writeFileSync('render.yaml', renderYaml);
      console.log('✅ Created render.yaml');
    } else {
      console.log('✅ render.yaml already exists');
    }
    
    // Step 3: Check for .env file
    if (!fs.existsSync('.env')) {
      console.log('Creating .env file...');
      
      const apiKey = await ask('Enter an API key for authentication (leave blank to generate): ');
      const generatedApiKey = apiKey || `sk-${Math.random().toString(36).substring(2, 15)}`;
      
      const envContent = `PORT=3000
NODE_ENV=production
API_KEYS=${generatedApiKey}
DB_PATH=data/data.db
`;
      
      fs.writeFileSync('.env', envContent);
      console.log('✅ Created .env file');
      
      if (!apiKey) {
        console.log(`\n🔑 Generated API key: ${generatedApiKey}`);
        console.log('Keep this key secure and share it only with authorized clients.');
      }
    } else {
      console.log('✅ .env file already exists');
    }
    
    // Step 4: Check for data directory
    if (!fs.existsSync('data')) {
      console.log('Creating data directory...');
      fs.mkdirSync('data', { recursive: true });
      console.log('✅ Created data directory');
    } else {
      console.log('✅ data directory already exists');
    }
    
    // Final instructions
    console.log('\n✅ Preparation for Render deployment complete!');
    console.log('\nNext steps:');
    console.log('1. Push your code to GitHub');
    console.log('2. Go to https://render.com and create a new account if you don\'t have one');
    console.log('3. Click "New" and select "Blueprint"');
    console.log('4. Connect your GitHub repository');
    console.log('5. Render will detect the render.yaml file and configure your service');
    console.log('6. Add your API key as an environment variable in the Render dashboard');
    console.log('\nFor more detailed instructions, see render_deployment_guide.md');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    rl.close();
  }
};

// Run the main function
prepareForRender();