/**
 * Example of loading environment variables in a Node.js application
 * 
 * This demonstrates different ways to load and use environment variables
 * in your application code.
 */

// Method 1: Using dotenv package (recommended)
// First, install dotenv: npm install dotenv
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Method 2: Manual loading (not recommended for production)
// This is just for demonstration purposes
const loadEnvManually = () => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Parse each line
    envContent.split('\n').forEach(line => {
      // Skip comments and empty lines
      if (line.startsWith('#') || !line.trim()) return;
      
      // Extract key and value
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
    
    console.log('Environment variables loaded manually');
  } catch (error) {
    console.error('Error loading .env file manually:', error.message);
  }
};

// Uncomment to use manual loading instead of dotenv
// loadEnvManually();

// Accessing environment variables
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const API_KEYS = process.env.API_KEYS ? process.env.API_KEYS.split(',') : [];
const DB_PATH = process.env.DB_PATH || 'data.db';

// Using environment variables with default values
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);

// Display loaded environment variables
console.log('Environment Variables:');
console.log('=====================');
console.log(`PORT: ${PORT}`);
console.log(`NODE_ENV: ${NODE_ENV}`);
console.log(`API_KEYS: ${API_KEYS.length} key(s) loaded`);
console.log(`DB_PATH: ${DB_PATH}`);
console.log(`RATE_LIMIT_MAX: ${RATE_LIMIT_MAX}`);
console.log(`RATE_LIMIT_WINDOW_MS: ${RATE_LIMIT_WINDOW_MS} (${RATE_LIMIT_WINDOW_MS / 60000} minutes)`);

// Example of conditional logic based on environment
if (NODE_ENV === 'development') {
  console.log('\nRunning in development mode');
  console.log('Additional debugging enabled');
} else if (NODE_ENV === 'production') {
  console.log('\nRunning in production mode');
  console.log('Performance optimizations enabled');
}

// Example of using API keys for authentication
const authenticateApiKey = (key) => {
  return API_KEYS.includes(key);
};

// Test authentication with a sample key
const testKey = API_KEYS.length > 0 ? API_KEYS[0] : 'no-keys-defined';
console.log(`\nAuthentication test with first key: ${authenticateApiKey(testKey)}`);

// Example of database connection based on environment variables
const connectToDatabase = () => {
  if (process.env.DB_TYPE === 'postgres') {
    console.log('\nConnecting to PostgreSQL database:');
    console.log(`Host: ${process.env.POSTGRES_HOST || 'localhost'}`);
    console.log(`Port: ${process.env.POSTGRES_PORT || '5432'}`);
    console.log(`Database: ${process.env.POSTGRES_DB || 'punchai'}`);
    // In a real application, you would connect to PostgreSQL here
  } else {
    console.log('\nConnecting to SQLite database:');
    console.log(`Path: ${DB_PATH}`);
    // In a real application, you would connect to SQLite here
  }
};

connectToDatabase();