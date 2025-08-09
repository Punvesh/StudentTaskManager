#!/usr/bin/env node

/**
 * API Key Rotation Tool for PunchAI MCP Server
 * 
 * This script helps you rotate API keys by replacing old keys with new ones
 * in your .env file. This is a security best practice to perform regularly.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import readline from 'readline';
import { fileURLToPath } from 'url';

// Get the current directory when using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask questions
function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Function to generate a secure random API key
function generateApiKey() {
  return crypto.randomBytes(32).toString('hex');
}

// Function to load the .env file
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    throw new Error('.env file not found. Please run setup-env.js first.');
  }
  
  return {
    path: envPath,
    content: fs.readFileSync(envPath, 'utf8')
  };
}

// Function to extract API keys from .env content
function extractApiKeys(envContent) {
  const match = envContent.match(/API_KEYS=([^\r\n]+)/);
  
  if (!match || !match[1]) {
    throw new Error('API_KEYS not found in .env file.');
  }
  
  return match[1].split(',').map(key => key.trim());
}

// Function to update the .env file with new keys
function updateEnvFile(envPath, envContent, oldKeys, newKeys) {
  // Create a mapping of old keys to new keys
  const keyMap = {};
  oldKeys.forEach((oldKey, index) => {
    keyMap[oldKey] = newKeys[index] || generateApiKey();
  });
  
  // Replace the API_KEYS line in the .env file
  const updatedContent = envContent.replace(
    /API_KEYS=([^\r\n]+)/,
    `API_KEYS=${Object.values(keyMap).join(',')}`
  );
  
  // Write the updated content back to the .env file
  fs.writeFileSync(envPath, updatedContent);
  
  return keyMap;
}

// Function to create a backup of the .env file
function backupEnvFile(envPath, envContent) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${envPath}.backup-${timestamp}`;
  
  fs.writeFileSync(backupPath, envContent);
  
  return backupPath;
}

// Main function
async function main() {
  console.log('🔄 PunchAI MCP Server - API Key Rotation Tool');
  console.log('===========================================');
  
  try {
    // Load the .env file
    const env = loadEnvFile();
    
    // Extract current API keys
    const currentKeys = extractApiKeys(env.content);
    
    console.log(`Found ${currentKeys.length} API key(s) in your .env file.`);
    
    // Ask for confirmation
    const confirm = await ask('Do you want to rotate these keys? This will replace them with new keys. (y/N): ');
    
    if (confirm.toLowerCase() !== 'y') {
      console.log('Operation cancelled.');
      rl.close();
      return;
    }
    
    // Create a backup of the .env file
    const backupPath = backupEnvFile(env.path, env.content);
    console.log(`Created backup of .env file at: ${backupPath}`);
    
    // Generate new keys
    const newKeys = currentKeys.map(() => generateApiKey());
    
    // Update the .env file
    const keyMap = updateEnvFile(env.path, env.content, currentKeys, newKeys);
    
    console.log('\n✅ API keys have been rotated successfully!');
    console.log('\nKey Rotation Map (for reference):');
    console.log('-------------------------------');
    
    Object.entries(keyMap).forEach(([oldKey, newKey]) => {
      console.log(`Old: ${oldKey.substring(0, 8)}...${oldKey.substring(oldKey.length - 8)}`);
      console.log(`New: ${newKey}`);
      console.log('-------------------------------');
    });
    
    console.log('\n⚠️ Important: Update all clients using these API keys!');
    console.log('The old keys will no longer work for authentication.');
    
    // Ask if user wants to see the full key mapping
    const showFull = await ask('\nShow full key mapping? (y/N): ');
    
    if (showFull.toLowerCase() === 'y') {
      console.log('\nFull Key Mapping:');
      console.log('-------------------------------');
      
      Object.entries(keyMap).forEach(([oldKey, newKey]) => {
        console.log(`Old: ${oldKey}`);
        console.log(`New: ${newKey}`);
        console.log('-------------------------------');
      });
    }
    
    console.log('\n🔒 Remember to update all clients with the new API keys!');
  } catch (error) {
    console.error(`Error: ${error.message}`);
  } finally {
    rl.close();
  }
}

// Run the main function
main().catch(error => {
  console.error(`Error: ${error.message}`);
  rl.close();
});