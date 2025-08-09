#!/usr/bin/env node

/**
 * API Key Generator for PunchAI MCP Server
 * 
 * This script generates secure API keys that can be used with
 * the PunchAI MCP Server for authentication.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

// Get the current directory when using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to generate a secure random API key
function generateApiKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Function to ask questions
function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Main function
async function main() {
  console.log('🔑 PunchAI MCP Server - API Key Generator');
  console.log('=========================================');
  
  // Generate a key
  const key = generateApiKey();
  console.log(`\nGenerated API key: ${key}`);
  
  // Ask if user wants to generate more keys
  const generateMore = await ask('\nGenerate additional keys? (y/N): ');
  let numKeys = '0';
  let additionalKeys = [];
  
  if (generateMore.toLowerCase() === 'y') {
    numKeys = await ask('How many additional keys? ');
    const count = parseInt(numKeys, 10) || 1;
    
    console.log('\nAdditional API keys:');
    for (let i = 0; i < count; i++) {
      const additionalKey = generateApiKey();
      additionalKeys.push(additionalKey);
      console.log(`${i + 1}. ${additionalKey}`);
    }
  }
  
  // Ask if user wants to update .env file
  const updateEnv = await ask('\nUpdate .env file with the new key(s)? (y/N): ');
  
  if (updateEnv.toLowerCase() === 'y') {
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    let existingKeys = [];
    
    // Check if .env file exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      
      // Extract existing API keys
      const apiKeysMatch = envContent.match(/API_KEYS=([^\n]+)/);
      if (apiKeysMatch && apiKeysMatch[1]) {
        existingKeys = apiKeysMatch[1].split(',');
        console.log(`Found ${existingKeys.length} existing API key(s) in .env file.`);
      }
      
      const action = await ask('Add to existing keys or replace them? (add/replace): ');
      
      if (action.toLowerCase() === 'add') {
        // Add the new key(s) to existing ones
        existingKeys.push(key);
        
        if (additionalKeys.length > 0) {
        // Add all the additional keys that were generated
        additionalKeys.forEach(key => {
          existingKeys.push(key);
        });
        }
        
        // Update the API_KEYS line in the .env file
        envContent = envContent.replace(
          /API_KEYS=([^\n]+)/, 
          `API_KEYS=${existingKeys.join(',')}`
        );
      } else {
        // Replace existing keys with new ones
        let newKeys = [key];
        
        if (additionalKeys.length > 0) {
          // Add all the additional keys that were generated
          additionalKeys.forEach(key => {
            newKeys.push(key);
          });
        }
        
        // Update the API_KEYS line in the .env file
        envContent = envContent.replace(
          /API_KEYS=([^\n]+)/, 
          `API_KEYS=${newKeys.join(',')}`
        );
      }
      
      // Write the updated content back to the .env file
      fs.writeFileSync(envPath, envContent);
      console.log(`Updated API keys in ${envPath}`);
    } else {
      console.log('No .env file found. Creating a new one with minimal configuration.');
      
      let newKeys = [key];
      if (additionalKeys.length > 0) {
        // Add all the additional keys that were generated
        additionalKeys.forEach(key => {
          newKeys.push(key);
        });
      }
      
      // Create a minimal .env file
      const minimalEnv = `# Server Configuration\nPORT=3000\nNODE_ENV=production\n\n# Security\n# Comma-separated list of valid API keys\nAPI_KEYS=${newKeys.join(',')}\n\n# For more configuration options, run the full setup script:\n# node scripts/setup-env.js\n`;
      
      fs.writeFileSync(envPath, minimalEnv);
      console.log(`Created new .env file with API keys at ${envPath}`);
    }
  }
  
  console.log('\n🔐 Remember to keep your API keys secure!');
  console.log('They should only be shared with authorized clients.');
  
  rl.close();
}

// Run the main function
main().catch(error => {
  console.error(`Error: ${error.message}`);
  rl.close();
});