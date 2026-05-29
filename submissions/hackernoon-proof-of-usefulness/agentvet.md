# The Cheapest Way to Save Your AI Agent From Itself: Validate Tool Args Before You Run Them

> agentvet wraps tools with a schema and refuses to execute when the model passes garbage. The error message goes back to the model in a shape it can act on, so the *next* call works.

## The dumbest expensive bug

The model decided your `search` tool's `limit` parameter should be `"twenty"`. Or `null`. Or the entire user query. Maybe it dropped `query` altogether.

Without validation, your tool runs anyway. Best case it throws inside, with a stack trace the model can't use. Worst case it runs partway — sending a half-formed request to a paid API, hitting a database, charging a card, mutating state with a string where an integer should have been.

`agentvet` is the small layer between the model's tool call and your code that says: *not until the arguments are right.*

## The whole library in one example

```javascript
import { vet, adapters, ToolArgError } from '@mukundakatta/agentvet';
import { z } from 'zod';

const searchSchema = z.object({
  query: z.string(),
  limit: z.number().int().min(1).max(100),
});

const search = vet({
  name: 'search',
  schema: adapters.zod(searchSchema),
  fn: async ({ query, limit }) => doSearch(query, limit),
});
```

When the model calls `search({ query: 42 })`:

- The function body **doesn't run.**
- A `ToolArgError` is raised with structured field-level reasons.
- You hand the error back to the model. It rewrites the call. The next attempt works.

That last step is the one the library is built around. Validation errors aren't crashes — they're feedback the model can consume.

## Why this is different from "just use Zod"

You could call `schema.parse()` at the top of every tool function. People do. Three things go wrong:

1. **You forget on the seventh tool.** Boilerplate eventually leaks.
2. **The error format is wrong for LLMs.** A raw ZodError JSON-stringified into a chat message reads like noise. The model retries badly.
3. **You're locked to one validator.** Try to swap Zod for Valibot a year later and you're rewriting every tool.

`agentvet` solves all three:

- One wrapper, applied once per tool, enforced consistently.
- Errors shaped specifically for model retry loops — readable, actionable, with the failing field clearly named.
- Adapter layer so the validator is replaceable. Zod today, Valibot tomorrow, JSON Schema next year — same tool wrapper.

## The adapters

- **`adapters.zod(schema)`** — works with any library implementing `safeParse()` (Zod, Valibot, lookalikes)
- **`adapters.fn(predicate, errorBuilder?)`** — for one-off rules. `((args) => args.limit < 1000) ? ok : err`.
- **`adapters.shape(spec)`** — built-in, dependency-free type checker for when you don't want to pull in a schema library for a five-field tool

You can also call `validate(name, schema, args)` directly for one-shot validation without wrapping the function.

## The Anthropic SDK recipe

The README ships with a worked example for Anthropic's tool-use loop:

```javascript
// inside your tool dispatch
try {
  const result = await tools[name](args);
  return { type: 'tool_result', tool_use_id: id, content: result };
} catch (e) {
  if (e instanceof ToolArgError) {
    return {
      type: 'tool_result',
      tool_use_id: id,
      is_error: true,
      content: e.message,   // model-friendly explanation
    };
  }
  throw e;
}
```

`is_error: true` tells Claude the call failed in a recoverable way. The next assistant turn corrects the arguments. You've turned a bug into a retry — without an extra prompt, without custom parsing.

## The CLI

For batch testing tool definitions:

- `agentvet validate` — pipe in a JSON blob, see whether it'd pass
- `agentvet lint` — point at your tool definitions, get warnings about ambiguous schemas

Useful when you're tuning your tool spec and don't want to spin up the agent for every iteration.

## What it isn't

- Not a sandbox. Bad args get caught. Bad *execution* (the tool itself doing something wrong) is your problem.
- Not a permissions system. "Allowed to call this tool" is upstream of "called this tool with valid args."
- Not a full structured-output enforcer for the model's whole response — that's `agentcast`. `agentvet` is specifically for tool arguments.

## Status

- **v0.1.2**, stable core API
- **30/30 tests passing**
- **Zero runtime dependencies**
- TypeScript types included

Next on the roadmap (v0.2): auto-generate JSON Schema from validators so tool definitions stay in sync with code, per-tool retry budgets, telemetry hooks.

## Try it

```bash
npm install @mukundakatta/agentvet
```

Repo: <https://github.com/MukundaKatta/agentvet>

One wrapper. No more "the model passed a string where I expected a number" production incidents.

---

*Part of agent-stack: agentfit (message budgeting), agentsnap (snapshot tests), agentguard (network firewall), agentvet (this one), agentcast (structured output). Five small libraries, one zero-dependency theme.*
