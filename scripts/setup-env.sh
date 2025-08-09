#!/bin/bash

# Setup Environment Variables for PunchAI MCP Server (Linux/macOS)

echo "==================================================="
echo " PunchAI MCP Server - Environment Setup (Unix)   "
echo "==================================================="
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if .env file already exists
if [ -f ".env" ]; then
    echo "An .env file already exists."
    read -p "Do you want to overwrite it? (y/N): " OVERWRITE
    if [[ ! "$OVERWRITE" =~ ^[Yy]$ ]]; then
        echo "Setup cancelled. Existing .env file preserved."
        exit 0
    fi
fi

# Server Configuration
echo
echo "Server Configuration"
echo "-------------------"
read -p "Port number (default: 3000): " PORT
PORT=${PORT:-3000}

read -p "Node environment (production/development, default: production): " NODE_ENV
NODE_ENV=${NODE_ENV:-production}

# Security Configuration
echo
echo "Security Configuration"
echo "---------------------"
echo "API keys are used to authenticate clients connecting to your server."

read -p "Generate a secure random API key? (Y/n): " GENERATE_KEY
if [[ ! "$GENERATE_KEY" =~ ^[Nn]$ ]]; then
    # Generate a random API key
    API_KEY=$(openssl rand -hex 32)
    echo
    echo "Generated API key: $API_KEY"
    
    read -p "Add additional API keys? (comma-separated, leave blank for none): " ADDITIONAL_KEYS
    if [ -n "$ADDITIONAL_KEYS" ]; then
        API_KEYS="$API_KEY,$ADDITIONAL_KEYS"
    else
        API_KEYS="$API_KEY"
    fi
else
    read -p "Enter API keys (comma-separated): " API_KEYS
fi

# Database Configuration
echo
echo "Database Configuration"
echo "---------------------"
read -p "Database type (sqlite/postgres, default: sqlite): " DB_TYPE
DB_TYPE=${DB_TYPE:-sqlite}

if [[ "$DB_TYPE" =~ ^[Ss]qlite$ ]]; then
    read -p "SQLite database path (default: data/data.db): " DB_PATH
    DB_PATH=${DB_PATH:-data/data.db}
    
    # Create the data directory if it doesn't exist
    DB_DIR=$(dirname "$DB_PATH")
    if [ ! -d "$DB_DIR" ] && [ "$DB_DIR" != "." ]; then
        mkdir -p "$DB_DIR"
        echo "Created directory: $DB_DIR"
    fi
elif [[ "$DB_TYPE" =~ ^[Pp]ostgres$ ]]; then
    read -p "PostgreSQL host (default: localhost): " PG_HOST
    PG_HOST=${PG_HOST:-localhost}
    
    read -p "PostgreSQL port (default: 5432): " PG_PORT
    PG_PORT=${PG_PORT:-5432}
    
    read -p "PostgreSQL username: " PG_USER
    read -p "PostgreSQL password: " PG_PASSWORD
    read -p "PostgreSQL database name: " PG_DB
fi

# Rate Limiting Configuration
echo
echo "Rate Limiting Configuration"
echo "-------------------------"
read -p "Maximum requests per window (default: 100): " RATE_LIMIT_MAX
RATE_LIMIT_MAX=${RATE_LIMIT_MAX:-100}

read -p "Window size in milliseconds (default: 900000 - 15 minutes): " RATE_LIMIT_WINDOW
RATE_LIMIT_WINDOW=${RATE_LIMIT_WINDOW:-900000}

# Create the .env file
cat > .env << EOL
# Server Configuration
PORT=$PORT
NODE_ENV=$NODE_ENV

# Security
# Comma-separated list of valid API keys
API_KEYS=$API_KEYS

# Database Configuration
EOL

if [[ "$DB_TYPE" =~ ^[Ss]qlite$ ]]; then
    cat >> .env << EOL
# For SQLite
DB_PATH=$DB_PATH

# For PostgreSQL (if using the PostgreSQL option)
# DB_TYPE=postgres
# POSTGRES_HOST=localhost
# POSTGRES_PORT=5432
# POSTGRES_USER=punchai
# POSTGRES_PASSWORD=your-secure-password
# POSTGRES_DB=punchai
EOL
elif [[ "$DB_TYPE" =~ ^[Pp]ostgres$ ]]; then
    cat >> .env << EOL
# For SQLite
# DB_PATH=data/data.db

# For PostgreSQL
DB_TYPE=postgres
POSTGRES_HOST=$PG_HOST
POSTGRES_PORT=$PG_PORT
POSTGRES_USER=$PG_USER
POSTGRES_PASSWORD=$PG_PASSWORD
POSTGRES_DB=$PG_DB
EOL
fi

cat >> .env << EOL

# Rate Limiting
# Maximum number of requests per window
RATE_LIMIT_MAX=$RATE_LIMIT_MAX
# Window size in milliseconds
RATE_LIMIT_WINDOW_MS=$RATE_LIMIT_WINDOW
EOL

echo
echo "✅ .env file created successfully!"
echo "File location: $(pwd)/.env"

echo
echo "🚀 Next steps:"
echo "1. Review your .env file to ensure all settings are correct"
echo "2. Start your server with: npm start"
echo "3. Keep your API keys secure and share them only with authorized clients"

# Make the script executable if it wasn't already
chmod +x "$(dirname "$0")/setup-env.sh"