# PunchAI Task Manager - Public MCP Server

A Model Context Protocol (MCP) server for task management, designed for public hosting with WebSocket transport.

## Features

- Task management with CRUD operations
- WebSocket-based MCP server for public hosting
- API key authentication
- Rate limiting and security features
- SQLite database (with option to use PostgreSQL)
- Docker support for easy deployment

## Prerequisites

- Node.js 18 or higher
- npm or yarn

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/punchai.git
cd punchai

# Install dependencies
npm install

# Copy environment variables example file
cp .env.example .env

# Edit the .env file with your configuration
nano .env
```

## Configuration

Edit the `.env` file to configure your server:

```
# Server Configuration
PORT=3000
NODE_ENV=production

# Security
# Comma-separated list of valid API keys
API_KEYS=your-secret-key-1,your-secret-key-2

# Database Configuration
DB_PATH=data/data.db
```

## Running the Server

### Development Mode

```bash
# Start the server in development mode
npm run dev
```

### Production Mode

```bash
# Start the server in production mode
npm start
```

### Using Docker

```bash
# Build and start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the server
docker-compose down
```

## Available Tools

The MCP server provides the following tools:

### 1. `list_tasks`

List all tasks or filter by status/priority.

**Parameters:**
- `status` (optional): Filter tasks by status (pending, in_progress, completed)
- `priority` (optional): Filter tasks by priority (low, medium, high)

**Example:**
```json
{
  "type": "tool_call",
  "tool": "list_tasks",
  "params": {
    "status": "pending",
    "priority": "high"
  }
}
```

### 2. `add_task`

Add a new task with title, description, priority, and due date.

**Parameters:**
- `title` (required): Task title
- `description` (optional): Task description
- `priority` (optional): Task priority (low, medium, high)
- `due_date` (optional): Due date in natural language (e.g., "tomorrow", "next Friday")
- `status` (optional): Task status (pending, in_progress, completed)

**Example:**
```json
{
  "type": "tool_call",
  "tool": "add_task",
  "params": {
    "title": "Complete project documentation",
    "description": "Write comprehensive documentation for the project",
    "priority": "high",
    "due_date": "next Friday at 5pm"
  }
}
```

### 3. `update_task`

Update an existing task.

**Parameters:**
- `id` (required): Task ID to update
- `title` (optional): New task title
- `description` (optional): New task description
- `priority` (optional): New task priority (low, medium, high)
- `status` (optional): New task status (pending, in_progress, completed)
- `due_date` (optional): New due date in natural language

**Example:**
```json
{
  "type": "tool_call",
  "tool": "update_task",
  "params": {
    "id": 1,
    "status": "completed",
    "priority": "medium"
  }
}
```

### 4. `delete_task`

Delete a task by ID.

**Parameters:**
- `id` (required): Task ID to delete

**Example:**
```json
{
  "type": "tool_call",
  "tool": "delete_task",
  "params": {
    "id": 1
  }
}
```

## Client Integration

Clients can connect to the MCP server using WebSockets. See the `examples/client.js` file for a reference implementation.

```javascript
// Example client connection
const ws = new WebSocket('ws://localhost:3000', {
  headers: {
    'X-API-Key': 'your-api-key'
  }
});

// Example tool call
ws.send(JSON.stringify({
  type: 'tool_call',
  tool: 'list_tasks',
  params: {}
}));
```

## Deployment

See the `deployment_guide.md` file for detailed instructions on deploying the MCP server to various hosting platforms.

## Security Considerations

- Always use HTTPS/WSS in production
- Use strong, randomly generated API keys
- Consider implementing more robust authentication for sensitive applications
- Regularly update dependencies to patch security vulnerabilities

## License

ISC