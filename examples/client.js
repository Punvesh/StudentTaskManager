/**
 * Example client for connecting to the public PunchAI MCP server
 * 
 * This demonstrates how to connect to the WebSocket-based MCP server
 * and make tool calls to manage tasks.
 */

import WebSocket from 'ws';

// Configuration
const SERVER_URL = process.env.SERVER_URL || 'ws://localhost:3000';
const API_KEY = process.env.API_KEY || 'test-key';

// Create a unique client ID
const CLIENT_ID = `client-${Math.random().toString(36).substring(2, 10)}`;

// Connect to the MCP server
const connectToServer = () => {
  console.log(`Connecting to ${SERVER_URL}...`);
  
  // Create WebSocket connection with API key in headers
  const ws = new WebSocket(SERVER_URL, {
    headers: {
      'X-API-Key': API_KEY
    }
  });
  
  // Set up event handlers
  ws.on('open', () => {
    console.log('Connected to MCP server');
    // Example: List all tasks when connected
    callTool(ws, 'list_tasks', {});
  });
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Received message:', JSON.stringify(message, null, 2));
      
      // Handle different message types
      if (message.type === 'connection_established') {
        console.log('Connection established:', message.message);
      } else if (message.type === 'tool_response') {
        console.log(`Tool response for ${message.tool}:`, message.result);
        
        // Example: After listing tasks, add a new task
        if (message.tool === 'list_tasks') {
          setTimeout(() => {
            callTool(ws, 'add_task', {
              title: 'Example task from client',
              description: 'This task was created by the example client',
              priority: 'high',
              due_date: 'tomorrow at 5pm'
            });
          }, 1000);
        }
        
        // Example: After adding a task, list tasks again to see the new task
        if (message.tool === 'add_task') {
          setTimeout(() => {
            callTool(ws, 'list_tasks', {});
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
  
  ws.on('close', (code, reason) => {
    console.log(`Connection closed: ${code} - ${reason}`);
    console.log('Reconnecting in 5 seconds...');
    setTimeout(connectToServer, 5000);
  });
  
  return ws;
};

/**
 * Call a tool on the MCP server
 * @param {WebSocket} ws - The WebSocket connection
 * @param {string} tool - The tool name to call
 * @param {object} params - The parameters for the tool
 */
const callTool = (ws, tool, params) => {
  if (ws.readyState !== WebSocket.OPEN) {
    console.error('Cannot call tool: WebSocket is not open');
    return;
  }
  
  const message = {
    type: 'tool_call',
    client_id: CLIENT_ID,
    tool,
    params
  };
  
  console.log(`Calling tool ${tool} with params:`, params);
  ws.send(JSON.stringify(message));
};

// Start the client
connectToServer();

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down client...');
  process.exit(0);
});