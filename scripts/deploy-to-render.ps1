# Helper script to prepare and deploy the PunchAI MCP Server to Render
# 
# This script:
# 1. Verifies the project is ready for deployment
# 2. Creates necessary configuration files if they don't exist
# 3. Provides instructions for deploying to Render

Write-Host "🚀 PunchAI MCP Server - Render Deployment Helper" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Check if running from the project root
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Step 1: Check for required files
Write-Host ""
Write-Host "📄 Checking for required files..." -ForegroundColor Yellow

# Check for server.js
if (-not (Test-Path "src/server.js")) {
    Write-Host "❌ Error: src/server.js not found." -ForegroundColor Red
    Write-Host "Please make sure you have migrated to the public WebSocket server."
    Write-Host "Run: node scripts/migrate-to-public.js"
    exit 1
} else {
    Write-Host "✅ src/server.js exists" -ForegroundColor Green
}

# Check for websocket-transport.js
if (-not (Test-Path "src/websocket-transport.js")) {
    Write-Host "❌ Error: src/websocket-transport.js not found." -ForegroundColor Red
    Write-Host "Please make sure you have migrated to the public WebSocket server."
    Write-Host "Run: node scripts/migrate-to-public.js"
    exit 1
} else {
    Write-Host "✅ src/websocket-transport.js exists" -ForegroundColor Green
}

# Step 2: Check for render.yaml
if (-not (Test-Path "render.yaml")) {
    Write-Host "Creating render.yaml..." -ForegroundColor Yellow
    
    $repoUrl = Read-Host "Enter your GitHub repository URL (e.g., https://github.com/yourusername/punchai)"
    
    if ([string]::IsNullOrEmpty($repoUrl)) {
        $repoUrl = "https://github.com/yourusername/punchai"
    }
    
    $renderYaml = @"
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
    repo: $repoUrl
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
"@
    
    Set-Content -Path "render.yaml" -Value $renderYaml
    Write-Host "✅ Created render.yaml" -ForegroundColor Green
} else {
    Write-Host "✅ render.yaml already exists" -ForegroundColor Green
}

# Step 3: Check for .env file
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    
    $apiKey = Read-Host "Enter an API key for authentication (leave blank to generate)"
    
    if ([string]::IsNullOrEmpty($apiKey)) {
        # Generate a random API key
        $random = [System.Random]::new()
        $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        $apiKey = "sk-" + -join (1..16 | ForEach-Object { $chars[$random.Next(0, $chars.Length)] })
    }
    
    $envContent = @"
PORT=3000
NODE_ENV=production
API_KEYS=$apiKey
DB_PATH=data/data.db
"@
    
    Set-Content -Path ".env" -Value $envContent
    Write-Host "✅ Created .env file" -ForegroundColor Green
    
    if ([string]::IsNullOrEmpty($apiKey)) {
        Write-Host ""
        Write-Host "🔑 Generated API key: $apiKey" -ForegroundColor Yellow
        Write-Host "Keep this key secure and share it only with authorized clients."
    }
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Step 4: Check for data directory
if (-not (Test-Path "data")) {
    Write-Host "Creating data directory..." -ForegroundColor Yellow
    New-Item -Path "data" -ItemType Directory | Out-Null
    Write-Host "✅ Created data directory" -ForegroundColor Green
} else {
    Write-Host "✅ data directory already exists" -ForegroundColor Green
}

# Final instructions
Write-Host ""
Write-Host "✅ Preparation for Render deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Push your code to GitHub"
Write-Host "2. Go to https://render.com and create a new account if you don't have one"
Write-Host "3. Click \"New\" and select \"Blueprint\""
Write-Host "4. Connect your GitHub repository"
Write-Host "5. Render will detect the render.yaml file and configure your service"
Write-Host "6. Add your API key as an environment variable in the Render dashboard"
Write-Host ""
Write-Host "For more detailed instructions, see render_deployment_guide.md" -ForegroundColor Yellow