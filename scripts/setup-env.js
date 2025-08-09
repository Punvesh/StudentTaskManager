#!/usr/bin/env node

/**
 * Environment Setup Script for PunchAI MCP Server
 * 
 * This script helps users create and configure their .env file
 * with secure values for public hosting.
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import crypto from 'crypto';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask questions
const ask = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Function to generate a secure random API key
const generateApiKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Main function
const setupEnv = async () => {
  console.log('🔧 PunchAI MCP Server - Environment Setup');
  console.log('===========================================');
  
  // Check if .env already exists
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const overwrite = await ask('An .env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled. Existing .env file preserved.');
      rl.close();
      return;
    }
  }
  
  // Server configuration
  console.log('\n📡 Server Configuration');
  const port = await ask('Port number (default: 3000): ') || '3000';
  const nodeEnv = await ask('Node environment (production/development, default: production): ') || 'production';
  
  // Security configuration
  console.log('\n🔐 Security Configuration');
  console.log('API keys are used to authenticate clients connecting to your server.');
  const generateKey = await ask('Generate a secure random API key? (Y/n): ');
  
  let apiKeys = '';
  if (generateKey.toLowerCase() !== 'n') {
    const key = generateApiKey();
    console.log(`\nGenerated API key: ${key}`);
    apiKeys = key;
    
    const additionalKeys = await ask('Add additional API keys? (comma-separated, leave blank for none): ');
    if (additionalKeys.trim()) {
      apiKeys += ',' + additionalKeys;
    }
  } else {
    apiKeys = await ask('Enter API keys (comma-separated): ');
  }
  
  // Database configuration
  console.log('\n🗄️ Database Configuration');
  const dbType = await ask('Database type (sqlite/postgres, default: sqlite): ') || 'sqlite';
  
  let dbConfig = '';
  if (dbType.toLowerCase() === 'sqlite') {
    const dbPath = await ask('SQLite database path (default: data/data.db): ') || 'data/data.db';
    dbConfig = `# For SQLite\nDB_PATH=${dbPath}\n\n# For PostgreSQL (if using the PostgreSQL option)\n# DB_TYPE=postgres\n# POSTGRES_HOST=localhost\n# POSTGRES_PORT=5432\n# POSTGRES_USER=punchai\n# POSTGRES_PASSWORD=your-secure-password\n# POSTGRES_DB=punchai`;
  } else if (dbType.toLowerCase() === 'postgres') {
    const pgHost = await ask('PostgreSQL host (default: localhost): ') || 'localhost';
    const pgPort = await ask('PostgreSQL port (default: 5432): ') || '5432';
    const pgUser = await ask('PostgreSQL username: ');
    const pgPassword = await ask('PostgreSQL password: ');
    const pgDb = await ask('PostgreSQL database name: ');
    
    dbConfig = `# For SQLite\n# DB_PATH=data/data.db\n\n# For PostgreSQL\nDB_TYPE=postgres\nPOSTGRES_HOST=${pgHost}\nPOSTGRES_PORT=${pgPort}\nPOSTGRES_USER=${pgUser}\nPOSTGRES_PASSWORD=${pgPassword}\nPOSTGRES_DB=${pgDb}`;
  }
  
  // Rate limiting configuration
  console.log('\n⏱️ Rate Limiting Configuration');
  const rateLimitMax = await ask('Maximum requests per window (default: 100): ') || '100';
  const rateLimitWindow = await ask('Window size in milliseconds (default: 900000 - 15 minutes): ') || '900000';
  
  // Create the .env file content
  const envContent = `# Server Configuration\nPORT=${port}\nNODE_ENV=${nodeEnv}\n\n# Security\n# Comma-separated list of valid API keys\nAPI_KEYS=${apiKeys}\n\n# Database Configuration\n${dbConfig}\n\n# Rate Limiting\n# Maximum number of requests per window\nRATE_LIMIT_MAX=${rateLimitMax}\n# Window size in milliseconds\nRATE_LIMIT_WINDOW_MS=${rateLimitWindow}\n`;
  
  // Write the .env file
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ .env file created successfully!');
  console.log(`File location: ${envPath}`);
  
  // Create data directory if using SQLite
  if (dbType.toLowerCase() === 'sqlite') {
    const dbPathParts = dbConfig.match(/DB_PATH=([^\n]+)/)[1].split('/');
    dbPathParts.pop(); // Remove the filename
    
    if (dbPathParts.length > 0) {
      const dataDir = path.join(process.cwd(), ...dbPathParts);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log(`Created directory: ${dataDir}`);
      }
    }
  }
  
  console.log('\n🚀 Next steps:');
  console.log('1. Review your .env file to ensure all settings are correct');
  console.log('2. Start your server with: npm start');
  console.log('3. Keep your API keys secure and share them only with authorized clients');
  
  rl.close();
};

// Run the setup
setupEnv().catch(error => {
  console.error(`Error: ${error.message}`);
  rl.close();
});