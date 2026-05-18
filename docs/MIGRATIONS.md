# Migration Runbook

This project keeps database changes in `migrations/` and applies them in filename order.

## Naming

- Use `NNN_descriptive_name.sql`, where `NNN` is a zero-padded, unique, contiguous prefix.
- Never reuse a prefix. If the current last file is `050_trending_prompts.sql`, the next migration is `051_...sql`.
- Keep names lowercase with underscores.
- Run `npm run check:migrations` before opening a PR. CI runs the same check and fails duplicate, invalid, or non-contiguous prefixes.
- New migrations from `051` onward must include a `-- DOWN` or `-- Rollback` section in the file.

## Writing Migrations

- Prefer additive, idempotent SQL: `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`, and guarded policy/index creation where possible.
- Keep each migration focused on one product/backend change.
- Include the forward SQL first.
- Add a commented rollback section at the end. These files are raw SQL, so executable rollback statements must not run during a normal forward apply.
- The rollback should undo objects in reverse dependency order: triggers, policies, indexes, functions, columns, then tables.
- For destructive rollbacks, write the SQL but treat execution as an incident operation that requires a backup and owner approval.

Example shape:

```sql
-- Migration 051: Example feature
CREATE TABLE IF NOT EXISTS example_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid()
);

-- DOWN
-- Manual rollback:
-- DROP TABLE IF EXISTS example_items;
```

## Apply Procedure

Use a staging project first.

1. Confirm the target project and branch.
2. Run `npm run check:migrations`.
3. Back up production before any production apply.
4. Apply migrations in filename order through the Supabase CLI or SQL editor.
5. Verify changed tables, policies, triggers, functions, and app flows.
6. Regenerate or update `src/types/database.ts` when the live schema changes.

Supabase CLI examples:

```bash
supabase db push --project-ref "$SUPABASE_STAGING_PROJECT_REF"
supabase db push --project-ref "$SUPABASE_PROD_PROJECT_REF"
```

## Rollback Procedure

Rollbacks are manual SQL operations. Supabase does not automatically apply the `-- DOWN` section from these migration files.

1. Stop or pause the app path that depends on the failed migration when feasible.
2. Take a fresh backup or snapshot of the affected database.
3. Identify every migration applied after the target migration.
4. Apply rollback SQL in reverse filename order.
5. Verify dependent app behavior and database integrity.
6. Record exactly what ran and whether any data was intentionally dropped.

For migrations without a complete rollback section, derive the rollback from the forward SQL and test it on a restored staging copy before production use.

## Half-Applied Recovery

If a migration partially applies:

1. Do not rerun the full file immediately.
2. Inspect which objects exist:
   - tables and columns in `information_schema`
   - policies in `pg_policies`
   - functions in `pg_proc`
   - triggers in `information_schema.triggers`
3. Finish the missing idempotent statements or apply the rollback for the completed statements.
4. Convert any non-idempotent statement to a guarded form before retrying.
5. Rerun `npm run check:migrations` and document the recovery in the PR or incident notes.

## Current Backfill Status

- Duplicate prefixes have been cleaned up; the current set is contiguous from `001` through `050`.
- CI blocks duplicate and non-contiguous migration prefixes through `npm run check:migrations`.
- Rollback sections are required for new migrations from `051` onward.
- Legacy migrations `001` through `044` now include commented `-- DOWN` sections with manual rollback SQL.
- New rollback SQL should still be reviewed and tested on a restored staging copy before production use.
