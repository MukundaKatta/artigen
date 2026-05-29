# Stop Praying Your LLM Returns Valid JSON. Make It.

> agentcast wraps any LLM call with an extract-validate-retry loop. Bad JSON gets fed back to the model with the validator's error message. After N tries, it throws a structured exception you can act on.

## The "structured output" problem, honestly stated

You asked the model for JSON. You said please. You said "ONLY return JSON, no prose." You gave examples. You set the temperature to zero.

It returned this:

````
Sure! Here's the product data you requested:

```json
{
  "name": "Widget",
  "price": 19.99,
  "in_stock": true,
}
```

Let me know if you need anything else!
````

There's prose around it. There's a trailing comma. And tomorrow, with the exact same prompt, the model might return a YAML block instead. Your downstream parser doesn't care about any of this — it just throws.

You can paper over this with regex. Or model-specific structured-output APIs. Or function calling. They all help, none are universal, and they all leave you writing the same retry-with-feedback loop. `agentcast` is that loop.

## What it does

```javascript
const product = await cast({
  llm: async (messages) => /* your call here */,
  validate: adapters.zod(productSchema),
  prompt: 'Generate product data',
  maxRetries: 3
});
```

Three things happen inside `cast()`:

1. **Extract.** Strip prose, unwrap code fences, peel out the JSON-looking thing.
2. **Validate.** Run it through your schema (Zod, Valibot, JSON Schema, or a custom predicate).
3. **Retry with feedback.** If validation fails, send the model back its own output *plus the validator's error message* and ask again. Up to `maxRetries` times.

If all retries fail, you get a `CastError` with the full attempt history attached — every output the model produced, every validator error, in order. So when you debug, you see exactly where the model went off the rails.

## The validator you already have

`agentcast` doesn't ship its own schema language. Whatever you're using, it works:

- **Zod adapter** — `adapters.zod(schema)` works with anything that implements `safeParse()` (so Zod, Valibot, and lookalikes)
- **JSON Schema adapter** — bring your existing OpenAPI/JSON Schema definitions
- **Function adapter** — `adapters.fn((value) => ...)` for ad-hoc predicates
- **Shape adapter** — built-in, zero-dependency type checking when you don't want to add Zod just for this

Pick one and move on. You don't have to rewrite your validation layer to validate LLM output.

## Why retry-with-feedback works

The first retry is the magic one. The model that returned

```json
{ "price": "19.99" }
```

when you asked for a number will, on retry — when you tell it "expected number, got string at .price" — almost always come back with the number. Validators speak the model's language now. Use that.

The library packages this loop so you don't write it again every time.

## Extraction is the unsung hero

A surprising fraction of "the LLM returned bad JSON" is actually "the LLM returned good JSON wrapped in prose." `extractJson()` is exported standalone for exactly this case — give it any string and it'll find the JSON inside, whether it's bare, fenced, or buried in narration:

```javascript
import { extractJson } from '@mukundakatta/agentcast';

extractJson("Here's your data:\n```\n{\"x\":1}\n```\nLet me know!"); 
// → { x: 1 }
```

Useful even outside `cast()` — drop it after any raw model call.

## CLI for sanity-checking

Two subcommands:

- `agentcast extract` — pipe a raw model response in, get the extracted JSON out. Great for debugging.
- `agentcast validate` — pipe JSON + a schema, get validation results.

Run them on saved transcripts to figure out *why* the retry loop kept failing without burning more API credits.

## What it isn't

Not a model. Not a prompt library. Not a function-calling polyfill. If your provider already has reliable structured output (Anthropic's tool use, OpenAI's structured outputs), use it — and use `agentcast` only for the providers that don't, or for cross-provider code that needs one path.

Also: `agentcast` doesn't decide *what* schema you should use. That's still your design problem. It just makes sure whatever you decided actually shows up at runtime.

## Status

- **Zero runtime dependencies**
- TypeScript types included
- JavaScript/TypeScript (89% of codebase), works with any LLM SDK
- Stable core API

## Try it

```bash
npm install @mukundakatta/agentcast
```

Repo: <https://github.com/MukundaKatta/agentcast>

Stop praying. Wrap the call.

---

*Part of agent-stack: agentfit (message budgeting), agentsnap (snapshot tests), agentguard (network firewall), agentvet (argument validation), agentcast (this one). All zero-dependency utilities for production agent reliability.*
