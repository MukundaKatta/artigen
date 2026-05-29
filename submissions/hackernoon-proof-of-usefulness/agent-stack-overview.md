# The Unix Philosophy for AI Agents: Six Small Libraries Instead of One Big Framework

> Why I shipped agent reliability as a set of zero-dependency utilities — each one boring, each one auditable in a sitting — instead of a framework that wants to own your stack.

## The framework trap

Every few months a new "agent framework" lands. It promises to handle memory, tool use, retries, observability, guardrails, and orchestration, all behind one import. You try it. The hello-world is gorgeous. Then you need to do something the framework didn't anticipate — validate a tool argument a particular way, swap the cost model, change how retries back off — and you discover the framework has opinions, and its opinions are now your problem.

Frameworks bundle decisions. That's their value and their tax. When the decisions match your needs, you move fast. When they don't, you fight the framework, monkey-patch its internals, or fork it.

I wanted the opposite trade. So I built agent reliability as a set of small, single-purpose libraries that do one thing, compose cleanly, and never ask to own your control flow. This is the Unix philosophy — *write programs that do one thing well, and work together* — applied to the messy reality of shipping LLM agents.

## The suite

Seven libraries, each addressing one failure mode that everyone running agents in production eventually hits:

| Library | One job |
|---|---|
| **agentfit** | Fit messages into a token budget without blowing the context window |
| **agenttrace** | Track cost and latency per step, roll up per run |
| **agentguard** | Allowlist the hosts an agent's `fetch` can reach |
| **agentvet** | Validate tool arguments before the tool runs |
| **agentcast** | Force structured output — extract, validate, retry |
| **agentsnap** | Snapshot tool-call traces, fail CI on regressions |
| **agentmemory** | Pull-model episodic memory with real deletes |

Each is independently installable. Each has zero runtime dependencies. None imports another. You can adopt one, ignore the rest, and never know the others exist.

## Why "zero dependencies" is a feature, not a flex

It's easy to read "zero dependencies" as minimalism for its own sake. It isn't. In the agent-tooling space specifically, it's a security and trust property.

These libraries sit at the most sensitive points in your stack. `agentguard` decides which servers your agent can talk to. `agentvet` decides whether a tool with side effects runs. `agentmemory` decides what gets deleted when a user invokes their right to be forgotten. You should be able to read every line that makes those decisions.

A library with a dependency tree of 40 transitive packages can't make that promise. One you can read in a sitting can. `agentmemory` is under 500 lines. `bedrock-kit` is under 1000, explicitly so it can be security-audited. That's the point: the code that guards your agent should be code you've actually read.

## Composition over configuration

Here's what using three of them together looks like — and notice that none of them knows about the others:

```javascript
import { firewall, policy } from '@mukundakatta/agentguard';
import { withRun, measureLLM } from '@mukundakatta/agenttrace';
import { vet, adapters } from '@mukundakatta/agentvet';

const search = vet({
  name: 'search',
  schema: adapters.zod(searchSchema),
  fn: async ({ query }) => doSearch(query),
});

const net = policy({ network: { allow: ['api.anthropic.com'] } });

const { run } = await firewall(net, () =>
  withRun({ name: 'research' }, async () => {
    await measureLLM('plan', 'claude-sonnet-4', () => llm(plannerPrompt));
    await search({ query: 'latest CVEs' });
  })
);

console.log(run.summary()); // cost + latency, per step
```

Three libraries. One stacks a network policy, one times the calls, one validates the tool. They compose because they each do their job at a different seam — `agentguard` wraps `fetch`, `agenttrace` wraps the call, `agentvet` wraps the tool — and they all lean on the same primitive (`AsyncLocalStorage`) to follow your async control flow without you threading context objects around.

You assemble the pieces you need. You don't configure a monolith to disable the pieces you don't.

## The "what it isn't" discipline

Every library in the suite has a section in its README titled, roughly, *what it isn't*. `agentguard` isn't a sandbox. `agentsnap` isn't an evaluator. `agentcast` isn't a model. `cachebench` isn't a cache.

This isn't modesty. It's interface design. A library that's honest about its boundaries is one you can reason about. When `agentguard` says "I catch accidental `fetch` calls, I am not a vault," you know exactly what other layer you still need (OS isolation, real auth). A framework that claims to handle "security" leaves you guessing which threats it actually covers.

Small scope is legible scope. Legible scope is the whole pitch.

## When you should NOT use this approach

Honesty cuts both ways. If you're prototyping and want a batteries-included framework to get an agent running in an afternoon, a monolith is the right call — grab one, ship the demo, worry about seams later.

The suite earns its keep when you're past the demo: when an agent is in production, costs real money, touches real user data, and a silent regression means an incident. That's when "I can read exactly what guards this" and "I can swap this one piece without touching the rest" stop being aesthetic preferences and start being operational necessities.

## The throughline

Six (now seven, with `agentmemory`) libraries, one idea: the reliability layer of your agent stack should be made of parts small enough to understand, boring enough to trust, and independent enough to adopt one at a time.

No framework lock-in. No 40-package dependency tree guarding your most sensitive decisions. No fighting someone else's opinions when your requirements diverge. Just small programs that do one thing well and work together — because that philosophy was right for operating systems in 1978, and it's right for AI agents now.

## Start anywhere

Pick the failure mode that's biting you today:

- Surprise API bills → **agenttrace**
- Agent hitting URLs it shouldn't → **agentguard**
- "The model passed a string where I expected a number" → **agentvet**
- JSON that won't parse → **agentcast**
- A "harmless" prompt change that quietly reordered your tool calls → **agentsnap**
- Memory you can't audit or truly delete → **agentmemory**

Install one. Read its source. Decide if you trust it. Then decide if you want the next one.

Repos: <https://github.com/MukundaKatta>

---

*This is the overview piece for the agent-stack series. Each library has its own deep-dive: agenttrace, agentguard, agentvet, agentcast, agentsnap, and agentmemory.*
