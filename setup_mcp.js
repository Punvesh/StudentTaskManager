#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🔧 Setting up MCP Connection for Cursor");
console.log("=" .repeat(50));

console.log("📋 MCP Configuration:");
console.log("Server: punchai-task-manager");
console.log("Command: node src/index.js");
console.log("Working Directory: D:\\punchai");
console.log("");

console.log("📝 To enable MCP tools in Cursor:");
console.log("1. Open Cursor Settings (Ctrl/Cmd + ,)");
console.log("2. Search for 'MCP' or 'Model Context Protocol'");
console.log("3. Add the following configuration:");
console.log("   - Server Name: punchai-task-manager");
console.log("   - Command: node");
console.log("   - Arguments: src/index.js");
console.log("   - Working Directory: D:\\punchai");
console.log("4. Restart Cursor");
console.log("");

console.log("🔍 Testing MCP Server...");
const serverProcess = spawn('node', ['src/index.js'], {
  cwd: __dirname,
  stdio: ['pipe', 'pipe', 'pipe']
});

serverProcess.stderr.on('data', (data) => {
  const log = data.toString().trim();
  if (log.includes("✅ PunchAI MCP Server connected and ready!")) {
    console.log("✅ MCP Server is running correctly!");
    console.log("📊 Available tools: add_task, list_tasks, update_task, delete_task");
    serverProcess.kill();
  }
});

setTimeout(() => {
  console.log("⏰ MCP Server test completed");
  serverProcess.kill();
  process.exit(0);
}, 3000);



