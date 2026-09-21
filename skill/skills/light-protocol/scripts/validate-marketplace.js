#!/usr/bin/env node

/**
 * Ensures every marketplace plugin points at a directory that exists and
 * contains SKILL.md. Prevents broken Claude Code / plugin installs when
 * entries are added before skill content lands (or vice versa).
 */

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const marketplacePath = path.join(root, ".claude-plugin", "marketplace.json");

function main() {
  let raw;
  try {
    raw = fs.readFileSync(marketplacePath, "utf8");
  } catch (e) {
    console.error(`Cannot read ${marketplacePath}:`, e.message);
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error("Invalid JSON in marketplace.json:", e.message);
    process.exit(1);
  }

  if (!Array.isArray(data.plugins)) {
    console.error("marketplace.json: missing or invalid plugins array");
    process.exit(1);
  }

  const names = new Set();
  let failed = false;

  for (const plugin of data.plugins) {
    if (!plugin || typeof plugin.name !== "string" || !plugin.name) {
      console.error("Invalid plugin entry (missing name):", plugin);
      failed = true;
      continue;
    }
    if (names.has(plugin.name)) {
      console.error(`Duplicate plugin name: ${plugin.name}`);
      failed = true;
    }
    names.add(plugin.name);

    if (typeof plugin.source !== "string" || !plugin.source.startsWith("./")) {
      console.error(`${plugin.name}: source must be a string starting with ./`);
      failed = true;
      continue;
    }

    const rel = plugin.source.slice(2);
    const skillDir = path.join(root, rel);
    const skillMd = path.join(skillDir, "SKILL.md");

    if (!fs.existsSync(skillDir) || !fs.statSync(skillDir).isDirectory()) {
      console.error(`${plugin.name}: missing directory ${plugin.source}`);
      failed = true;
      continue;
    }
    if (!fs.existsSync(skillMd)) {
      console.error(`${plugin.name}: missing ${path.join(plugin.source, "SKILL.md")}`);
      failed = true;
    }
  }

  if (failed) {
    process.exit(1);
  }

  console.log(`OK: ${data.plugins.length} marketplace plugins validated`);
}

main();
