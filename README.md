# PunchAI Task Manager MCP Server for Cursor

This is a Model Context Protocol (MCP) server that provides task management tools for Cursor AI. The server allows you to create, list, update, and delete tasks using natural language commands.

## Features

- **Add Task**: Create new tasks with title, description, priority, and due date
- **List Tasks**: View all tasks with optional filtering by status or priority
- **Update Task**: Modify existing task details
- **Delete Task**: Remove tasks by ID

## Setup Instructions

### Prerequisites

- Node.js installed
- Cursor AI installed

### Installation

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
```

3. Run the setup script to verify everything is working:

```bash
node setup_mcp.js
```

### Configure Cursor

1. Open Cursor Settings (Ctrl/Cmd + ,)
2. Search for 'MCP' or 'Model Context Protocol'
3. Add the following configuration:
   - Server Name: `punchai-task-manager`
   - Command: `node`
   - Arguments: `src/index.js`
   - Working Directory: `D:\punchai` (adjust to your actual path)
4. Restart Cursor

## Usage

Once configured, you can use the following tools in Cursor AI:

### Add Task

```
Add a task to finish the project report by next Friday with high priority
```

### List Tasks

```
Show me all my pending tasks
```

### Update Task

```
Mark task 3 as completed
```

### Delete Task

```
Delete task 2
```

## Testing

You can run the test script to verify all tools are working correctly:

```bash
node src/test.js
```

## Troubleshooting

If you encounter issues:

1. Make sure all dependencies are installed
2. Verify the path in Cursor settings matches your actual installation path
3. Check the console output for any error messages
4. Restart Cursor after making configuration changes

## Files

- `src/index.js`: Main MCP server implementation
- `setup_mcp.js`: Setup and verification script
- `src/test.js`: Test script for all tools
- `mcp-config-alternative.json`: Configuration file for MCP server