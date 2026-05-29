# A Seatbelt for Tool-Use: Stopping AI Agents from Talking to the Wrong Servers

> A declarative allowlist firewall for `fetch()` — wrap your agent in a policy, and any HTTP call outside the allowlist throws before it goes out.

## The threat model nobody wants to think about

You handed an LLM a `fetch` tool. The model has read the function signature. The model knows it can pass any URL.

Most of the time, the model behaves. It hits the APIs you'd expect. But once in a while — under a tricky prompt, after a jailbreak attempt, or via an indirect prompt injection in a document it's summarizing — it constructs a request to a URL you very much did not want it to construct. An internal admin endpoint. An attacker-controlled exfiltration server. A paid API you didn't budget for.

`agentguard` is the small, boring library that makes that class of mistake impossible by construction. You declare which hosts your agent is allowed to talk to. The library wraps `fetch` so anything else throws or returns a synthetic `403` before a packet leaves the box.

## The 60-second version

```javascript
import { firewall, policy } from '@mukundakatta/agentguard';

const safe = policy({
  network: { allow: ['api.openai.com', 'api.anthropic.com'] },
  budget: { maxRequests: 50 },
  violations: 'throw',
});

await firewall(safe, async () => {
  await myAgent.run('research the latest CVEs');
});
```

Inside the `firewall(...)` block, any `fetch` to a host outside the allowlist raises a `PolicyViolation`. Outside the block, `fetch` works normally.

That's it. That's the library.

## Why a library and not a sidecar

The standard answer to "restrict agent network access" is "run it in a container, attach a network policy." That's correct and you should do it.

But network policies are coarse. They can't tell the difference between *this* call (the one your tool was supposed to make) and *that* call (the one the model hallucinated). They live in YAML files two layers away from your code. And in development, on a laptop, no one is going to spin up a Cilium policy to test a prompt.

`agentguard` is the in-process layer that catches misuse at the call site, with a policy you can read in three lines and version next to your prompts.

## Host patterns that match reality

```javascript
allow: [
  'api.openai.com',          // exact
  '*.s3.amazonaws.com',      // wildcard subdomain
  '*'                        // global (use sparingly)
],
deny: ['*.internal.corp'],   // belt and suspenders
methods: ['GET', 'POST'],
```

Deny patterns win over allow patterns. Methods get checked separately. URLs that can't be parsed get rejected outright — no clever URL-trick bypasses.

## Two violation modes

- **`throw`** — `PolicyViolation` raised, your code decides. Good for development and tests where you want loud failures.
- **`block`** — a synthetic 403 response is returned. Good for production, where the model gets a real error code it can reason about and self-correct on.

## Per-call wrapping instead of globals

If you don't want to monkey-patch global `fetch`, pass a wrapped one directly to your SDK:

```javascript
const client = new Anthropic({
  fetch: wrapFetch(policy({ network: { allow: ['api.anthropic.com'] } }))
});
```

Different agents in the same process can run under different policies — `AsyncLocalStorage` keeps the contexts isolated, so a research agent's allowlist doesn't leak into your billing agent's.

## Pure decision function

For when you need to test "would this be blocked?" without making the call:

```javascript
const decision = check(policy, 'https://example.com');
// { action: 'deny', reason: 'not_in_allowlist' }
```

Useful in eval suites, audit logs, and "would-have-blocked" dashboards before you flip a policy from `throw` to `block`.

## Reasons you actually get

When `agentguard` blocks something, it tells you which rule fired:

- `not_in_allowlist`
- `denylist_match`
- `method_blocked`
- `budget_exceeded`
- `invalid_url`

Drop those into your logging and you get a real audit trail of what your agents tried to do — including the things they shouldn't have.

## Budget too, while we're here

```javascript
budget: { maxRequests: 100 }
```

Same library, same enforcement point. If your agent runs away and tries to make a thousand requests in a tight loop, the 101st throws. Pair with `agenttrace` if you want cost-level budgeting instead of request-count.

## What it isn't

`agentguard` explicitly isn't a sandbox. It catches misuse of `fetch`. It doesn't stop a determined exploit from using DNS exfiltration, child processes, or other side channels. The README puts it bluntly: *seatbelt for tool-use, not a vault.*

Pair it with OS-level isolation, proper auth on internal endpoints, and short-lived credentials. It's the cheapest, most legible layer of defense — not the whole defense.

## Status

- **v0.1.2**, stable core API
- **47/47 tests passing**
- **Zero runtime dependencies**
- TypeScript-first with full types

CLI tools shipped too: `validate-policy`, `check`, `check-batch` — for testing policies in CI and validating URL batches.

Roadmap: per-tool rate limits, cost tracking, additional transports beyond `fetch`, audit-log hooks.

## Try it

```bash
npm install @mukundakatta/agentguard
```

Repo: <https://github.com/MukundaKatta/agentguard>

Three lines of policy is cheaper than one incident report. Worth it.

---

*Part of agent-stack: agentfit, agentguard, agentvet, agentcast, agentsnap. All zero-dependency, all designed to be the boring layer between your agent and a bad day.*
