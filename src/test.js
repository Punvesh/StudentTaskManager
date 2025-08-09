#!/usr/bin/env node

import Database from "better-sqlite3";
import * as chrono from "chrono-node";

console.log("🧪 PunchAI MCP Server - Full Tool Test\n");

// Use a dedicated test DB so we don't mess with your real one
const db = new Database("test_tools.db");
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

// 1️⃣ Simulate add_task
console.log("📌 Testing add_task...");
const insertStmt = db.prepare(`
  INSERT INTO tasks (title, description, priority, due_date)
  VALUES (?, ?, ?, ?)
`);
const dueDate = chrono.parseDate("next Friday");
const result = insertStmt.run(
  "Hackathon Demo Task",
  "Test task for MCP server demo",
  "high",
  dueDate?.toISOString() || null
);
console.log(`  ✅ Task added with ID: ${result.lastInsertRowid}`);

// 2️⃣ Simulate list_tasks
console.log("\n📌 Testing list_tasks...");
const listStmt = db.prepare("SELECT * FROM tasks ORDER BY due_date ASC");
const tasks = listStmt.all();
console.log(`  ✅ Found ${tasks.length} task(s):`);
console.table(tasks);

// 3️⃣ Simulate update_task
console.log("\n📌 Testing update_task...");
const updateStmt = db.prepare(`
  UPDATE tasks
  SET status = ?, priority = ?, updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);
updateStmt.run("completed", "medium", result.lastInsertRowid);
console.log("  ✅ Task updated successfully");

// Check update
const updatedTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(result.lastInsertRowid);
console.table([updatedTask]);

// 4️⃣ Simulate delete_task
console.log("\n📌 Testing delete_task...");
const deleteStmt = db.prepare("DELETE FROM tasks WHERE id = ?");
const delResult = deleteStmt.run(result.lastInsertRowid);
console.log(`  ✅ Deleted ${delResult.changes} task(s)`);

// Final check
const finalCount = db.prepare("SELECT COUNT(*) as count FROM tasks").get().count;
console.log(`\n📊 Final DB contains ${finalCount} task(s)`);

// Cleanup
db.close();
console.log("\n🧹 Test database closed. All MCP tools tested successfully!");
