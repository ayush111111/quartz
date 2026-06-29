---
title: "Berkeley RDI Agents MOOC Overview"
date: 2025-06-01
tags:
  - sp25-lecture-notes
  - lecture
  - agents
---

Overview of [this](https://llmagents-learning.org/sp25) Open MOOC offered by Berkeley RDI

\---


This article summarizes the twelve lectures I attended in the Berkeley RDI course on LLM agents. For each lecture, I highlight what I found most interesting and explain why those insights stood out. The summary is LLM generated, the notes are not.

## Lecture 1: Inference Time Techniques

In this lecture, I was fascinated by **Analogical Prompting**, which combines few-shot and zero-shot chain-of-thought (CoT) by adding "Recall relevant examples" to the prompt. The idea that the LLM can generate its own examples and outperform both manual few-shot CoT and zero-shot CoT felt powerful. We also learned about **Sequential vs. Parallel Generation**. For simple problems, sequential generation allows the model to self-correct, while harder problems benefit from a hybrid approach that balances parallelism with sequential self-reflection.
Full notes: [[2025-05-25-Inference-time-techniques|Inference time techniques]]

## Lecture 2: Learning to Self Improve & Reason with LLMs

The standout concept was **Iterative Reasoning Preference Optimization (IRPO)**. The process involves generating multiple CoTs and answers for each training example, constructing preference pairs based on correctness, and then training with DPO plus NLL to push down negative examples. What intrigued me most was that even an LLM used as a judge can be trained to score reasoning outputs, showing that negative examples are crucial for fine-tuning.
Full notes: [[2025-05-25-Learning to Self-Improve & Reason with LLMs|Learning to Self-Improve & Reason with LLMs]]

## Lecture 3: On Reasoning, Memory, and Planning of Language Agents

Two key takeaways caught my attention. First, **"grokking"** shows that transformers can learn to reason only after extensive training far beyond overfitting thresholds, with test performance eventually rising both in-distribution and out-of-distribution. Second, **systematicity** varies by problem type: compositional reasoning speeds up as the ratio of inferred facts to atomic facts increases, while comparative reasoning generalizes at a constant rate regardless of entity count. This demonstrated how data distribution, not just size, drives generalization.
Full notes: [[2025-05-25-On Reasoning, Memory, and Planning of Language Agents|On Reasoning, Memory, and Planning of Language Agents]]

## Lecture 4: Open Training Recipes for Reasoning in Language Models

I was most interested in **Data Mixing**, where mixing different data types (for example, adding more CoT examples) boosts reasoning performance. Since collecting CoT data is expensive, strategies like persona-based data synthesis and combining DPO with data ablations offer practical ways to target new skills. The idea of **budget forcing**, inserting a "Wait" token when a model's output falls short of a token limit to encourage more detailed responses, also felt like a clever trick.
Full notes: [[2025-05-25-Open Training Recipes for Reasoning in Language Models|Open Training Recipes for Reasoning in Language Models]]

## Lecture 5: Coding Agents for Vulnerability Detection

The lecture explained how to compute **pass@k** for coding tasks. The naive estimator is simply the percentage of successful runs out of k samples, but the **HumanEval estimator** is more robust: sample a subset of size k without replacement and check how often at least one sample passes. This distinction between noisy and unbiased estimates provided a neat insight into evaluation metrics.
Full notes: [[2025-05-27-Coding Agents for Vulnerability Detection|Coding Agents for Vulnerability Detection]]

## Lecture 6: Multimodal Autonomous AI Agents

What I found most useful was the performance improvement from **training on both synthetic and human demos**. Human demos cover only a handful of popular websites, so they don't generalize well. In contrast, **InSTA (Internet-Scale Training for Agents)** uses an LLM to generate and verify synthetic tasks, yielding data that better generalizes to the long tail of websites.
Full notes: [[2025-05-27-Multimodal Autonomous AI Agents|Multimodal Autonomous AI Agents]]

## Lecture 7: Multimodal Agents From Perception to Action

The data collection pipeline behind **AgentTrek** impressed me. By automatically scraping web tutorials and using LLM annotation to convert them into structured agent trajectories (CoTA), they captured high-quality demonstrations efficiently. The lesson that **quality beats quantity**, since a small CoTA-only dataset outperforms larger mixes, confirmed for me the value of carefully filtered data. I also appreciated how reasoning with an **inner monologue** makes agents more capable of solving complex, long-horizon tasks.
Full notes: [[2025-05-28-Multimodal Agents From Perception to Action|Multimodal Agents From Perception to Action]]

## Lecture 8: Alphaproof

The **"Zero" philosophy** resonated strongly. If an agent can master mathematics from scratch without human priors (similar to AlphaGo Zero), then it truly discovers new knowledge. Seeing how AlphaProof explores formal proof spaces in Lean by trial and error, gradually building up from simple axioms, highlighted the potential for autonomous mathematical discovery.
Full notes: [[2025-05-29-AlphaProof|AlphaProof]]

## Lecture 9: Language Models for Autoformalization and Theorem Proving

I was intrigued by how **domain-specific constraints** tame an infinite action space. For example, when proving inequalities, LLM-based provers like LIPS use symbolic reasoning patterns—substitutions or rewrites—to prune the search space. This approach shows that, even though theorem proving has an enormous search space, clever domain constraints make automated theorem proving feasible.
Full notes: [[2025-05-29-Language models for autoformalization and theorem proving|Language Models for Autoformalization and Theorem Proving]]

## Lecture 10: Bridging Informal and Formal Mathematical Reasoning with AI

The concept of **LeanHammer**, sketching proofs informally, translating to a formal sketch, and then using tools to fill the gaps, stood out for me. By combining high-level, human-like reasoning with the rigor of formal proof automation, this framework leverages both LLM intuition and existing theorem-proving tools to efficiently generate machine-checked proofs.
Full notes: [[2025-05-30-Bridging Informal and Formal Mathematical Reasoning with AI|Bridging Informal and Formal Mathematical Reasoning with AI]]

## Lecture 11: Abstraction and Discovery with Large Language Model Agents

The **LaSR framework for symbolic regression** was especially compelling. Instead of mutating syntax trees directly, LLMs rewrite programs guided by a **concept library**, blending symbolic abstraction with data-driven fitness evaluation. Seeing how concepts derived by LaSR combine with models like Chinchilla to outperform each component individually illustrated the power of jointly learning concepts and programs.
Full notes: [[2025-05-31-Abstraction and Discovery with Large Language Model Agents|Abstraction and Discovery with Large Language Model Agents]]

## Lecture 12: Towards Building Safe and Secure Agentic AI

Finally, I was struck by the prevalence of **SQL injection vulnerabilities** in agentic systems using LLMs (for example, in llamaindex and SuperAGI). This concrete example underscored why **defense in depth**, layered defenses like input sanitization, model hardening, policy enforcement, and runtime monitoring, is vital to protect hybrid AI systems from cascading failures and attacks.
Full notes: [[2025-05-31-Towards building safe and secure agentic AI|Towards Building Safe and Secure Agentic AI]]


\---------
For more details on these lectures and to access the original slides and materials, visit
https://rdi.berkeley.edu/adv-llm-agents/sp25
