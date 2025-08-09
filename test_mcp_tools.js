#!/usr/bin/env node

import { McpClient } from "@modelcontextprotocol/sdk/client/mcp.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🔍 Testing MCP Tools Availability");
console.log("=".repeat(50));

// Start the MCP server as a child process
const serverProcess = spawn("node", ["src/index.js"], {
  cwd: __dirname,
  stdio: ["pipe", "pipe", "pipe"]
});

serverProcess.stderr.on("data", (data) => {
  const log = data.toString().trim();
  console.log(`Server: ${log}`);
});

// Wait for server to start
setTimeout(async () => {
  try {
    console.log("\n📡 Connecting to MCP server...");
    
    // Create MCP client
    const transport = new StdioClientTransport({
      input: serverProcess.stdout,
      output: serverProcess.stdin
    });
    
    const client = new McpClient();
    await client.connect(transport);
    
    console.log("✅ Connected to MCP server");
    
    // Get available tools
    const tools = await client.getTools();
    console.log(`\n📊 Available tools: ${Object.keys(tools).join(", ")}`);
    
    if (Object.keys(tools).length === 0) {
      console.log("❌ No tools found! This indicates a problem with tool registration.");
    } else {
      console.log("\n🔍 Tool details:");
      for (const [name, tool] of Object.entries(tools)) {
        console.log(`  - ${name}: ${tool.description}`);
        console.log(`    Required params: ${tool.requiredParams?.join(", ") || "none"}`);
      }
      
      // Test list_tasks tool
      console.log("\n🧪 Testing list_tasks tool...");
      try {
        const result = await client.callTool("list_tasks", {});
        console.log("✅ list_tasks result:", result);
      } catch (error) {
        console.log("❌ list_tasks error:", error.message);
      }
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  } finally {
    console.log("\n🧹 Cleaning up...");
    serverProcess.kill();
    process.exit(0);
  }
}, 2000);