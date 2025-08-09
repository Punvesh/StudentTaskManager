#!/usr/bin/env node

/**
 * PunchAI Task Manager - Public MCP Server
 * 
 * This file implements a public-facing MCP server using WebSockets
 * instead of the stdio transport used in the original implementation.
 */

import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import Database from 'better-sqlite3';
import * as chrono from 'chrono-node';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebSocketTransport } from './websocket-transport.js';

// ----------------- Express App Setup -----------------
const app = express();
const server = http.createServer(app);

// Basic security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Simple API key authentication
const API_KEYS = process.env.API_KEYS ? process.env.API_KEYS.split(',') : ['test-key'];

app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || !API_KEYS.includes(apiKey)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// ----------------- Database Setup -----------------
const db = new Database(process.env.DB_PATH || 'data.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    due_date TEXT,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    category TEXT DEFAULT 'general',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// ----------------- MCP Server Init -----------------
const mcpServer = new McpServer({
  name: 'punchai-task-manager',
  version: '1.0.0'
});

console.log('✅ PunchAI MCP Server starting...');

// ----------------- Tool Registration -----------------

// List Tasks Tool
mcpServer.registerTool(
  'list_tasks',
  {
    description: 'List all tasks or filter by status/priority',
    parameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter tasks by status (pending, in_progress, completed)',
        },
        priority: {
          type: 'string',
          description: 'Filter tasks by priority (low, medium, high)',
        },
      },
    },
  },
  async (params) => {
    try {
      let query = 'SELECT * FROM tasks';
      const conditions = [];
      const queryParams = {};

      if (params.status) {
        conditions.push('status = :status');
        queryParams.status = params.status;
      }

      if (params.priority) {
        conditions.push('priority = :priority');
        queryParams.priority = params.priority;
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY created_at DESC';

      const stmt = db.prepare(query);
      const tasks = stmt.all(queryParams);

      return {
        tasks: tasks,
        count: tasks.length,
      };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }
);

// Add Task Tool
mcpServer.registerTool(
  'add_task',
  {
    description: 'Add a new task with title, description, priority, and due date',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Task title',
        },
        description: {
          type: 'string',
          description: 'Task description',
        },
        priority: {
          type: 'string',
          description: 'Task priority (low, medium, high)',
        },
        due_date: {
          type: 'string',
          description: 'Due date in natural language (e.g., "tomorrow", "next Friday")',
        },
        status: {
          type: 'string',
          description: 'Task status (pending, in_progress, completed)',
        },
      },
      required: ['title'],
    },
  },
  async (params) => {
    try {
      let dueDate = null;
      if (params.due_date) {
        const parsedDate = chrono.parseDate(params.due_date);
        if (parsedDate) {
          dueDate = parsedDate.toISOString();
        }
      }

      const stmt = db.prepare(`
        INSERT INTO tasks (title, description, priority, due_date, status)
        VALUES (:title, :description, :priority, :due_date, :status)
      `);

      const result = stmt.run({
        title: params.title,
        description: params.description || '',
        priority: params.priority || 'medium',
        due_date: dueDate,
        status: params.status || 'pending',
      });

      return {
        id: result.lastInsertRowid,
        message: 'Task added successfully',
      };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }
);

// Update Task Tool
mcpServer.registerTool(
  'update_task',
  {
    description: 'Update an existing task',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          description: 'Task ID to update',
        },
        title: {
          type: 'string',
          description: 'New task title',
        },
        description: {
          type: 'string',
          description: 'New task description',
        },
        priority: {
          type: 'string',
          description: 'New task priority (low, medium, high)',
        },
        status: {
          type: 'string',
          description: 'New task status (pending, in_progress, completed)',
        },
        due_date: {
          type: 'string',
          description: 'New due date in natural language',
        },
      },
      required: ['id'],
    },
  },
  async (params) => {
    try {
      // First check if the task exists
      const checkStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
      const task = checkStmt.get(params.id);

      if (!task) {
        return {
          error: `Task with ID ${params.id} not found`,
        };
      }

      // Build the update query dynamically based on provided fields
      const updates = [];
      const queryParams = { id: params.id };

      if (params.title !== undefined) {
        updates.push('title = :title');
        queryParams.title = params.title;
      }

      if (params.description !== undefined) {
        updates.push('description = :description');
        queryParams.description = params.description;
      }

      if (params.priority !== undefined) {
        updates.push('priority = :priority');
        queryParams.priority = params.priority;
      }

      if (params.status !== undefined) {
        updates.push('status = :status');
        queryParams.status = params.status;
      }

      if (params.due_date !== undefined) {
        let dueDate = null;
        if (params.due_date) {
          const parsedDate = chrono.parseDate(params.due_date);
          if (parsedDate) {
            dueDate = parsedDate.toISOString();
          }
        }
        updates.push('due_date = :due_date');
        queryParams.due_date = dueDate;
      }

      // Add updated_at timestamp
      updates.push('updated_at = CURRENT_TIMESTAMP');

      if (updates.length === 0) {
        return {
          message: 'No updates provided',
          id: params.id,
        };
      }

      const updateQuery = `UPDATE tasks SET ${updates.join(', ')} WHERE id = :id`;
      const updateStmt = db.prepare(updateQuery);
      updateStmt.run(queryParams);

      return {
        message: 'Task updated successfully',
        id: params.id,
      };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }
);

// Delete Task Tool
mcpServer.registerTool(
  'delete_task',
  {
    description: 'Delete a task by ID',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          description: 'Task ID to delete',
        },
      },
      required: ['id'],
    },
  },
  async (params) => {
    try {
      const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
      const result = stmt.run(params.id);

      if (result.changes === 0) {
        return {
          error: `Task with ID ${params.id} not found`,
        };
      }

      return {
        message: 'Task deleted successfully',
        id: params.id,
      };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }
);

console.log('✅ All tools registered successfully');

// ----------------- API Routes -----------------
// Simple health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'PunchAI MCP Server is running' });
});

// ----------------- Start Server -----------------
const transport = new WebSocketTransport(server);

try {
  console.log('🔄 Connecting to transport...');
  await mcpServer.connect(transport);
  console.log('✅ PunchAI MCP Server connected and ready!');
  console.log('📊 Available tools: add_task, list_tasks, update_task, delete_task');
  
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
} catch (error) {
  console.error(`❌ Failed to connect: ${error.message}`);
  process.exit(1);
}