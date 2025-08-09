# Cursor MCP Setup Guide

## Issue: Tools Not Showing in Cursor

If your MCP server is connected successfully but no tools are showing up in Cursor, follow these troubleshooting steps:

### 1. Verify Server Configuration

Make sure your `cursor-mcp-config.json` file is correctly set up:

```json
{
  "mcpServers": {
    "punchai-task-manager": {
      "command": "node",
      "args": ["src/index.js"],
      "cwd": "D:\\punchai",
      "env": {
        "NODE_ENV": "production"
      },
      "description": "PunchAI Task Manager MCP Server"
    }
  }
}
```

### 2. Restart Cursor

After updating the configuration, completely restart Cursor:

1. Close Cursor completely
2. Wait a few seconds
3. Start Cursor again

### 3. Check Cursor MCP Settings

1. Open Cursor Settings (Ctrl/Cmd + ,)
2. Search for "MCP" or "Model Context Protocol"
3. Verify that your server is listed and enabled
4. Make sure the path to your working directory is correct

### 4. Check Cursor Logs

Look for any error messages in the Cursor logs related to MCP:

1. Open Cursor Developer Tools (Ctrl+Shift+I or Cmd+Option+I)
2. Go to the Console tab
3. Look for any errors related to MCP

### 5. Try Alternative Configuration

If the above steps don't work, try using the alternative configuration file:

1. Copy the contents of `mcp-config-alternative.json` to your Cursor MCP configuration
2. Restart Cursor

### 6. Verify Server is Running

Make sure your MCP server is running when you're using Cursor. You can start it manually with:

```bash
node src/index.js
```

### 7. Test with Claude Desktop

If you have Claude Desktop installed, you can test if the MCP server works with it using the `claude_desktop_config.json` configuration.

## Conclusion

The test script confirms that your MCP server is correctly registering tools. The issue is likely with how Cursor is connecting to the server or discovering the tools.