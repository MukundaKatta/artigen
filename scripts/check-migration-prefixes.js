#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const migrationsDir = path.join(__dirname, "..", "migrations");
const prefixPattern = /^(\d{3})_(.+)\.sql$/;
const seen = new Map();
const failures = [];

for (const entry of fs.readdirSync(migrationsDir).sort()) {
  const match = entry.match(prefixPattern);
  if (!match) {
    failures.push(`Invalid migration filename: ${entry}`);
    continue;
  }

  const prefix = match[1];
  const prior = seen.get(prefix);
  if (prior) {
    failures.push(`Duplicate migration prefix ${prefix}: ${prior} and ${entry}`);
    continue;
  }

  seen.set(prefix, entry);
}

if (failures.length > 0) {
  console.error("Migration prefix check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Verified ${seen.size} migration prefixes in ${migrationsDir}`);
