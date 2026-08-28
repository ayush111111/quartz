---
title: "Taxonomy of Automatic Prompt Optimization"
date: 2026-08-28
assisted: summary
assistedNote: "The taxonomy is Figure 1 of the source paper. An LLM transcribed the figure into the diagrams below; the labels and section numbers are the paper's."
tags:
    - paper-summary
    - prompting
    - prompt-optimization
    - llm
    - taxonomy
---

A redrawn version of Figure 1 from an EMNLP 2025 paper, which lays out the anatomy of an automatic prompt optimization system as five components. Section numbers below are the paper's own.

Source: [https://aclanthology.org/2025.emnlp-main.1681.pdf](https://aclanthology.org/2025.emnlp-main.1681.pdf)

## The five components

The figure itself is a flat tree rooted at "Prompt optimization anatomy, section 2". Read as a pipeline, the five branches sit in this order, with section 7 controlling how many times the middle three repeat.

```mermaid
flowchart LR
    S3["3<br/>Seed prompts"] --> S4["4<br/>Inference evaluation<br/>and feedback"]
    S4 --> S5["5<br/>Candidate prompt<br/>generation"]
    S5 --> S6["6<br/>Filter and retain<br/>promising candidates"]
    S6 -->|"7 Iteration depth"| S4

    classDef seed stroke:#e8a87c,stroke-width:2px
    classDef eval stroke:#d4b429,stroke-width:2px
    classDef gen stroke:#8b8bd4,stroke-width:2px
    classDef filter stroke:#d48b9c,stroke-width:2px

    class S3 seed
    class S4 eval
    class S5 gen
    class S6 filter
```

## 3. Seed prompts

Where the starting prompt comes from.

```mermaid
flowchart LR
    A["3 Seed prompts"] --> B["3.1 Manual instructions"]
    A --> C["3.2 Instruction-induction<br/>via LLMs"]

    classDef seed stroke:#e8a87c,stroke-width:2px
    class A,B,C seed
```

## 4. Inference evaluation and feedback

How a candidate prompt is scored, and what signal is passed back to the generator.

```mermaid
flowchart LR
    A["4 Inference evaluation<br/>and feedback"] --> N["4.1 Numeric score"]
    A --> L["4.2 LLM feedback"]
    A --> H["4.3 Human feedback"]

    N --> N1["4.1.1 Task accuracy"]
    N --> N2["4.1.2 Reward model score"]
    N --> N3["4.1.3 Entropy-based"]
    N --> N4["4.1.4 Negative log-likelihood"]

    L --> L1["4.2.1 Improving<br/>single candidate"]
    L --> L2["4.2.2 Improving<br/>multiple candidates"]

    classDef eval stroke:#d4b429,stroke-width:2px
    class A,N,L,H,N1,N2,N3,N4,L1,L2 eval
```

## 5. Candidate prompt generation

How new candidate prompts are produced. The largest branch of the taxonomy.

```mermaid
flowchart LR
    A["5 Candidate prompt<br/>generation"] --> H["5.1 Heuristic-based edits"]
    A --> N["5.2 Editing with auxiliary<br/>trained NN"]
    A --> M["5.3 Metaprompt design"]
    A --> C["5.4 Coverage-based"]
    A --> P["5.5 Program synthesis"]

    H --> H1["5.1.1 Monte Carlo sampling"]
    H --> H2["5.1.2 Genetic algorithm"]
    H --> H3["5.1.3 Word / phrase edits"]
    H --> H4["5.1.4 Vocabulary pruning"]

    N --> N1["5.2.1 Reinforcement learning"]
    N --> N2["5.2.2 LLM finetuning"]
    N --> N3["5.2.3 Generative<br/>adversarial networks"]

    C --> C1["5.4.1 Single prompt expansion"]
    C --> C2["5.4.2 Mixture of experts"]
    C --> C3["5.4.3 Ensemble methods"]

    classDef gen stroke:#8b8bd4,stroke-width:2px
    class A,H,N,M,C,P,H1,H2,H3,H4,N1,N2,N3,C1,C2,C3 gen
```

## 6. Filter and retain promising candidates

The search strategy over the candidate pool.

```mermaid
flowchart LR
    A["6 Filter and retain<br/>promising candidates"] --> B["6.1 TopK greedy search"]
    A --> C["6.2 Upper confidence bound<br/>and variants"]
    A --> D["6.3 Region-based joint search"]
    A --> E["6.4 Meta-heuristic ensemble"]

    classDef filter stroke:#d48b9c,stroke-width:2px
    class A,B,C,D,E filter
```

## 7. Iteration depth

How the loop terminates.

```mermaid
flowchart LR
    A["7 Iteration depth"] --> B["7.1 Fixed steps"]
    A --> C["7.2 Variable steps"]

    classDef iter stroke:#7ba7d4,stroke-width:2px
    class A,B,C iter
```
