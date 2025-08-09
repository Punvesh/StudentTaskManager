# Deploying PunchAI MCP Server to Render

This guide provides step-by-step instructions for deploying the PunchAI Task Manager MCP server to Render.com.

## Prerequisites

Before deploying to Render, ensure you have:

1. A [Render account](https://render.com)
2. Your PunchAI MCP Server code in a Git repository (GitHub, GitLab, etc.)
3. Updated the project to use the WebSocket transport (see `public_hosting_guide.md`)

## Deployment Options

Render offers two main ways to deploy your Node.js application:

1. **Web Service**: For the MCP server with WebSocket support
2. **PostgreSQL Database**: Optional, for more robust data storage than SQLite

## Step 1: Prepare Your Repository

Ensure your repository includes the following files:

- `render.yaml` - Deployment configuration (provided in this project)
- `Dockerfile` - Container configuration (already included)
- `.env.example` - Template for environment variables

If you're using the provided `render.yaml`, make sure to update the repository URL to your actual repository.

## Step 2: Deploy to Render

### Option A: Using the Dashboard

1. Log in to your Render dashboard
2. Click **New** and select **Web Service**
3. Connect your repository
4. Configure the service:
   - **Name**: `punchai-mcp-server` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Plan**: Select an appropriate plan (Starter is good for testing)
5. Add environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
   - `API_KEYS`: Your secret API keys (comma-separated)
   - `DB_PATH`: `data/data.db`
   - `RATE_LIMIT_MAX`: `100`
   - `RATE_LIMIT_WINDOW_MS`: `900000`
6. Configure a disk for persistent storage:
   - Click **Advanced** and scroll to **Disks**
   - Add a disk with mount path `/app/data` and appropriate size (1GB is sufficient for most use cases)
7. Click **Create Web Service**

### Option B: Using render.yaml (Blueprint)

1. Log in to your Render dashboard
2. Click **New** and select **Blueprint**
3. Connect your repository
4. Render will automatically detect the `render.yaml` file and configure services accordingly
5. Review the configuration and click **Apply**
6. Add any sensitive environment variables (like `API_KEYS`) through the Render dashboard

## Step 3: Database Configuration

### Using SQLite (Default)

The default configuration uses SQLite with a persistent disk. This works well for low to moderate traffic applications.

### Using PostgreSQL (Recommended for Production)

For production deployments, consider using Render's PostgreSQL service:

1. In your Render dashboard, click **New** and select **PostgreSQL**
2. Configure your database:
   - **Name**: `punchai-postgres` (or your preferred name)
   - **Database**: `punchai`
   - **User**: `punchai`
   - **Plan**: Select an appropriate plan
3. Click **Create Database**
4. Once created, Render will provide a `DATABASE_URL` environment variable
5. Add this environment variable to your web service
6. Update your code to use PostgreSQL when `DATABASE_URL` is present:

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

## Step 4: Verify Deployment

1. Once deployed, Render will provide a URL for your service (e.g., `https://punchai-mcp-server.onrender.com`)
2. Test the WebSocket connection using the example client:

```javascript
// Update examples/client.js with your Render URL
const SERVER_URL = 'wss://punchai-mcp-server.onrender.com';
const API_KEY = 'your-api-key';

// Run the client
node examples/client.js
```

3. Check the health endpoint in your browser: `https://punchai-mcp-server.onrender.com/health`

## Troubleshooting

### WebSocket Connection Issues

If you're having trouble connecting via WebSocket:

1. Ensure you're using `wss://` (WebSocket Secure) in your client, not `ws://`
2. Verify your API key is correctly set in both the server and client
3. Check the server logs in the Render dashboard for any errors

### Database Persistence Issues

If your data isn't persisting:

1. Verify the disk is correctly mounted at `/app/data`
2. Check that `DB_PATH` is set to a path within the mounted disk
3. Consider switching to PostgreSQL for more robust data storage

## Scaling Considerations

### Free and Starter Plans

Render's free and starter plans have some limitations:

- Free plans will spin down after periods of inactivity
- Limited resources may affect performance under heavy load

### Production Deployments

For production use:

1. Choose a Standard or higher plan for better performance and reliability
2. Use PostgreSQL instead of SQLite
3. Consider implementing a caching layer if needed
4. Set up monitoring and logging

## Conclusion

Render provides a straightforward way to deploy your PunchAI MCP Server with persistent storage and optional PostgreSQL integration. The platform handles HTTPS, scaling, and provides a reliable environment for your WebSocket-based MCP server.

For high-traffic or mission-critical applications, consider the Standard or higher plans and implement additional security measures as outlined in the main deployment guide.