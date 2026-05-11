#!/usr/bin/env python3
"""Fail CI when two migration files share the same numeric prefix.

Scans every `NNN_*.sql` file under `migrations/` and prints a report.
Exit code 0 = all unique, 1 = duplicates found.

Usage:
    python3 scripts/check_migration_prefixes.py [migrations_dir]

Default dir is `migrations/` relative to the repo root. Designed to run
inside GitHub Actions without any external dependencies.
"""

from __future__ import annotations

import os
import re
import sys
from collections import defaultdict
from pathlib import Path

PATTERN = re.compile(r"^(\d{3,})_(.+)\.sql$")


def find_duplicates(migrations_dir: Path) -> dict[str, list[str]]:
    """Return {prefix: [filename, filename, ...]} for prefixes with ≥2 files."""
    by_prefix: dict[str, list[str]] = defaultdict(list)
    if not migrations_dir.is_dir():
        print(f"error: {migrations_dir} is not a directory", file=sys.stderr)
        sys.exit(2)
    for name in sorted(os.listdir(migrations_dir)):
        match = PATTERN.match(name)
        if not match:
            continue
        by_prefix[match.group(1)].append(name)
    return {prefix: files for prefix, files in by_prefix.items() if len(files) > 1}


def main(argv: list[str]) -> int:
    target = Path(argv[1]) if len(argv) > 1 else Path("migrations")
    duplicates = find_duplicates(target)
    if not duplicates:
        total = sum(1 for n in os.listdir(target) if PATTERN.match(n))
        print(f"OK: {total} migration files, all prefixes unique.")
        return 0

    print(f"FAIL: {len(duplicates)} duplicate migration prefix(es) found:")
    for prefix, files in sorted(duplicates.items()):
        print(f"  prefix {prefix}:")
        for name in files:
            print(f"    - migrations/{name}")
    print()
    print("Resolve by renaming all but one of the conflicting files to a new")
    print("unused prefix (next free integer or end-of-list).")
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
