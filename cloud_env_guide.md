# Environment Variables in Cloud Deployments for PunchAI MCP Server

This guide explains how to configure environment variables when deploying the PunchAI MCP Server to various cloud platforms.

## Introduction

When deploying your MCP server to a cloud platform, you'll need to configure environment variables to customize your server's behavior without modifying the code. Each cloud platform has its own way of managing environment variables.

## Heroku

### Setting Environment Variables

#### Using the Heroku CLI

```bash
# Set a single environment variable
heroku config:set API_KEYS=your-secret-key-1,your-secret-key-2

# Set multiple environment variables at once
heroku config:set NODE_ENV=production PORT=3000 RATE_LIMIT_MAX=100
```

#### Using the Heroku Dashboard

1. Go to your app in the Heroku Dashboard
2. Navigate to the "Settings" tab
3. Click "Reveal Config Vars"
4. Add your environment variables as key-value pairs

### Database Configuration

For Heroku deployments, you'll likely want to use a database add-on instead of SQLite:

```bash
# Add PostgreSQL to your Heroku app
heroku addons:create heroku-postgresql:hobby-dev

# Get the database URL
heroku config:get DATABASE_URL
```

Then update your code to use the `DATABASE_URL` environment variable that Heroku automatically sets:

```javascript
let db;
if (process.env.DATABASE_URL) {
  // Connect to PostgreSQL using the DATABASE_URL
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  // Use pool for database operations
} else {
  // Fall back to SQLite for local development
  db = new Database(process.env.DB_PATH || 'data.db');
}
```

## Railway

### Setting Environment Variables

1. Go to your project in the Railway dashboard
2. Click on your service
3. Go to the "Variables" tab
4. Add your environment variables as key-value pairs

Railway also supports `.env` files directly. You can upload your `.env` file through the dashboard.

### Database Configuration

Railway makes it easy to add a PostgreSQL database:

1. Click "New" and select "Database" → "PostgreSQL"
2. Railway will automatically add the database connection variables to your service

## Vercel

### Setting Environment Variables

#### Using the Vercel CLI

```bash
# Set environment variables for production
vercel env add API_KEYS production

# Set environment variables for all environments
vercel env add NODE_ENV all
```

#### Using the Vercel Dashboard

1. Go to your project in the Vercel dashboard
2. Navigate to the "Settings" tab
3. Click on "Environment Variables"
4. Add your environment variables and select which environments they apply to (Production, Preview, Development)

### Using vercel.json

You can also specify environment variables in your `vercel.json` file:

```json
{
  "env": {
    "NODE_ENV": "production",
    "PORT": "3000"
  },
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  }
}
```

## AWS Elastic Beanstalk

### Setting Environment Variables

#### Using the EB CLI

```bash
# Set environment variables
eb setenv NODE_ENV=production PORT=3000 API_KEYS=your-secret-key
```

#### Using the AWS Management Console

1. Go to your environment in the Elastic Beanstalk console
2. Navigate to "Configuration" → "Software"
3. Under "Environment properties", add your environment variables
4. Click "Apply"

### Using .ebextensions

You can also set environment variables using `.ebextensions` configuration files:

```yaml
# .ebextensions/env.config
option_settings:
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    PORT: 3000
    RATE_LIMIT_MAX: 100
```

## Google Cloud Run

### Setting Environment Variables

#### Using the gcloud CLI

```bash
gcloud run services update punchai-mcp-server \
  --set-env-vars NODE_ENV=production,PORT=8080 \
  --set-env-vars API_KEYS=your-secret-key
```

#### Using the Google Cloud Console

1. Go to Cloud Run in the Google Cloud Console
2. Select your service
3. Click "Edit & Deploy New Revision"
4. Under "Container, Networking, Security", expand "Variables & Secrets"
5. Add your environment variables
6. Click "Deploy"

### Using Secret Manager for Sensitive Data

For sensitive data like API keys, use Secret Manager:

```bash
# Create a secret
gcloud secrets create api-keys --data-file=./api-keys.txt

# Grant access to your Cloud Run service
gcloud secrets add-iam-policy-binding api-keys \
  --member=serviceAccount:your-service-account@appspot.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor

# Reference the secret in your Cloud Run service
gcloud run services update punchai-mcp-server \
  --set-secrets=API_KEYS=api-keys:latest
```

## Render

### Setting Environment Variables

#### Using the Render Dashboard

1. Go to your service in the Render dashboard
2. Navigate to the "Environment" tab
3. Click "Add Environment Variable"
4. Add your environment variables as key-value pairs
5. Click "Save Changes"

#### Using render.yaml

You can also specify environment variables in your `render.yaml` file:

```yaml
services:
  - type: web
    name: punchai-mcp-server
    env: node
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: API_KEYS
        # For sensitive values, use Render's environment variable UI
        sync: false
```

### Database Configuration

For Render deployments, you can use SQLite with a persistent disk or Render's PostgreSQL service:

#### Using SQLite with Persistent Disk

In your `render.yaml` file:

```yaml
services:
  - type: web
    # ... other configuration ...
    disk:
      name: data
      mountPath: /app/data
      sizeGB: 1
    envVars:
      - key: DB_PATH
        value: data/data.db
```

#### Using PostgreSQL

1. Create a PostgreSQL database in the Render dashboard
2. Render will automatically provide a `DATABASE_URL` environment variable
3. Update your code to use this variable:

```javascript
let db;
if (process.env.DATABASE_URL) {
  // Connect to PostgreSQL
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  // Use pool for database operations
} else {
  // Fall back to SQLite
  db = new Database(process.env.DB_PATH || 'data/data.db');
}
```

## DigitalOcean App Platform

### Setting Environment Variables

1. Go to your app in the DigitalOcean dashboard
2. Navigate to the "Settings" tab
3. Under "App-Level Environment Variables", click "Edit"
4. Add your environment variables
5. Click "Save"

### Using Environment Variables in Components

You can also set environment variables for specific components:

1. Go to your app in the DigitalOcean dashboard
2. Navigate to the "Components" tab
3. Click on your component
4. Under "Environment Variables", click "Edit"
5. Add your environment variables
6. Click "Save"

## Best Practices for Cloud Deployments

### 1. Use Different Values for Different Environments

Maintain separate environment variable sets for:
- Development
- Staging
- Production

### 2. Secure Sensitive Information

For sensitive data like API keys and database credentials:
- Use the cloud provider's secrets management service when available
- Never commit sensitive data to your repository
- Rotate credentials regularly

### 3. Set Fallback Values in Your Code

Always provide fallback values in your code for non-critical environment variables:

```javascript
const PORT = process.env.PORT || 3000;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
```

### 4. Document Required Environment Variables

Maintain documentation of all required environment variables:

```
# Required Environment Variables
API_KEYS - Comma-separated list of valid API keys
NODE_ENV - Environment mode (development, production)

# Optional Environment Variables
PORT - Server port (default: 3000)
RATE_LIMIT_MAX - Maximum requests per window (default: 100)
RATE_LIMIT_WINDOW_MS - Window size in milliseconds (default: 900000)
```

### 5. Validate Environment Variables on Startup

Add validation to ensure critical environment variables are set:

```javascript
function validateEnv() {
  const required = ['API_KEYS'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

// Call at startup
validateEnv();
```

## Conclusion

Properly configuring environment variables in cloud deployments is essential for secure and flexible operation of your PunchAI MCP Server. Each cloud platform offers its own tools for managing environment variables, but the principles remain the same: keep sensitive data secure, use appropriate values for each environment, and provide fallbacks for non-critical variables.