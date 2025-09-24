---
title: "Overview of training methods of LLMs for Agent use"
date: 2025-09-17
tags:
    - Kimi
    - DeepSeek
    - tool-use
    - lecture-notes
---
Notes from Lecture 1 (presented by Yann Dubois, OpenAi) of [this](agenticai-learning.org/f25) Open MOOC offered by Berkeley RDI

---

# Introduction to training LLMs for Agents

General pipeline
Pretraining -> Reasoning RL -> post-training (RLHF)
architecture, training algorithms, data is what people have focused on from 2023 (academia focus)
data and RL env, evaluation, systems and infra to scale is what matters in practice

LLM specialisation pipeline

- prompting
- finetuning - domain specific post-training

## Pretraining
>10T tokens, >20B unique web pages

1. Method
    1. AR (autoregressive) models - predict the next word
        1. tokenize
        2. forward
        3. predict probability of next token
        4. sample
        5. detokenize
    2. Neural Language models
        1. input words from sentence to word embeddings
        2. turned the sentence into vector representation after passing through LLM
        3. Convert vector (e.g. 768) to dimensionality of vocabulary size
        4. apply softmax and obtain the probability distribution for the next token

2. Data
    1. obtain and clean internet pages
        1. download all of the data: common crawl - 250 billion pages > 1PB (warc file - not ideal for LLMs (?))
        2. Text extraction from HTML (challenges: math, embedded js, etc)
        3. Filter undesirable content (PII, private information, nsfw)
        4. Deduplicate (url/document/line) - e.g. header, footer, menu on forums
        5. Heuristic filtering (e.g. less than 5 words, more than million words, strange tokens, block lists) - cheap filters to pass to next model
        6. Model based filtering (predict if page referenced by Wikipedia - signal of high quality) - costlier but applied on a smaller subset
        7. Data mix - depending on downstream performance, select domains (code, entertainment) to include/exclude
        8. Midtraining data - continued pretraining to adapt the model to desired properties (longer context, data mix shifts, instruction following)
        9. Common datasets - C4, The Pile

3. Compute
    1. can predict performance with scaling laws - tune models on small scale and scale up
    2. e.g. Q - transformers vs LSTMs - LSTMs start flattening at very large scale (10^9+)
    3. e.g. Q - how to optimally allocate training resources (size vs data)
    4. Bitter lesson - leveraging computation at a higher level matters most

## Post-training

Classic post-training - language modeling is not the same as assisting users. Models need fine-tuning / alignment / instruction-following to be useful on real tasks by maximizing human preference.

Reasoning post-training - goal: teach model to reason; task: answer correctly. Use any hard task with a verifiable answer. Test-time compute (e.g. more powerful inference) improves performance.

1. Methods - post-training data is scarce and expensive, so fine-tuning pretrained LLMs on limited desired data is common
    1. SFT - behavior cloning from humans (2–10k samples often enough to learn style and instruction following — LIMA 2023)
        - Alpaca - use LLMs to scale data collection (e.g. DaVinci -> LLaMA 7B outputs) — works for open source
        - DeepSeek R1 - ask an LLM to generate multiple answers and keep those judged correct (rejection sampling using verifiers, e.g. test cases)
        - Kimi K2 - learning tool use
            1. collected 3k real + 20k synthetic tools and used an agent to write tasks with rubrics to evaluate them
            2. an agent simulates a user calling a tool; the rubric for the tool is defined and rejection sampling is performed
    2. RL
        1. SFT is bounded by human abilities and can hallucinate. RL tries to maximize desired behavior via rewards instead of cloning.
        2. Rule-based rewards - string matching for close-ended QA, test cases for coding/math
        3. LLM as a judge (if a more powerful LLM is available)
        4. DeepSeekR1 uses rule-based rewards for reasoning and a human-preference-aligned reward model
        5. GRPO
            1. Policy model - predicts answers
            2. Reward model
            3. advantage function - normalization (instead of a value function)
        6. Infra is key
            - sampling multiple outputs per problem is a bottleneck — rollouts can be slow (~1 hr)
            - environment feedback can be slow
                - dedicated services for environments
                - concurrent rollouts
                - co-locate engines and inference on same pod to avoid communication overhead (model step -> broadcast to GPU -> inference -> continue training)
    3. RL from Human Feedback - PPO, DPO, etc., pairwise preference maximization

2. Evaluation
    1. Close-ended - accuracy, etc.
    2. Open-ended
        - hard to automate
        - alternatives: human preference collection, LLM-as-Judge

3. Systems
    - GPU parallelization, low precision, operator fusion, tiling — reduce idle time and maximize utilization

### How is it useful right now?

- Prompts aligned with post-training data work best; knowing data sources helps prompting.
- These datasets can be used as sources for test-time inference tuning (e.g., for DSPy).
