# Submission Metadata

Copy-paste fields for the HackerNoon submission form, one block per article. HackerNoon asks for: a title, an optional subtitle, a meta description (SEO, keep ~155 chars), a TLDR, and up to 5 tags (the **first** tag is the primary/main tag). Pick a cover image per article — prompt ideas included.

---

## 1. agentsnap — `agentsnap.md`

**Title:** Your AI Agent Just Silently Changed Its Mind. Here's How to Catch It.

**Subtitle:** Snapshot tests for agents: lock in tool-call traces and fail CI when your agent reorders, drops, or rewrites its own playbook.

**Meta description:** agentsnap records your AI agent's tool-call traces and fails CI when they regress — catching the silent behavior changes that evals and unit tests miss.

**TLDR:** Agents break in a way tests don't catch: same correct answer, different (and pricier) tool-call path. agentsnap records ordered tool traces, diffs them against a baseline, and categorizes the change (reorder, swap, regression) so you fail CI before the billing dashboard tells on you. Zero dependencies, works with any test runner.

**Tags:** `software-testing`, `ai-agents`, `llms`, `javascript`, `open-source`

**Cover idea:** A film-strip / snapshot frames metaphor with one frame subtly out of order.

---

## 2. agentguard — `agentguard.md`

**Title:** A Seatbelt for Tool-Use: Stopping AI Agents from Talking to the Wrong Servers

**Subtitle:** A declarative allowlist firewall for fetch() — wrap your agent in a policy and any off-list HTTP call throws before it leaves the box.

**Meta description:** agentguard is a zero-dependency network egress firewall for AI agents: declare allowed hosts, and any unauthorized fetch() throws or returns a synthetic 403.

**TLDR:** You gave an LLM a fetch tool; sooner or later it builds a request to a URL you never wanted. agentguard wraps fetch with a three-line allowlist policy so off-list calls throw (or return a 403) before a packet leaves the process. It's the in-process seatbelt to pair with OS-level isolation — not a replacement for it.

**Tags:** `web-security`, `ai-agents`, `cybersecurity`, `llms`, `open-source`

**Cover idea:** A network diagram with most outbound arrows blocked by a single gate.

---

## 3. agentcast — `agentcast.md`

**Title:** Stop Praying Your LLM Returns Valid JSON. Make It.

**Subtitle:** agentcast wraps any LLM call in an extract-validate-retry loop; bad JSON gets fed back to the model with the validator's error until it complies.

**Meta description:** agentcast forces structured output from any LLM: it extracts JSON from prose, validates against your schema, and retries with feedback before throwing.

**TLDR:** Models wrap JSON in prose, add trailing commas, and ignore your "JSON only" instruction. agentcast extracts the JSON, validates it against Zod/Valibot/JSON-Schema, and on failure sends the model its own output plus the validator's error to self-correct. Zero dependencies; bring your own validator.

**Tags:** `llms`, `prompt-engineering`, `javascript`, `ai-agents`, `open-source`

**Cover idea:** Messy prose-wrapped text on the left, clean structured JSON object on the right.

---

## 4. driftvane — `driftvane.md`

**Title:** Your RAG System Was Fine Last Week. driftvane Tells You Why It Isn't Today.

**Subtitle:** Four small drift detectors — embedding, retrieval, response, latency — in a numpy-only Python library that runs anywhere, even a Lambda.

**Meta description:** driftvane detects drift in RAG and agent systems with four detectors (embedding, retrieval, response, latency) — numpy-only, no server, no UI, runs in a Lambda.

**TLDR:** RAG systems don't crash, they drift: an updated embedder, a growing corpus, creeping latency. driftvane is a numpy-only library with four detectors (MMD, Jaccard+RBO, grounding shift, Kolmogorov–Smirnov) that turn drift into a number you can threshold and gate CI on. No platform, no backend.

**Tags:** `rag`, `machine-learning`, `python`, `observability`, `open-source`

**Cover idea:** Two overlapping distribution curves slowly separating.

---

## 5. agentvet — `agentvet.md`

**Title:** The Cheapest Way to Save Your AI Agent From Itself: Validate Tool Args Before You Run Them

**Subtitle:** agentvet wraps tools with a schema and refuses to execute on bad arguments, returning model-friendly errors so the next call self-corrects.

**Meta description:** agentvet validates LLM-generated tool arguments before execution, throwing model-readable errors so the agent self-corrects instead of running on garbage input.

**TLDR:** When a model passes "twenty" where you need an integer, an unvalidated tool runs anyway — sometimes with side effects. agentvet wraps each tool with a schema (Zod/Valibot/predicate), blocks execution on bad args, and returns an error shaped for the model's retry loop. Zero dependencies, swappable validators.

**Tags:** `ai-agents`, `llms`, `typescript`, `software-development`, `open-source`

**Cover idea:** A gate checkpoint inspecting arguments before they reach a running function.

---

## 6. bedrock-kit — `bedrock-kit.md`

**Title:** bedrock-kit: The Three Things AWS Bedrock Doesn't Do Out of the Box

**Subtitle:** A small, opinionated boto3 wrapper for Bedrock: adaptive throttling, cache-aware cost tracking, and JSON-with-repair structured output.

