# Your AI Agent Just Silently Changed Its Mind. Here's How to Catch It.

> Snapshot tests for agents: lock in tool-call traces, fail CI when your agent reorders, drops, or rewrites its own playbook.

## The bug that doesn't crash anything

You ship an agent that researches a topic. Yesterday it called `search → fetch → summarize`. Today, after a prompt tweak you thought was harmless, it calls `search → search → search → summarize` — three search calls instead of one, no errors, no failing assertion, just a bigger bill at the end of the month.

This is the class of bug that traditional tests don't catch. Your unit tests pass. Your eval pipeline gives a thumbs-up because the final answer is still "correct." The thing that changed — the *shape* of the agent's tool use — is invisible to everything except your billing dashboard.

`agentsnap` is a snapshot testing library for AI agents that catches exactly this regression. It records ordered tool calls during execution, diffs them against a stored baseline, and fails your CI when the trace changes in ways you didn't sanction.

## What gets recorded

A snapshot is an ordered list of:

- Tool name
- Arguments passed
- SHA-256 hash of the result (so big payloads stay diffable)
- Any errors thrown
- A runtime fingerprint (model id, user input)

Diffs come back categorized — not just "this is different," but *how* it's different:

- `OUTPUT_DRIFT` — same tools, same args, different result hash
- `TOOLS_REORDERED` — same set, different sequence
- `TOOLS_CHANGED` — new tools added or old ones dropped
- `REGRESSION` — a tool that used to succeed now throws

You decide which of those should fail a test. A research agent that reorders calls probably warrants a review. A summarizer whose final hash drifted because the model nudged a word? Maybe acceptable.

## Five-minute setup

```javascript
import { record, traceTool, expectSnapshot } from '@mukundakatta/agentsnap';

const search = traceTool('search', async ({ q }) => fetchResults(q));
const summarize = traceTool('summarize', async ({ docs }) => llm(docs));

test('research agent stays on rails', async () => {
  const trace = await record(() => agent('What is RLHF?'));
  await expectSnapshot(trace, '__snapshots__/research.snap.json');
});
```

That's the entire integration. Wrap each tool with `traceTool()`, run your agent inside `record()`, and compare to a snapshot file checked into git.

Outside of a `record()` context, `traceTool()` is a transparent pass-through — so the same wrappers stay in your production code with zero overhead.

## Why `AsyncLocalStorage`

Agents fan out. They call tools concurrently, await streams, hop between async boundaries. `agentsnap` uses Node's `AsyncLocalStorage` so the trace context propagates correctly across those hops without you threading a context object through every call. If you've ever debugged a tracing system that lost half its spans, you'll appreciate this.

## Test-runner agnostic

Works with whatever you're already using: `node:test`, vitest, jest, playwright, mocha, tap, ava. The package exports plain functions and throws plain errors, so any runner that understands "a thrown exception means failure" can drive it.

## The CLI

For when you want to inspect or update snapshots outside a test runner:

- `agentsnap diff <baseline> <current>` — eyeball the change
- `agentsnap normalize <trace>` — clean up before commit
- `agentsnap update <test>` — accept a new baseline

The diff output is colored and structured by status code, so reviewing a snapshot change in a PR feels like reviewing a code diff, not parsing JSON.

## What it isn't

`agentsnap` isn't an evaluator. It doesn't score answer quality. It doesn't replace LLM-as-judge or golden-dataset evals. It's a behavioral check: *did your agent do the same things in the same order as last time?*

That makes it the cheap, fast layer of the testing pyramid. Run it on every PR. Catch the silent regressions before the expensive eval suite even kicks off.

## Status

- **v0.1.2**, stable core API
- **37 unit tests** passing on Node 20 / 22 / 24
- **Zero runtime dependencies**

Next on the roadmap: adapter packages for the Anthropic SDK, OpenAI SDK, and MCP clients, so you don't have to manually wrap tools with `traceTool()` at all — the adapter does it.

## Try it

```bash
npm install --save-dev @mukundakatta/agentsnap
```

Repo: <https://github.com/MukundaKatta/agentsnap>

If your agent's tool calls matter — and if you've ever shipped a "harmless" prompt change — give it a snapshot file. The next regression will tell on itself.

---

*agentsnap is part of agent-stack, a set of small, zero-dependency libraries for AI agent reliability: agentfit (message budgeting), agentguard (network firewall), agentvet (argument validation), agentcast (structured output), and agentsnap (snapshots).*
