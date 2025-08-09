# PunchAI MCP Server Deployment Guide

This guide provides instructions for deploying the PunchAI Task Manager MCP server to various hosting platforms.

## Prerequisites

Before deploying, ensure you have:

1. Node.js 18 or higher installed
2. Updated the project to use the WebSocket transport (see `public_hosting_guide.md`)
3. Installed the required dependencies with `npm install`

## Environment Variables

The public MCP server uses the following environment variables:

- `PORT`: The port to run the server on (default: 3000)
- `API_KEYS`: Comma-separated list of valid API keys (default: 'test-key')
- `DB_PATH`: Path to the SQLite database file (default: 'data.db')
- `NODE_ENV`: Set to 'production' for production deployments

## Deployment Options

### 1. Heroku

```bash
# Install Heroku CLI if you haven't already
npm install -g heroku

# Login to Heroku
heroku login

# Create a new Heroku app
heroku create punchai-mcp-server

# Set environment variables
heroku config:set API_KEYS=your-secret-key-1,your-secret-key-2
heroku config:set NODE_ENV=production

# Deploy to Heroku
git push heroku main

# Scale the dyno (optional)
heroku ps:scale web=1
```

**Note**: Since Heroku uses an ephemeral filesystem, the SQLite database will be reset when the dyno restarts. For production use, consider using a database add-on or a different database solution.

### 2. Render

Render provides a reliable platform for hosting Node.js applications with persistent storage options.

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure the service:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Plan**: Select an appropriate plan
4. Add environment variables in the Render dashboard
5. Configure a disk for persistent storage (mount at `/app/data`)

Alternatively, use the provided `render.yaml` file for Blueprint deployment:

```bash
# From the Render dashboard
1. Click "New" and select "Blueprint"
2. Connect your repository
3. Render will detect the render.yaml file and configure services
```

For detailed instructions, see the `render_deployment_guide.md` file.

### 3. Railway

1. Create a new project on [Railway](https://railway.app/)
2. Connect your GitHub repository
3. Add environment variables in the Railway dashboard
4. Deploy the application

### 3. DigitalOcean App Platform

1. Create a new app on [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform/)
2. Connect your GitHub repository
3. Configure the app with the following settings:
   - Build Command: `npm install`
   - Run Command: `npm start`
   - HTTP Port: 3000
4. Add environment variables
5. Deploy the application

### 4. AWS Elastic Beanstalk

```bash
# Install the EB CLI
pip install awsebcli

# Initialize EB application
eb init

# Create an environment
eb create punchai-mcp-server

# Set environment variables
eb setenv API_KEYS=your-secret-key-1,your-secret-key-2 NODE_ENV=production

# Deploy the application
eb deploy
```

### 5. Docker Deployment

Create a `Dockerfile` in the project root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]
```

Build and run the Docker container:

```bash
# Build the Docker image
docker build -t punchai-mcp-server .

# Run the container
docker run -p 3000:3000 -e API_KEYS=your-secret-key -e NODE_ENV=production punchai-mcp-server
```

## Database Considerations

### SQLite (Default)

The default configuration uses SQLite, which is suitable for low-traffic applications. However, SQLite has limitations:

- It's stored on the local filesystem, which can be problematic on platforms with ephemeral storage
- It doesn't handle high concurrency well
- It doesn't support distributed deployments

### Alternative Database Options

For production deployments, consider migrating to a more robust database:

1. **PostgreSQL**:
   - Install the `pg` package: `npm install pg`
   - Update the database connection code to use PostgreSQL
   - Use a managed PostgreSQL service (e.g., AWS RDS, DigitalOcean Managed Databases)

2. **MongoDB**:
   - Install the `mongodb` package: `npm install mongodb`
   - Update the database code to use MongoDB
   - Use MongoDB Atlas for managed MongoDB hosting

## Security Considerations

### HTTPS

Always use HTTPS in production. Most hosting platforms provide HTTPS by default, but if you're self-hosting:

1. Obtain an SSL certificate (e.g., from Let's Encrypt)
2. Configure your server to use HTTPS
3. Update the WebSocket connection to use WSS (WebSocket Secure)

### API Keys

The example implementation uses simple API key authentication. For production:

1. Use strong, randomly generated API keys
2. Implement proper key rotation and revocation
3. Consider using a more robust authentication system (JWT, OAuth) for sensitive applications

### Rate Limiting

The server includes basic rate limiting. Adjust the limits based on your expected traffic:

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Adjust this number based on your needs
});
```

## Monitoring and Logging

Implement proper monitoring and logging for production deployments:

1. **Application Logging**:
   - Install a logging package: `npm install winston`
   - Configure structured logging

2. **Error Tracking**:
   - Consider using Sentry or a similar service

3. **Performance Monitoring**:
   - Use New Relic, Datadog, or a similar service

## Client Integration

Clients will need to connect to your hosted MCP server using WebSockets. Provide them with:

1. The WebSocket URL (e.g., `wss://your-server.com`)
2. An API key for authentication
3. Documentation on available tools and parameters

See the `examples/client.js` file for a reference implementation.

## Conclusion

Deploying the PunchAI MCP server publicly requires careful consideration of security, scalability, and database management. Choose a hosting platform that meets your needs for reliability and ease of management.

For high-traffic or mission-critical applications, consider implementing additional security measures and using a more robust database solution than the default SQLite configuration.