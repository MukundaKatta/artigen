# Your Prompt Cache Hit Rate Is Probably a Lie. cachebench Tells You the Real Number.

> Per-call observability for prompt caching across Anthropic, OpenAI, and AWS Bedrock. Tracks hit ratios, computes USD savings, alerts on misses, and handles Anthropic's documented eventual-consistency window with miss-aware retries.

## The cache theater problem

You added prompt caching last month. The provider's docs said you'd cut costs by 70%. Your bill went down a bit, but not nearly that much.

Here's what's probably happening:

1. **Your prefix isn't actually stable.** A timestamp, a session id, or a slightly different system message snuck into the front of the prompt. Cache misses.
2. **You're paying for cache writes you never reuse.** Cached blocks that expire before being hit cost more than not caching at all.
3. **Anthropic's cache has an eventual-consistency window.** A new cache block isn't always immediately readable; the very next call after a write can register as a miss even when it shouldn't.
4. **You don't actually measure any of this** — you trust the dashboard your provider gives you.

`cachebench` is the Python library that puts a number on each of these. Per call. Across providers. With alerts when the cache starts silently underperforming.

## What it tracks

For every call routed through it:

- **Cache read tokens** — what actually came back from cache
- **Cache creation tokens** — what was written into cache this call
- **Hit ratio** — by prefix, by call, in aggregate
- **USD savings** — measured against the no-cache cost
- **Prefix hash** — stable identifier for the cacheable section, so you can group performance by prefix even when the suffix changes

The numbers come from each provider's own response payload — Anthropic exposes them natively, OpenAI surfaces `prompt_tokens_details.cached_tokens`, AWS Bedrock returns the same fields via `AnthropicBedrock`. `cachebench` normalizes them into one shape.

## What it does about it

### Miss alerts

Configure a threshold — default 60% — and a callback. When the rolling miss rate climbs past it, the callback fires. Wire it to your Slack, your PagerDuty, your stdout, whatever. You find out your cache is broken before next month's bill arrives.

```python
tracker = CacheTracker(
    provider=Provider.ANTHROPIC,
    miss_alert_threshold=0.6,
    on_miss_alert=lambda stats: notify_slack(stats),
)
```

### Miss-aware retry

Anthropic's docs are explicit: there's an eventual-consistency window where a freshly-written cache block may not be immediately readable. If your traffic pattern writes a cache block and then immediately reads from it (which, in agent loops, is common), you'll see avoidable misses.

`cachebench` will optionally retry a call that registered as an unexpected miss, with a configurable short delay, to give the cache a moment to settle. The retry is opt-in and bounded — you control the attempts and the delays.

### Per-prefix grouping

Aggregated stats are grouped by prefix hash, not just by call. So when one of your three system prompts is the one tanking the hit rate, the rollup tells you exactly which one — without you having to sift through call logs.

## The wrap pattern

`cachebench` is unobtrusive. You don't rewrite your code; you wrap the call:

```python
from anthropic import Anthropic
from cachebench import CacheTracker, Provider

client = Anthropic()
tracker = CacheTracker(provider=Provider.ANTHROPIC, miss_alert_threshold=0.6)

# wrap the method
create = tracker.wrap(client.messages.create)

# call as usual
response = create(
    model="claude-sonnet-4",
    system=[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
    messages=[{"role": "user", "content": user_input}],
)

# every call is now tracked
print(tracker.summary())  # hit_ratio, total_savings_usd, per_prefix breakdown
```

Same shape works for OpenAI and Bedrock — different `Provider` enum, same wrap, same metrics.

Sync and async are auto-detected; you don't have to know whether the underlying method is `async def` to wrap it correctly.

## What it isn't

- **Not a cache.** It doesn't store anything. It observes what the provider already caches.
- **Not a prompt-rewriting tool.** If your prefix isn't stable, this library will tell you. Fixing the prefix is your job.
- **Not a billing dashboard.** It gives per-call cost estimates from token counts; reconcile against the real invoice elsewhere.

It composes naturally with `bedrock-kit` — same author, complementary scopes. Use both if you're on Bedrock and want cache observability layered onto adaptive throttling and structured output.

## Status

- **v0.1 alpha**
- Python 100%, MIT-licensed
- Anthropic / OpenAI / Bedrock provider support
- Sync and async wrapping

## Installation

```bash
pip install cachebench
```

## Try it

Repo: <https://github.com/MukundaKatta/cachebench>

If your last "we added prompt caching" Slack post was followed by a smaller-than-expected drop on the invoice, this library is the difference between guessing and knowing.
