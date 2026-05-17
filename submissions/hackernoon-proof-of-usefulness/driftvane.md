# Your RAG System Was Fine Last Week. driftvane Tells You Why It Isn't Today.

> Four small drift detectors — embedding, retrieval, response, latency — wrapped in a numpy-only Python library that runs anywhere, including a Lambda. No server, no UI, no telemetry pipeline.

## The slow leak

RAG systems don't break — they drift.

The embedding model gets updated. The corpus quietly grows. A new content source comes online with slightly different formatting. Your top-k retrieval starts pulling different chunks. The model still answers in confident sentences. Latency creeps up two hundred milliseconds. Nobody notices until a customer complains, and by then you have weeks of drift to untangle.

`driftvane` is a small Python library — numpy and a thousand lines — that flags this stuff before the customer does. Four detectors, each measuring one specific kind of drift, each producing a number you can threshold on.

## The four detectors

| Detector | What it sees | How it measures |
|---|---|---|
| **EmbeddingDrift** | Two `(n, d)` arrays of embeddings | Maximum Mean Discrepancy (MMD) with RBF kernel |
| **RetrievalDrift** | Top-k ID lists from reference vs current | Jaccard similarity + Rank-Biased Overlap (RBO) |
| **ResponseDrift** | (intent, context, answer) triples | Answer grounding shift |
| **LatencyDrift** | Float arrays of response times | Kolmogorov–Smirnov test |

Each detector takes a reference dataset (last week, last release, your "known good") and a current dataset, and returns a structured drift signal. You aggregate, threshold, alert.

## What this looks like in practice

```python
from driftvane import EmbeddingDrift, RetrievalDrift, Report

emb = EmbeddingDrift(threshold=0.05).check(reference=ref_embs, current=cur_embs)
ret = RetrievalDrift(threshold=0.7).check(reference=ref_ids, current=cur_ids)

report = Report([emb, ret])
if report.has_drift():
    raise SystemExit(report.to_json())  # fail the CI/CD step
```

You wire this into your nightly job, your release pipeline, or your CI on a representative eval set. When something drifts past your threshold, the report tells you which detector fired and by how much.

## Why MMD, Jaccard+RBO, and KS

Not "we used cool statistics" — these are the *right* tools for each shape of data:

- **Embeddings** are distributions in high-dimensional space. MMD compares distributions without assuming a parametric form, and the RBF kernel handles the geometry of dense vectors. It catches the case where individual embeddings still look normal but the *cloud* has shifted.
- **Retrieval** is two ordered ID lists. Jaccard catches set-level changes ("we're returning different docs now"). RBO catches order-level changes ("same docs, different ranking") and weights early positions more — which matches how RAG actually consumes top-k.
- **Latency** is a distribution that loves to grow a fat tail. KS compares the whole distribution, not just the mean. A p99 drift hidden under a stable p50 is exactly what KS catches.

## Output you can do something with

```python
report.to_pandas()  # if you have pandas installed
report.to_dict()    # numpy-only path
report.has_drift()  # boolean gate for CI
```

A pandas DataFrame for analysts. A JSON dict for log aggregators. A boolean for build pipelines. Pick whichever fits the consumer.

## What it isn't

Not a platform. Not a UI. Not a hosted service. There's no agent collecting metrics, no SaaS to log into, no "minimum monthly spend." It's a library you call from your own code, with your own data, on your own schedule.

That's the point. RAG monitoring is the kind of thing you want to own — your reference set, your thresholds, your alerting path. driftvane is the calculation, not the platform around it.

## Where it lives best

- Nightly batch jobs that re-embed a sample of your corpus and compare to last night's embedding distribution
- Pre-release gates that re-run a held-out eval set and compare retrieval rankings against the last release
- Post-deploy canaries that watch p95 latency for a Kolmogorov shift against baseline
- AWS Lambda functions — yes, this fits, because there's nothing to set up

## Installation

```bash
pip install driftvane
pip install "driftvane[pandas]"             # for to_pandas()
pip install "driftvane[external-response]"  # for hosted response scoring
```

## Status

- **v0.1 alpha**, MIT-licensed
- **Core dependency: numpy.** That's it.
- Python-only

## Try it

Repo: <https://github.com/MukundaKatta/driftvane>

The next quiet RAG regression will happen on a Tuesday afternoon. Wire driftvane in on the Monday before.
