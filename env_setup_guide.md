# Environment Variables Setup Guide for PunchAI MCP Server

## Introduction

This guide explains how to set up and use environment variables for the PunchAI MCP Server when hosting it publicly. Environment variables allow you to configure your server without hardcoding sensitive information in your source code.

## Creating the .env File

1. Copy the `.env.example` file to create your own `.env` file:

   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your preferred text editor:

   ```bash
   notepad .env   # Windows
   # or
   nano .env      # Linux/macOS
   ```

## Available Environment Variables

### Server Configuration

```
PORT=3000
NODE_ENV=production
```

- `PORT`: The port number on which the server will listen (default: 3000)
- `NODE_ENV`: The environment mode (development, production, test)

### Security

```
API_KEYS=your-secret-key-1,your-secret-key-2
```

- `API_KEYS`: Comma-separated list of valid API keys for authentication
  - Generate strong, random keys for production use
  - Clients must include one of these keys in the `X-API-Key` header when connecting

### Database Configuration

#### For SQLite (Default)

```
DB_PATH=data/data.db
```

- `DB_PATH`: Path to the SQLite database file
  - Ensure this directory exists and is writable
  - For Docker deployments, this should point to a volume path

#### For PostgreSQL (Optional)

Uncomment and configure these if you're using PostgreSQL instead of SQLite:

```
DB_TYPE=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=punchai
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=punchai
```

### Rate Limiting

```
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
```

- `RATE_LIMIT_MAX`: Maximum number of requests allowed per window
- `RATE_LIMIT_WINDOW_MS`: Time window in milliseconds (default: 15 minutes)

## How Environment Variables Are Used

The server.js file reads these environment variables to configure various aspects of the server:

1. **API Key Authentication**:
   ```javascript
   const API_KEYS = process.env.API_KEYS ? process.env.API_KEYS.split(',') : ['test-key'];
   
   app.use((req, res, next) => {
     const apiKey = req.headers['x-api-key'];
     if (!apiKey || !API_KEYS.includes(apiKey)) {
       return res.status(401).json({ error: 'Unauthorized' });
     }
     next();
   });
   ```

2. **Database Connection**:
   ```javascript
   const db = new Database(process.env.DB_PATH || 'data.db');
   ```

3. **Server Port**:
   ```javascript
   const PORT = process.env.PORT || 3000;
   server.listen(PORT, () => {
     console.log(`🚀 Server running on port ${PORT}`);
   });
   ```

## Setting Environment Variables in Different Environments

### Local Development

The `.env` file is automatically loaded when you start the server with:

```bash
npm start
```

### Docker

When using Docker, you can set environment variables in the `docker-compose.yml` file:

```yaml
services:
  mcp-server:
    # ...
    environment:
      - NODE_ENV=production
      - PORT=3000
      - API_KEYS=your-secret-key-1,your-secret-key-2
      - DB_PATH=data/data.db
```

Or when running a Docker container directly:

```bash
docker run -p 3000:3000 -e API_KEYS=your-secret-key -e NODE_ENV=production punchai-mcp-server
```

### Cloud Hosting

Most cloud platforms provide a way to set environment variables:

- **Heroku**: Use the Heroku CLI or dashboard
  ```bash
  heroku config:set API_KEYS=your-secret-key-1,your-secret-key-2
  ```

- **Vercel**: Configure in the Vercel dashboard or `vercel.json`

- **Railway**: Set in the Railway dashboard

- **AWS Elastic Beanstalk**:
  ```bash
  eb setenv API_KEYS=your-secret-key-1,your-secret-key-2
  ```

## Security Best Practices

1. **Never commit your `.env` file to version control**
   - The `.gitignore` file already excludes `.env`
   - Only commit `.env.example` with placeholder values

2. **Use strong, randomly generated API keys**
   - You can use a tool like `openssl` to generate secure keys:
     ```bash
     openssl rand -hex 32
     ```

3. **Rotate API keys periodically**
   - Update the `API_KEYS` environment variable with new keys
   - Inform clients of the key rotation schedule

4. **Use different keys for different environments**
   - Development, staging, and production should have separate keys

## Troubleshooting

### Environment Variables Not Loading

If your environment variables aren't being loaded:

1. Ensure the `.env` file is in the project root directory
2. Check file permissions
3. Verify the file format (no spaces around `=` signs)
4. Try loading them manually in your code:
   ```javascript
   require('dotenv').config();
   ```

### API Key Authentication Failing

If API key authentication is failing:

1. Check that the key is correctly set in the `API_KEYS` environment variable
2. Verify the client is sending the key in the `X-API-Key` header
3. Check for whitespace or special characters in the key

## Conclusion

Properly configuring environment variables is essential for securely deploying your PunchAI MCP Server. By following this guide, you can ensure your server is properly configured for your specific environment while maintaining security best practices.