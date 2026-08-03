---
title: "NPUs Are the Answer to the Wrong Problem"
date: 2026-05-03
draft: true
assisted: prose
assistedNote: "The hardware, the benchmarks and the conclusions are mine, from my own testing notes. An LLM drafted the prose from them."
tags:
    - hardware
    - llm
    - inference
---

I bought a laptop with a dedicated AI chip. Then I spent a week figuring out why it didn't matter.

**TLDR:** Either I don't get it yet, or NPUs are marketed in the wrong way. Wait for lfm-style or hrm-text-style models to get beyond that threshold of usability.

---

## My Current Hardware + Setup

I'm running an **ASUS Zenbook S 16** with an **AMD Ryzen AI 9 365**: 10 cores, 20 threads, a Radeon 880M integrated GPU, 24 GB of shared RAM, and the star of the show: a dedicated **XDNA 2 NPU rated at 50 TOPS**.

The software stack is **FastFlowLM**, AMD's runtime for running LLMs directly on the NPU. It exposes an OpenAI-compatible API on a single port (52625) and manages three concurrent model slots internally:

- **LLM slot**: lfm2.5-it:1.2b (my primary model, 35 tok/sec)
- **Embedding slot**: embed-gemma:300m (768-dim vectors, auto-loads on first request)
- **Audio slot**: whisper-v3:turbo (speech-to-text, enabled with `--asr 1`)

All three slots run on the same server, same port:

```
flm serve lfm2.5-it:1.2b --asr 1 --port 52625
```

I tested several models. The results were telling:

| Model | Speed | Notes |
|-------|-------|-------|
| lfm2.5-it:1.2b | 35 tok/sec | Best for agentic workflows |
| qwen3:4b | 14.8 tok/sec | Reasoning mode overhead |
| qwen3.5:2b | 19 tok/sec | Slower than the 4B, unexpectedly |

The 1.2B model running at 35 tokens/sec is genuinely usable. But the moment I tried to push beyond toy models, the moment I wanted to do something *real* with the NPU, I hit a wall that no amount of TOPS could fix.

---

## Benefits NPUs Are Supposed to Provide

On paper, NPUs are tailor-made for transformer inference. The marketing pitch is compelling, and the architectural advantages are real:

**Matrix-vector multiplication specialization.** NPUs have dedicated hardware units optimised for the exact `[batch, seq_len, hidden_dim] × [hidden_dim, vocab_size]` pattern that transformers use. This isn't general-purpose compute; it's silicon shaped around the workload.

**Lookup tables for non-linear functions.** Instead of computing `e^x` from scratch the way a GPU ALU would, NPUs store pre-computed exponential values in hardware lookup tables. Softmax, the operation at the heart of every attention layer, becomes a table lookup instead of a floating-point calculation.

**Block FP16 for preserving outliers.** Mixed-precision quantisation with block-wise scaling means you can run INT4/INT8 for most weights while keeping full precision where activations spike. XDNA 2 supports BF16 natively.

**Dataflow architecture.** Unlike GPUs, which are temporal (thread warps scheduled over time), NPUs are spatial: they have local memory per tile, deterministic latency with no cache misses, and parallelism baked into the physical layout of the chip.

**Power efficiency.** All of the above runs at a fraction of the wattage a discrete GPU would draw. For a laptop on battery, this is the headline feature.

So you get specialised compute, efficient non-linear ops, native low-precision support, deterministic execution, and sipping power while doing it.

---

## How They Are the Answer to the Wrong Problem

Here's what I learned when I tried to run something beyond basic chat: specifically, an algorithm called **Attention Matching** for KV cache compaction (from a paper on "Latent Briefing"). The algorithm has three computational phases: token selection (matmul + softmax + median/MAD scoring), a beta solve (non-negative least squares via iterative gradient descent), and a C2 solve (ridge regression involving matrix inversion).

The NPU handles the first part fine. Q·Kᵀ matmul? Native. Softmax? LUT-accelerated. These are standard neural network primitives, and the NPU was built for them.

But then I hit the operations the NPU *can't* do:

- **Median and MAD** require sorting. Sorting is not a neural network primitive. It requires dynamic control flow: comparisons, swaps, conditionally branching. NPU hardware does not support this.
- **Iterative gradient descent** with non-negativity projection runs a `while` loop with an unknown iteration count. NPUs execute fixed computation graphs. A loop that might run 10 times or 10,000 times is architecturally incompatible.
- **Matrix inversion** has no direct NPU primitive. The iterative methods that approximate it (conjugate gradient, etc.) circle back to the same control-flow problem.

So you end up needing to offload those operations to the CPU or GPU. But before you even get to that architectural decision, there's a more fundamental problem:

**The bottleneck isn't compute. It's memory bandwidth.**

A 100k-token KV cache is roughly **12.8 GB**. The XDNA 2 NPU's on-chip memory is a tiny fraction of that. The KV cache lives in system RAM. Every attention operation has to *stream* that data from main memory into the NPU, and the transfer bandwidth between system RAM and the NPU is the chokepoint, not the 50 TOPS of compute sitting idle waiting for data to arrive.

**NPUs solve the compute problem, but LLM inference is memory-bound, not compute-bound.** Adding more TOPS is like widening a highway on-ramp when the bottleneck is a single-lane bridge downstream. The data can't get to the compute fast enough for the compute to matter.

The CPU, sitting right next to system RAM with direct access and high bandwidth, might actually outperform the NPU on memory-heavy workloads, not because it's faster at math, but because it doesn't have to shuttle 12 GB through a narrow pipe to get started.

For small models (1-2B parameters, short contexts), the NPU is genuinely great. The model fits close to on-chip memory, the operations are all standard primitives, and you get fast, power-efficient inference. My 35 tok/sec on lfm2.5-it:1.2b is proof of that.

But the moment you scale up, longer contexts, bigger models, algorithms with non-standard operations, the NPU becomes an answer to a question nobody was asking. The real question was never "how do I compute matmuls faster?" It was "how do I feed the processor fast enough?"

NPUs are a brilliant solution to the compute bottleneck. The problem is that compute isn't the bottleneck.
