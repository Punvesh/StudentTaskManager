#!/usr/bin/env node

import Database from "better-sqlite3";
import * as chrono from "chrono-node";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// ----------------- Database Setup -----------------
const db = new Database("data.db");
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
const server = new McpServer({
  name: "punchai-task-manager",
  version: "1.0.0"
});

console.error("✅ PunchAI MCP Server starting...");

// ----------------- Register Tools -----------------

// List Tasks
server.registerTool(
  "list_tasks",
  {
    title: "List Tasks",
    description: "Get all tasks with optional status or priority filter.",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["pending", "completed"] },
        priority: { type: "string", enum: ["low", "medium", "high"] }
      },
      required: []
    }
  },
  async ({ status, priority }) => {
    try {
      let query = "SELECT * FROM tasks WHERE 1=1";
      const params = [];
      if (status) { query += " AND status = ?"; params.push(status); }
      if (priority) { query += " AND priority = ?"; params.push(priority); }
      query += " ORDER BY due_date ASC";

      const stmt = db.prepare(query);
      const tasks = stmt.all(...params);
      console.error(`✅ Listed ${tasks.length} tasks`);
      return { content: [{ type: "text", text: JSON.stringify(tasks) }] };
    } catch (error) {
      console.error(`❌ Error listing tasks: ${error.message}`);
      return {
        content: [{ type: "text", text: JSON.stringify({ success: false, error: error.message }) }],
        isError: true
      };
    }
  }
);

// Add Task
server.registerTool(
  "add_task",
  {
    title: "Add Task",
    description: "Create a new task with title, description, priority, and natural language due date.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        priority: { type: "string", enum: ["low", "medium", "high"] },
        due: { type: "string" }
      },
      required: ["title", "due"]
    }
  },
  async ({ title, description, priority, due }) => {
    try {
      const parsedDate = chrono.parseDate(due);
      const stmt = db.prepare(
        "INSERT INTO tasks (title, description, priority, due_date) VALUES (?, ?, ?, ?)"
      );
      const info = stmt.run(
        title,
        description || "",
        priority || "medium",
        parsedDate?.toISOString() || null
      );
      console.error(`✅ Task added: ${title} (ID: ${info.lastInsertRowid})`);
      return {
        content: [{ type: "text", text: JSON.stringify({ success: true, task_id: info.lastInsertRowid }) }]
      };
    } catch (error) {
      console.error(`❌ Error adding task: ${error.message}`);
      return {
        content: [{ type: "text", text: JSON.stringify({ success: false, error: error.message }) }],
        isError: true
      };
    }
  }
);

// Update Task
server.registerTool(
  "update_task",
  {
    title: "Update Task",
    description: "Update task details such as title, description, status, or priority.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "integer" },
        title: { type: "string" },
        description: { type: "string" },
        status: { type: "string", enum: ["pending", "completed"] },
        priority: { type: "string", enum: ["low", "medium", "high"] },
        due: { type: "string" }
      },
      required: ["id"]
    }
  },
  async (args) => {
    try {
      const fields = [];
      const params = [];
      if (args.title) { fields.push("title = ?"); params.push(args.title); }
      if (args.description) { fields.push("description = ?"); params.push(args.description); }
      if (args.status) { fields.push("status = ?"); params.push(args.status); }
      if (args.priority) { fields.push("priority = ?"); params.push(args.priority); }
      if (args.due) {
        const parsedDate = chrono.parseDate(args.due);
        fields.push("due_date = ?"); params.push(parsedDate?.toISOString() || null);
      }

      if (fields.length === 0) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: "No fields to update" }) }], isError: true };
      }

      params.push(args.id);
      const stmt = db.prepare(`UPDATE tasks SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
      const result = stmt.run(...params);
      console.error(`✅ Task ${args.id} updated (${result.changes} changes)`);
      return { content: [{ type: "text", text: JSON.stringify({ success: true, changes: result.changes }) }] };
    } catch (error) {
      console.error(`❌ Error updating task: ${error.message}`);
      return {
        content: [{ type: "text", text: JSON.stringify({ success: false, error: error.message }) }],
        isError: true
      };
    }
  }
);

// Delete Task
server.registerTool(
  "delete_task",
  {
    title: "Delete Task",
    description: "Remove a task by its ID.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "integer" }
      },
      required: ["id"]
    }
  },
  async ({ id }) => {
    try {
      const stmt = db.prepare("DELETE FROM tasks WHERE id = ?");
      const info = stmt.run(id);
      console.error(`✅ Task ${id} deleted (${info.changes} changes)`);
      return { content: [{ type: "text", text: JSON.stringify({ success: info.changes > 0 }) }] };
    } catch (error) {
      console.error(`❌ Error deleting task: ${error.message}`);
      return {
        content: [{ type: "text", text: JSON.stringify({ success: false, error: error.message }) }],
        isError: true
      };
    }
  }
);

console.error("✅ All tools registered successfully");

// ----------------- Start Server -----------------
const transport = new StdioServerTransport();

try {
  console.error("🔄 Connecting to transport...");
  await server.connect(transport);
  console.error("✅ PunchAI MCP Server connected and ready!");
  console.error("📊 Available tools: add_task, list_tasks, update_task, delete_task");
} catch (error) {
  console.error(`❌ Failed to connect: ${error.message}`);
  process.exit(1);
}




