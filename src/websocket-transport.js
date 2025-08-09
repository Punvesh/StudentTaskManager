/**
 * WebSocket Transport for Model Context Protocol
 * 
 * This file implements a WebSocket-based transport for the MCP server,
 * allowing it to be hosted publicly instead of using stdio transport.
 */

import { WebSocketServer } from 'ws';

/**
 * WebSocketTransport class that implements the necessary methods
 * to be compatible with the MCP server.
 */
export class WebSocketTransport {
  /**
   * Create a new WebSocketTransport instance
   * @param {Server} httpServer - The HTTP server instance to attach the WebSocket server to
   */
  constructor(httpServer) {
    this.wss = new WebSocketServer({ server: httpServer });
    this.connections = new Set();
    this.messageCallback = null;
    
    // Set up connection handling
    this.wss.on('connection', (ws) => {
      console.error('New client connected');
      this.connections.add(ws);
      
      // Handle incoming messages
      ws.on('message', (message) => {
        try {
          const parsedMessage = JSON.parse(message.toString());
          if (this.messageCallback) {
            // Pass the message to the MCP server and get the client for response
            this.messageCallback(parsedMessage, ws);
          }
        } catch (error) {
          console.error('Error processing message:', error);
          ws.send(JSON.stringify({
            error: 'Invalid message format'
          }));
        }
      });
      
      // Handle disconnection
      ws.on('close', () => {
        console.error('Client disconnected');
        this.connections.delete(ws);
      });
      
      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection_established',
        message: 'Connected to PunchAI MCP Server'
      }));
    });
  }
  
  /**
   * Set up the message handler callback
   * @param {Function} callback - Function to call when a message is received
   */
  onMessage(callback) {
    this.messageCallback = callback;
  }
  
  /**
   * Send a message to a specific client
   * @param {Object} message - The message to send
   * @param {WebSocket} client - The client to send the message to
   */
  send(message, client) {
    if (client && client.readyState === client.OPEN) {
      client.send(JSON.stringify(message));
    } else {
      console.error('Cannot send message: client not available or not open');
    }
  }
  
  /**
   * Broadcast a message to all connected clients
   * @param {Object} message - The message to broadcast
   */
  broadcast(message) {
    for (const client of this.connections) {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(message));
      }
    }
  }
  
  /**
   * Close all connections and shut down the WebSocket server
   */
  close() {
    for (const client of this.connections) {
      client.close();
    }
    this.connections.clear();
    this.wss.close();
  }
}