**Meta description:** bedrock-kit is a sub-1000-line boto3 wrapper for AWS Bedrock handling adaptive throttling, cache-aware cost tracking, and Pydantic structured output with repair.

**TLDR:** boto3's Bedrock client calls the API and stops there. bedrock-kit adds the three things every serious user reinvents: retrying the five throttle exceptions with backoff, per-call cost tracking that separates cache-read tokens, and JSON output that's locally repaired then re-validated against Pydantic. Under 1000 lines so you can audit it.

**Tags:** `aws`, `python`, `llms`, `software-development`, `open-source`

**Cover idea:** The AWS Bedrock logo with three labeled gauges (throttle, cost, schema) bolted on.

---

## 7. agentmemory — `agentmemory.md`

**Title:** Pull-Model Memory for LLM Agents: An Honest Alternative to "AI Dreaming"

**Subtitle:** An append-only episodic store with real deletes, caller-driven summarization, and a drift watcher — no background consolidation, no silent context injection.

**Meta description:** agentmemory is a pull-model episodic memory for LLM agents: real deletes, on-demand summarization with full traceability, and a retrieval-drift watcher.

**TLDR:** "Background consolidation" memory systems rewrite your data unseen and leave deletes that aren't really deletes. agentmemory is the honest, pull-model alternative: an append-only store with genuine SQL deletes, summaries that return their source event IDs and exact prompt, and a watcher that alerts when retrieval quality slips. Under 500 lines, zero dependencies.

**Tags:** `ai-agents`, `llms`, `open-source`, `javascript`, `data-privacy`

**Cover idea:** A clean ledger/journal with one entry being physically torn out (real delete).

---

## 8. agenttrace — `agenttrace.md`

**Title:** Per-Step Cost and Latency Tracking for AI Agents in 26 Lines of Setup

**Subtitle:** agenttrace wraps your LLM calls, captures cost and latency per step, and rolls them up per run — built-in pricing, AsyncLocalStorage, zero dependencies.

**Meta description:** agenttrace adds per-step cost and latency tracking to AI agents with two wrappers, built-in provider pricing, and AsyncLocalStorage context — zero dependencies.

**TLDR:** The first question after launching an LLM loop is "what did that run cost, and which step was expensive?" agenttrace answers both: wrap a run, wrap the calls inside it, get a structured cost+latency summary. Built-in pricing for Anthropic/OpenAI/Gemini/Grok and free tiers, AsyncLocalStorage so context follows your async hops.

**Tags:** `observability`, `ai-agents`, `llms`, `javascript`, `open-source`

**Cover idea:** A waterfall/flame-graph of agent steps annotated with dollar amounts.

---

## 9. cachebench — `cachebench.md`

**Title:** Your Prompt Cache Hit Rate Is Probably a Lie. cachebench Tells You the Real Number.

**Subtitle:** Per-call prompt-cache observability across Anthropic, OpenAI, and Bedrock — hit ratios, USD savings, miss alerts, and eventual-consistency-aware retries.

**Meta description:** cachebench measures real prompt-cache performance across Anthropic, OpenAI, and Bedrock: per-call hit ratios, USD savings, miss alerts, and miss-aware retries.

**TLDR:** You added prompt caching and the bill barely moved — usually an unstable prefix or cache writes you never reuse. cachebench wraps your client and reports per-call cache hit ratio, USD savings, and per-prefix breakdowns, alerts when misses spike, and retries through Anthropic's documented eventual-consistency window. Observes the cache; doesn't store anything.

**Tags:** `llms`, `observability`, `python`, `cost-optimization`, `open-source`

**Cover idea:** A dashboard gauge labeled "cache hit rate" with the needle far below the expected mark.

---

## 10. agent-stack overview — `agent-stack-overview.md`

**Title:** The Unix Philosophy for AI Agents: Six Small Libraries Instead of One Big Framework

**Subtitle:** Why I shipped agent reliability as zero-dependency utilities — each boring, each auditable in a sitting — instead of a framework that wants to own your stack.

**Meta description:** Why agent reliability belongs in small, composable, zero-dependency libraries — agentfit, agenttrace, agentguard, agentvet, agentcast, agentsnap, agentmemory.

**TLDR:** Agent frameworks bundle decisions; when their opinions diverge from your needs, you fight them. This is the case for the opposite trade: six (now seven) small single-purpose libraries that compose via AsyncLocalStorage, carry zero dependencies, and are small enough to read — because the code guarding your agent's money, network, and data should be code you've actually audited.

**Tags:** `ai-agents`, `software-architecture`, `open-source`, `llms`, `software-engineering`

**Cover idea:** Several small interlocking Lego-style bricks versus one large opaque black box.

---

## Tag notes

- HackerNoon caps tags at 5 and treats the **first** as the primary tag (drives placement). Each block above is ordered with the strongest primary first.
- If a tag above isn't in HackerNoon's taxonomy when you type it, the editor will suggest the closest match — `llms` ↔ `large-language-models`, `ai-agents` ↔ `ai`, `web-security` ↔ `cybersecurity` are the usual fallbacks.
- All ten can also carry a `proof-of-usefulness` or sponsor-relevant tag if the hackathon submission flow asks for one.
