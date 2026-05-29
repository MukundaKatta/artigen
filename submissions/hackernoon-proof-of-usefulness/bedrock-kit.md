# bedrock-kit: The Three Things AWS Bedrock Doesn't Do Out of the Box

> A small, opinionated Python wrapper over `boto3` for AWS Bedrock that handles adaptive throttling, per-call cost tracking with cache awareness, and JSON-with-repair structured output. Under 1000 lines so you can read it.

## The honest pitch

`boto3`'s Bedrock client is fine. It calls the API. It returns the response. What it doesn't do — and what every serious Bedrock user ends up writing themselves — is the three things this library does:

1. **Retry the right exceptions, with the right backoff.**
2. **Track cost per call, with the cache-token distinction Bedrock now exposes.**
3. **Validate model JSON against a Pydantic schema, repair what's repairable, and ask the model to fix what isn't.**

Most teams reinvent these three pieces poorly. `bedrock-kit` ships them once, in one file, under a code budget small enough that you can audit it before adopting.

## Throttling that actually backs off

Bedrock throws *five* different exceptions for "slow down":

- `ThrottlingException`
- `TooManyRequestsException`
- `ServiceUnavailableException`
- `ProvisionedThroughputExceededException`
- `ModelTimeoutException`

`bedrock-kit` retries all of them with configurable max attempts, base delay, max delay, and optional jitter. Default settings are sane; override when your traffic pattern needs it. The retries are adaptive — base delay grows on each attempt until either the call succeeds or the cap is hit.

What this saves you: writing your own retry decorator, getting the exception list wrong, forgetting jitter, and having a stampede when your retries align across workers.

## Cost tracking that knows about caches

Anthropic models on Bedrock now expose cache-read tokens separately from input tokens — they're priced differently, and ignoring the distinction makes your cost dashboard lie to you.

`CostLedger` records per-call cost using a built-in pricing table for the popular Anthropic models (override-able for new ones or for negotiated rates). It separates:

- Standard input tokens
- Cache-read tokens (cheaper)
- Output tokens

The result is a per-call cost number you can actually trust, plus aggregate accessors for daily / per-route / per-tenant rollups.

If you have pandas installed, the ledger exports to a DataFrame for slicing. If you don't, the same data is available as plain dicts.

## Structured output with repair

You asked for JSON matching a Pydantic model. The model returned the JSON wrapped in a `<thinking>` block, with a trailing comma, and a code fence around it.

`bedrock-kit`'s structured-output helper does three things in order:

1. **Local repair** — strips markdown fences, removes trailing commas, peels prose off the front and back. No model call required.
2. **Pydantic validation** — runs the cleaned output through your schema.
3. **Model self-correction** — if validation still fails, sends the original output and the validation error back to the model with a request to fix it. Up to a configurable number of attempts.

When it returns, you have a validated Pydantic instance. When it can't, you get an exception with the full repair history so you can see what went wrong.

## Quickstart

```python
from bedrock_kit import BedrockClient, CostLedger
from pydantic import BaseModel

class Summary(BaseModel):
    title: str
    bullets: list[str]

ledger = CostLedger()
client = BedrockClient(ledger=ledger)

summary = client.structured(
    model="anthropic.claude-sonnet-4",
    prompt="Summarize this article: ...",
    schema=Summary,
    repair_attempts=2,
)

print(ledger.total_usd())   # 0.0023
print(summary.bullets)
```

That's adaptive throttling, cost tracking, and validated structured output in roughly twelve lines.

## What it deliberately doesn't do

- **Multi-provider routing.** This is Bedrock. If you need a router, use one.
- **Proxy server.** No sidecar, no daemon. It's a library.
- **Agent loops.** That's `agent-stack`. This is the model client underneath.
- **Streaming.** Out of scope for v0.1 — designed for request/response workflows where validation and cost tracking matter most.

The scope is small on purpose. The whole library fits in under 1000 lines of Python because the surface area is intentionally bounded.

## Installation

```bash
pip install "bedrock-kit[boto]"
pip install "bedrock-kit[boto,pandas]"   # if you want DataFrame export
```

## Status

- **v0.1 alpha**
- Python 100%, MIT-licensed
- Actively seeking issues and PRs from anyone running Bedrock in production

## Try it

Repo: <https://github.com/MukundaKatta/bedrock-kit>

If you've already written your own Bedrock retry decorator, cost tracker, or JSON repair function, you know exactly the three problems this solves. Open the repo, check the code is doing what you'd have done, and skip writing them again.
