# Using Environment Variables with Docker for PunchAI MCP Server

This guide explains how to configure environment variables when deploying the PunchAI MCP Server using Docker.

## Introduction

When deploying your MCP server with Docker, you have several options for managing environment variables:

1. Using a `.env` file
2. Setting environment variables in `docker-compose.yml`
3. Passing environment variables directly to the `docker run` command

## Option 1: Using a .env File with Docker Compose

This is the recommended approach for development and production environments.

### Step 1: Create a .env file

Use one of the setup scripts to create your `.env` file:

```bash
# For Node.js script (cross-platform)
node scripts/setup-env.js

# For shell script (Linux/macOS)
./scripts/setup-env.sh

# For batch script (Windows)
scripts\setup-env.bat
```

Or manually create a `.env` file based on `.env.example`.

### Step 2: Configure docker-compose.yml

The `docker-compose.yml` file is already set up to use environment variables:

```yaml
version: '3.8'

services:
  mcp-server:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: punchai-mcp-server
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - API_KEYS=your-secret-key-1,your-secret-key-2
      - DB_PATH=data/data.db
    volumes:
      - ./data:/app/data
```

### Step 3: Use the .env file with Docker Compose

Docker Compose automatically loads variables from a `.env` file in the same directory as your `docker-compose.yml` file.

To start your server:

```bash
docker-compose up -d
```

## Option 2: Setting Environment Variables in docker-compose.yml

You can directly set environment variables in the `docker-compose.yml` file:

```yaml
services:
  mcp-server:
    # ...
    environment:
      - NODE_ENV=production
      - PORT=3000
      - API_KEYS=your-secret-key-1,your-secret-key-2
      - DB_PATH=data/data.db
      - RATE_LIMIT_MAX=100
      - RATE_LIMIT_WINDOW_MS=900000
```

This approach is convenient but has some drawbacks:
- Sensitive information like API keys is stored in the `docker-compose.yml` file
- You need to modify the file for different environments

## Option 3: Passing Environment Variables to docker run

For manual Docker deployments without Docker Compose, you can pass environment variables directly to the `docker run` command:

```bash
docker run -d \
  --name punchai-mcp-server \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e API_KEYS=your-secret-key-1,your-secret-key-2 \
  -e DB_PATH=data/data.db \
  -v $(pwd)/data:/app/data \
  punchai-mcp-server
```

## Using Environment Variables for Different Environments

You can create different `.env` files for different environments:

```bash
# Development environment
.env.development

# Production environment
.env.production

# Testing environment
.env.test
```

Then specify which file to use when starting Docker Compose:

```bash
# For development
docker-compose --env-file .env.development up -d

# For production
docker-compose --env-file .env.production up -d
```

## Environment Variables and Docker Secrets

For production deployments with sensitive information, consider using Docker Secrets instead of environment variables for sensitive data like API keys and database passwords.

### Step 1: Create a Docker Secret

```bash
echo "your-super-secret-api-key" | docker secret create api_key -
```

### Step 2: Use the Secret in docker-compose.yml

```yaml
version: '3.8'

services:
  mcp-server:
    # ...
    secrets:
      - api_key
    environment:
      - NODE_ENV=production
      - PORT=3000
      - USE_SECRETS=true

secrets:
  api_key:
    external: true
```

### Step 3: Modify Your Application to Read from Secrets

In your application code, you would need to read from the secrets file:

```javascript
let API_KEYS;
if (process.env.USE_SECRETS === 'true') {
  // Read from Docker secret
  API_KEYS = fs.readFileSync('/run/secrets/api_key', 'utf8').trim().split(',');
} else {
  // Read from environment variable
  API_KEYS = process.env.API_KEYS ? process.env.API_KEYS.split(',') : [];
}
```

## Environment Variables in the Dockerfile

The `Dockerfile` includes default environment variables:

```dockerfile
# Set environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    DB_PATH=data/data.db
```

These serve as fallbacks but will be overridden by values in:
1. The `.env` file (when using Docker Compose)
2. The `environment` section in `docker-compose.yml`
3. Variables passed with the `-e` flag to `docker run`

## Persistent Data with Volumes

The Docker setup includes a volume for persistent data storage:

```yaml
volumes:
  - ./data:/app/data
```

This ensures your database file persists across container restarts and updates. Make sure the `DB_PATH` environment variable points to a location within this volume (e.g., `data/data.db`).

## Troubleshooting

### Environment Variables Not Being Applied

If your environment variables aren't being applied:

1. Check the variable names for typos
2. Verify the `.env` file is in the same directory as `docker-compose.yml`
3. Try explicitly specifying the env file: `docker-compose --env-file .env up -d`
4. Check the container's environment: `docker exec punchai-mcp-server env`

### Database Connection Issues

If you're having database connection issues:

1. Ensure the database path is within a mounted volume
2. Check file permissions on the host directory
3. Verify the container can write to the specified location

## Conclusion

Properly configuring environment variables in Docker deployments is essential for secure and flexible operation of your PunchAI MCP Server. By following this guide, you can ensure your server is properly configured for different environments while maintaining security best practices.