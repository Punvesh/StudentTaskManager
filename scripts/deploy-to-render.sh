#!/bin/bash

# Helper script to prepare and deploy the PunchAI MCP Server to Render
# 
# This script:
# 1. Verifies the project is ready for deployment
# 2. Creates necessary configuration files if they don't exist
# 3. Provides instructions for deploying to Render

echo "🚀 PunchAI MCP Server - Render Deployment Helper"
echo "==============================================="

# Check if running from the project root
if [ ! -f "package.json" ]; then
  echo "❌ Error: Please run this script from the project root directory"
  exit 1
fi

# Step 1: Check for required files
echo -e "\n📄 Checking for required files..."

# Check for server.js
if [ ! -f "src/server.js" ]; then
  echo "❌ Error: src/server.js not found."
  echo "Please make sure you have migrated to the public WebSocket server."
  echo "Run: node scripts/migrate-to-public.js"
  exit 1
else
  echo "✅ src/server.js exists"
fi

# Check for websocket-transport.js
if [ ! -f "src/websocket-transport.js" ]; then
  echo "❌ Error: src/websocket-transport.js not found."
  echo "Please make sure you have migrated to the public WebSocket server."
  echo "Run: node scripts/migrate-to-public.js"
  exit 1
else
  echo "✅ src/websocket-transport.js exists"
fi

# Step 2: Check for render.yaml
if [ ! -f "render.yaml" ]; then
  echo "Creating render.yaml..."
  
  echo -n "Enter your GitHub repository URL (e.g., https://github.com/yourusername/punchai): "
  read REPO_URL
  
  if [ -z "$REPO_URL" ]; then
    REPO_URL="https://github.com/yourusername/punchai"
  fi
  
  cat > render.yaml << EOL
# Render deployment configuration for PunchAI MCP Server

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
    repo: ${REPO_URL}
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
EOL
  
  echo "✅ Created render.yaml"
else
  echo "✅ render.yaml already exists"
fi

# Step 3: Check for .env file
if [ ! -f ".env" ]; then
  echo "Creating .env file..."
  
  echo -n "Enter an API key for authentication (leave blank to generate): "
  read API_KEY
  
  if [ -z "$API_KEY" ]; then
    API_KEY="sk-$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 16 | head -n 1)"
  fi
  
  cat > .env << EOL
PORT=3000
NODE_ENV=production
API_KEYS=${API_KEY}
DB_PATH=data/data.db
EOL
  
  echo "✅ Created .env file"
  
  if [ -z "$API_KEY" ]; then
    echo -e "\n🔑 Generated API key: ${API_KEY}"
    echo "Keep this key secure and share it only with authorized clients."
  fi
else
  echo "✅ .env file already exists"
fi

# Step 4: Check for data directory
if [ ! -d "data" ]; then
  echo "Creating data directory..."
  mkdir -p data
  echo "✅ Created data directory"
else
  echo "✅ data directory already exists"
fi

# Final instructions
echo -e "\n✅ Preparation for Render deployment complete!"
echo -e "\nNext steps:"
echo "1. Push your code to GitHub"
echo "2. Go to https://render.com and create a new account if you don't have one"
echo "3. Click \"New\" and select \"Blueprint\""
echo "4. Connect your GitHub repository"
echo "5. Render will detect the render.yaml file and configure your service"
echo "6. Add your API key as an environment variable in the Render dashboard"
echo -e "\nFor more detailed instructions, see render_deployment_guide.md"