# Pull-Model Memory for LLM Agents: An Honest Alternative to "AI Dreaming"

> agentmemory is an append-only episodic store with real deletes, on-demand summarization that you control, and a drift watcher that tells you when retrieval quality slips. No background consolidation. No silent context injection.

## What this is reacting to

Recent "agent memory" frameworks promised something seductive: a background process that consolidates your agent's interactions overnight, distilling them into a higher-level memory the agent draws from later. The pitch sounds like sleep, like dreaming, like emergent intelligence.

In practice, it means:

- A process you don't see running, rewriting your data
- Summaries injected into context without an audit trail
- "Deletes" that leave behind derived artifacts you can't find
- A retrieval layer whose quality changes between sessions for reasons you can't trace

`agentmemory` was built as the honest version of this. **Pull-model, not push-model.** You ask for memory when you need it. The system tells you exactly what it returned and where it came from. When you delete something, it's gone — not summarized into a derivative.

## Three components, each doing one thing

### 1. `EpisodicStore` — the append-only event log

Every interaction is an event. Sessions are sequences of events. Embeddings are computed at write time if you've configured an embedder; otherwise retrieval falls back to keyword matching.

The thing it does differently: **deletes are real.** A `delete()` call removes the row. No tombstones. No "soft delete" flag. No derived embedding still floating in a separate index. If you set a retention policy, expired events leave the system entirely.

Production-grade backing store: `PostgresEpisodicStore`, which uses real SQL `DELETE` operations. The default in-memory store is for development and tests.

### 2. `OnDemandSummarizer` — context built when you ask, not before

You hand the summarizer your LLM (any LLM — the library is framework-agnostic and brings none of its own). When you call `summarize(session_id)`, it:

1. Pulls the relevant events from the store
2. Sends them to your LLM with the prompt you control
3. Returns the summary **alongside the event IDs it used and the exact prompt it sent**

That last bit is the whole point. There's no silent context injection. If the summary surprises you, you can see exactly which events fed it and exactly how they were framed. You can replay the call. You can attribute every claim.

### 3. `MemoryDriftWatcher` — alarms for quality decay

Retrieval quality slips over time as your corpus grows, as embedding distributions shift, as your query patterns evolve. The watcher uses a sliding window of recent retrieval scores and alerts when the mean drops past your threshold.

This is the catch-it-before-the-user-does layer. You don't need a separate monitoring stack — just wire the alert callback into wherever your operational alerts already go.

## The five rules

The library enforces, in code:

1. **No background consolidation.** Nothing runs except when you call it.
2. **Real deletes.** No tombstones, no derived artifacts.
3. **Caller-driven summarization.** You decide when, with what prompt, using what LLM.
4. **Full trace transparency.** Every retrieval and summary returns its inputs.
5. **Framework-agnostic LLM.** Bring your own. Anthropic, OpenAI, local, whatever.

Five rules, under 500 lines of code, all auditable in a single sitting.

## What this looks like

```javascript
import { EpisodicStore, OnDemandSummarizer, MemoryDriftWatcher } 
  from '@mukundakatta/agentmemory';

const store = new EpisodicStore({ embedder: myEmbedder });
await store.append({ session: 'user-42', kind: 'user_msg', text: '...' });
await store.append({ session: 'user-42', kind: 'tool_call', text: '...' });

const summarizer = new OnDemandSummarizer({ llm: myLLM });
const { summary, eventIds, prompt } = 
  await summarizer.summarize('user-42', { window: 20 });

const watcher = new MemoryDriftWatcher({ 
  windowSize: 100, 
  threshold: 0.7,
  onAlert: ({ mean }) => notifyOps(`Memory retrieval dropped to ${mean}`),
});
```

When the user asks to be forgotten:

```javascript
await store.deleteSession('user-42');  // gone, including any embeddings
```

GDPR, CCPA, and any other right-to-be-forgotten regime gets a straightforward answer: yes, we delete.

## What it isn't

- Not an "AGI memory" system. It doesn't pretend retrieval-augmented context plus drift monitoring is consciousness.
- Not a vector database. It uses one if you configure an embedder; otherwise it falls back to keyword matching. You can swap stores.
- Not a hosted service. It's a library. Run it where your agent runs.

## Status

- **23 in-memory tests + 9 Postgres tests** passing
- **Zero runtime dependencies**
- ESM-only, Node 20+
- MIT-licensed

## Installation

```bash
npm install @mukundakatta/agentmemory
```

## Try it

Repo: <https://github.com/MukundaKatta/agentmemory>

If you've ever debugged an agent that "remembered" something you couldn't trace, you already know why this library is built the way it is.

---

*Pairs with agentfit (token truncation), agentguard (egress control), agentsnap (behavior snapshots), agentvet (argument validation), agentcast (structured output) — small libraries that compose, not a framework that takes over.*
