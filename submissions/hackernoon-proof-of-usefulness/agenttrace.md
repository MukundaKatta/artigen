# Per-Step Cost and Latency Tracking for AI Agents in 26 Lines of Setup

> agenttrace wraps your LLM calls, captures cost and latency per step, and rolls them up per run. Built-in pricing for the major providers, AsyncLocalStorage so context follows your async hops, zero dependencies.

## The first question you'll be asked

Sometime after launching anything that uses an LLM in a loop, someone will ask: *what did the last run cost?*

The next question will be: *which step was expensive?*

If you can't answer in under thirty seconds with a real number, you don't have observability — you have hope. `agenttrace` is the minimum amount of code that makes both questions answerable.

## What you write

```javascript
import { withRun, measureLLM } from '@mukundakatta/agenttrace';

const { run, value } = await withRun({ name: 'summarize-doc' }, async () => {
  const reply = await measureLLM(
    'summarize',
    'claude-sonnet-4',
    async () => anthropic.messages.create({ /* ... */ }),
  );
  return reply.content[0].text;
});

console.log(run.summary());
// {
//   name: 'summarize-doc',
//   totalMs: 1842,
//   totalUsd: 0.0091,
//   steps: [
//     { name: 'summarize', ms: 1842, usd: 0.0091, model: 'claude-sonnet-4' }
//   ]
// }
```

That's the whole pitch. Wrap a run, wrap the calls inside it, get back a structured summary you can log, ship to a dashboard, or assert against in tests.

## Three primitives

**`withRun(options, fn)`** — Establishes a tracked context. Steps inside attach to it automatically via `AsyncLocalStorage`. Use `tags` for free-form labels (`{ env: 'prod', tenant: 'acme' }`) you'll want to filter on later.

**`measure(name, fn, options?)`** — Times any sync or async operation. Pass `model` if you want pricing applied, `tags` for filtering.

**`measureLLM(name, model, fn, options?)`** — Same as `measure`, but automatically extracts token usage from the response if your LLM SDK returns it in a recognizable shape.

For everything else, **`currentRun()`** lets you read the active run from anywhere downstream — handy when you're recording usage from inside a custom client wrapper.

## Pricing that ships with the library

Built-in tables for:

- **Anthropic** — Claude model family
- **OpenAI** — GPT-4 / o1 / o3 families
- **Google** — Gemini
- **xAI** — Grok
- **Free / local tiers** — Groq, Cerebras, Ollama, OpenRouter (priced at zero, but still time-tracked)

Pricing uses longest-prefix matching, so `claude-sonnet-4-20250514` and `claude-sonnet-4` both resolve to the same Sonnet 4 rate without per-version updates.

When the provider's pricing changes or you've negotiated custom rates:

```javascript
import { setPricing } from '@mukundakatta/agenttrace';

setPricing('claude-sonnet-4', { 
  inputPerMTok: 3.00, 
  outputPerMTok: 15.00,
  cacheReadPerMTok: 0.30, 
});
```

## Why AsyncLocalStorage matters here

Agents fan out. You call three tools in parallel. One of them streams. Another awaits a downstream service that itself has internal awaits. Threading a run object through every function is exhausting and brittle — and forgetting to thread it once means the step doesn't show up in the summary.

`AsyncLocalStorage` solves this. Steps automatically attach to the run that started in the currently-executing async context, no matter how deep the call stack goes or how many `await` boundaries it crosses. You'd notice if it *didn't* work — but because it does, the integration stays one wrapper at the entry point.

## Error tracking, while we're here

`measureLLM` and `measure` catch thrown errors, attach them to the step, and re-throw. The run summary then includes which step failed and why — without losing the timing data up to the point of failure. Half a billed run is still useful information.

## What this isn't

- Not a hosted observability platform. Run summaries are plain objects; ship them wherever you ship logs.
- Not a tracing protocol. If you want OpenTelemetry compatibility, wrap `measure` with an OTEL span — it's a few lines.
- Not a billing system. It computes call-level cost from token counts; it doesn't reconcile against your provider invoice (use that as a sanity check, though).

## Status

- **v0.1 pre-release**, installable directly from GitHub
- **26/26 tests passing**
- **Zero runtime dependencies**
- TypeScript types included
- Node 20+, ESM-only

## Installation

```bash
npm install github:MukundaKatta/agenttrace
```

(npm publish drops with v0.1.0.)

## Try it

Repo: <https://github.com/MukundaKatta/agenttrace>

The cheapest moment to add cost tracking is before your first surprise bill. Two wrappers, one summary, done.

---

*Part of agent-stack: agenttrace (this one) for observability, agentfit for message budgeting, agentguard for egress control, agentvet for argument validation, agentsnap for behavior snapshots, agentcast for structured output. All zero-dependency, all designed to compose.*
