#!/usr/bin/env node

/**
 * Quick API Key Generator for PunchAI MCP Server
 * 
 * A simple command-line utility to generate API keys without interactive prompts.
 * 
 * Usage:
 *   node quick-api-key.js [options]
 * 
 * Options:
 *   --count, -c     Number of keys to generate (default: 1)
 *   --length, -l    Length of each key in bytes (default: 32)
 *   --format, -f    Output format: text, json, env (default: text)
 *   --help, -h      Show help
 */

import crypto from 'crypto';

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    count: 1,
    length: 32,
    format: 'text'
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    } else if (arg === '--count' || arg === '-c') {
      options.count = parseInt(args[++i], 10) || 1;
    } else if (arg === '--length' || arg === '-l') {
      options.length = parseInt(args[++i], 10) || 32;
    } else if (arg === '--format' || arg === '-f') {
      options.format = args[++i] || 'text';
      if (!['text', 'json', 'env'].includes(options.format)) {
        console.error(`Invalid format: ${options.format}. Using 'text' instead.`);
        options.format = 'text';
      }
    }
  }

  return options;
}

// Show help message
function showHelp() {
  console.log(`
Quick API Key Generator for PunchAI MCP Server

Usage:
  node quick-api-key.js [options]

Options:
  --count, -c     Number of keys to generate (default: 1)
  --length, -l    Length of each key in bytes (default: 32)
  --format, -f    Output format: text, json, env (default: text)
  --help, -h      Show help

Examples:
  # Generate a single API key
  node quick-api-key.js

  # Generate 3 API keys
  node quick-api-key.js --count 3

  # Generate a 64-byte key in JSON format
  node quick-api-key.js --length 64 --format json

  # Generate keys in .env file format
  node quick-api-key.js --count 2 --format env
`);
}

// Generate a secure random API key
function generateApiKey(length) {
  return crypto.randomBytes(length).toString('hex');
}

// Main function
function main() {
  const options = parseArgs();
  
  // Generate keys
  const keys = [];
  for (let i = 0; i < options.count; i++) {
    keys.push(generateApiKey(options.length));
  }
  
  // Output based on format
  switch (options.format) {
    case 'json':
      console.log(JSON.stringify({
        keys: keys,
        count: keys.length,
        generated: new Date().toISOString()
      }, null, 2));
      break;
    
    case 'env':
      console.log(`# API Keys for PunchAI MCP Server`);
      console.log(`# Generated: ${new Date().toISOString()}`);
      console.log(`API_KEYS=${keys.join(',')}`);
      break;
    
    case 'text':
    default:
      if (keys.length === 1) {
        console.log(keys[0]);
      } else {
        keys.forEach((key, index) => {
          console.log(`Key ${index + 1}: ${key}`);
        });
      }
      break;
  }
}

// Run the main function
main();