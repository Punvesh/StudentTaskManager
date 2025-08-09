#!/usr/bin/env node

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🔍 Testing MCP Server Connection");
console.log("=".repeat(50));

// Start the MCP server as a child process
const serverProcess = spawn("node", ["src/index.js"], {
  cwd: __dirname,
  stdio: ["pipe", "pipe", "pipe"]
});

let toolsFound = false;

serverProcess.stderr.on("data", (data) => {
  const log = data.toString().trim();
  console.log(`Server: ${log}`);
  
  if (log.includes("Available tools:")) {
    toolsFound = true;
    const toolsMatch = log.match(/Available tools: (.+)/);
    if (toolsMatch && toolsMatch[1]) {
      console.log(`\n✅ Tools found: ${toolsMatch[1]}`);
    }
  }
});

// Wait for server to start and then terminate
setTimeout(() => {
  if (!toolsFound) {
    console.log("\n❌ No tools were found in the server output!");
  }
  
  console.log("\n🧹 Cleaning up...");
  serverProcess.kill();
  process.exit(0);
}, 3000);