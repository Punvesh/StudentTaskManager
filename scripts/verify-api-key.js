#!/usr/bin/env node

/**
 * API Key Verification Tool for PunchAI MCP Server
 * 
 * This script checks if a given API key is valid by comparing it
 * against the API_KEYS defined in your .env file.
 * 
 * Usage:
 *   node verify-api-key.js <api-key>
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Get the current directory when using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env file not found. Please run setup-env.js first.');
    process.exit(1);
  }
  
  return dotenv.config({ path: envPath }).parsed;
}

// Get API keys from environment variables
function getApiKeys(env) {
  if (!env.API_KEYS) {
    console.error('Error: API_KEYS not defined in .env file.');
    process.exit(1);
  }
  
  return env.API_KEYS.split(',').map(key => key.trim());
}

// Verify if a key is valid
function verifyApiKey(key, validKeys) {
  return validKeys.includes(key);
}

// Main function
function main() {
  // Check if an API key was provided
  if (process.argv.length < 3) {
    console.error('Error: No API key provided.');
    console.log('Usage: node verify-api-key.js <api-key>');
    process.exit(1);
  }
  
  // Get the API key from command line arguments
  const apiKey = process.argv[2];
  
  try {
    // Load environment variables
    const env = loadEnv();
    
    // Get valid API keys
    const validKeys = getApiKeys(env);
    
    // Verify the provided API key
    const isValid = verifyApiKey(apiKey, validKeys);
    
    if (isValid) {
      console.log('✅ API key is valid!');
      process.exit(0);
    } else {
      console.log('❌ API key is invalid!');
      console.log(`The provided key does not match any of the ${validKeys.length} key(s) in your .env file.`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});