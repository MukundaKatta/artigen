#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const migrationsDir = path.join(__dirname, "..", "migrations");
const prefixPattern = /^(\d{3})_(.+)\.sql$/;
const requireDownFrom = Number(process.env.REQUIRE_DOWN_FROM || "51");
const downMarkerPattern = /^--\s*(down|rollback)\b/im;
const seen = new Map();
const prefixes = [];
const failures = [];

if (!Number.isInteger(requireDownFrom) || requireDownFrom < 1) {
  failures.push("REQUIRE_DOWN_FROM must be a positive integer");
}

for (const entry of fs.readdirSync(migrationsDir).sort()) {
  const match = entry.match(prefixPattern);
  if (!match) {
    failures.push(`Invalid migration filename: ${entry}`);
    continue;
  }

  const prefix = match[1];
  const prefixNumber = Number(prefix);
  const prior = seen.get(prefix);
  if (prior) {
    failures.push(`Duplicate migration prefix ${prefix}: ${prior} and ${entry}`);
    continue;
  }

  seen.set(prefix, entry);
  prefixes.push(prefixNumber);

  if (prefixNumber >= requireDownFrom) {
    const migrationPath = path.join(migrationsDir, entry);
    const migrationSql = fs.readFileSync(migrationPath, "utf8");

    if (!downMarkerPattern.test(migrationSql)) {
      failures.push(
        `Missing DOWN/rollback section in ${entry} (required for ${String(requireDownFrom).padStart(3, "0")} and later)`,
      );
    }
  }
}

const sortedPrefixes = [...prefixes].sort((a, b) => a - b);
for (let index = 0; index < sortedPrefixes.length; index += 1) {
  const expectedPrefix = index + 1;
  const actualPrefix = sortedPrefixes[index];

  if (actualPrefix !== expectedPrefix) {
    failures.push(
      `Migration prefixes must be contiguous: expected ${String(expectedPrefix).padStart(3, "0")} but found ${String(actualPrefix).padStart(3, "0")}`,
    );
    break;
  }
}

if (failures.length > 0) {
  console.error("Migration prefix check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Verified ${seen.size} contiguous migration prefixes in ${migrationsDir}; DOWN sections required from ${String(requireDownFrom).padStart(3, "0")}`,
);
