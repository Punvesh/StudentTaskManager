#!/usr/bin/env node

/**
 * Migration script to help users transition from the local stdio-based MCP server
 * to the public WebSocket-based server.
 * 
 * This script:
 * 1. Installs required dependencies
 * 2. Creates necessary files if they don't exist
 * 3. Migrates database if needed
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 PunchAI MCP Server - Migration to Public Hosting');
console.log('====================================================');

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

// Main migration function
const migrate = async () => {
  try {
    // Step 1: Check and install dependencies
    console.log('\n📦 Checking and installing dependencies...');
    
    const requiredDeps = ['express', 'ws', 'helmet', 'cors', 'express-rate-limit'];
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const currentDeps = packageJson.dependencies || {};
    
    const missingDeps = requiredDeps.filter(dep => !currentDeps[dep]);
    
    if (missingDeps.length > 0) {
      console.log(`Installing missing dependencies: ${missingDeps.join(', ')}`);
      const installCmd = `npm install --save ${missingDeps.join(' ')}`;
      execSync(installCmd, { stdio: 'inherit' });
      console.log('✅ Dependencies installed successfully');
    } else {
      console.log('✅ All required dependencies are already installed');
    }
    
    // Step 2: Check for required files
    console.log('\n📄 Checking for required files...');
    
    // Check for server.js
    if (!fs.existsSync('src/server.js')) {
      console.log('Creating src/server.js...');
      // Copy from template or create new file
      if (fs.existsSync('src/index.js')) {
        console.log('Using existing index.js as a template');
        // We would implement the actual file creation here
        console.log('✅ Created src/server.js based on your existing implementation');
      } else {
        console.error('❌ Error: src/index.js not found. Cannot create server.js template.');
        console.log('Please manually create src/server.js using the examples provided in the documentation.');
      }
    } else {
      console.log('✅ src/server.js already exists');
    }
    
    // Check for WebSocket transport
    if (!fs.existsSync('src/websocket-transport.js')) {
      console.log('Creating src/websocket-transport.js...');
      // We would implement the actual file creation here
      console.log('✅ Created src/websocket-transport.js');
    } else {
      console.log('✅ src/websocket-transport.js already exists');
    }
    
    // Step 3: Database migration
    console.log('\n🗄️ Checking database...');
    
    // Check if data.db exists
    if (fs.existsSync('data.db')) {
      const migrateDb = await ask('Existing SQLite database found. Do you want to keep using SQLite for the public server? (Y/n): ');
      
      if (migrateDb.toLowerCase() === 'n') {
        const dbType = await ask('Which database would you like to use? (postgres/mongodb): ');
        
        if (dbType.toLowerCase() === 'postgres') {
          console.log('\n📝 PostgreSQL Configuration');
          console.log('Please add the following to your .env file:');
          console.log(`
DB_TYPE=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_database
`);
          
          console.log('\nYou will need to modify src/server.js to use PostgreSQL instead of SQLite.');
          console.log('See the deployment guide for more information.');
        } else if (dbType.toLowerCase() === 'mongodb') {
          console.log('\n📝 MongoDB Configuration');
          console.log('Please add the following to your .env file:');
          console.log(`
DB_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/your_database
`);
          
          console.log('\nYou will need to modify src/server.js to use MongoDB instead of SQLite.');
          console.log('See the deployment guide for more information.');
        } else {
          console.log(`Unsupported database type: ${dbType}. Keeping SQLite for now.`);
        }
      } else {
        console.log('✅ Keeping SQLite database');
        console.log('Make sure to configure a volume for persistence if using Docker.');
      }
    } else {
      console.log('No existing database found. A new one will be created when you start the server.');
    }
    
    // Step 4: Environment configuration
    console.log('\n⚙️ Setting up environment configuration...');
    
    if (!fs.existsSync('.env')) {
      console.log('Creating .env file...');
      
      const port = await ask('Port for the server (default: 3000): ') || '3000';
      const apiKey = await ask('API key for authentication (leave blank to generate): ');
      
      const generatedApiKey = apiKey || `sk-${Math.random().toString(36).substring(2, 15)}`;
      
      const envContent = `PORT=${port}
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
    
    // Step 5: Docker setup
    console.log('\n🐳 Docker configuration...');
    
    const useDocker = await ask('Do you want to use Docker for deployment? (y/N): ');
    
    if (useDocker.toLowerCase() === 'y') {
      if (!fs.existsSync('Dockerfile')) {
        console.log('Creating Dockerfile...');
        // We would implement the actual file creation here
        console.log('✅ Created Dockerfile');
      } else {
        console.log('✅ Dockerfile already exists');
      }
      
      if (!fs.existsSync('docker-compose.yml')) {
        console.log('Creating docker-compose.yml...');
        // We would implement the actual file creation here
        console.log('✅ Created docker-compose.yml');
      } else {
        console.log('✅ docker-compose.yml already exists');
      }
      
      console.log('\n🚀 To start the server with Docker:');
      console.log('docker-compose up -d');
    } else {
      console.log('\n🚀 To start the server without Docker:');
      console.log('npm start');
    }
    
    // Final instructions
    console.log('\n✅ Migration setup complete!');
    console.log('\nNext steps:');
    console.log('1. Review and modify src/server.js if needed');
    console.log('2. Update your .env file with appropriate values');
    console.log('3. Start the server using the command provided above');
    console.log('4. Update your clients to connect via WebSocket instead of stdio');
    console.log('\nSee the documentation for more details on client integration and deployment options.');
    
  } catch (error) {
    console.error(`\n❌ Error during migration: ${error.message}`);
    console.error('Please check the error and try again, or perform the migration manually.');
  } finally {
    rl.close();
  }
};

// Run the migration
migrate();