---
title: "Bridging Informal and Formal Mathematical Reasoning with AI"
date: 2025-05-30
tags:
    - theorem-proving
    - formal-methods
    - math
---
Notes from Lecture 10 of [this](https://llmagents-learning.org/sp25) Open MOOC offered by Berkeley RDI  

\---

1.  Informal thoughts - Training models to think informally Lean-STAR
    1.  In lean, given a theorem, there's a loop between proof state and the next step(tactic) taken to complete the proof
    2.  Neural theorem proving approach - train a model on some inputs and outputs of proof state and next steps on a dataset an generate proofs using tree search
    3.  Lean-StaR - Training Models to think before each step, using RL
        1.  Initialisation - train a model to retrospectively to produce CoT before taking a step
        2.  RL-
            1.  model----thought+step---LEAN---Y/N---repeat
            2.  Tree Search (Sampling Method)
                1.  Best-First-Search - its difficult to score (thought, action) so it didn't work well
                2.  New method - generate multiple proofs in parallel, backtrack and retry if lean fails, until you reach max steps or complete the proof. Increasing the search budget benefits models with CoT in general (!). Informal thoughts have logical steps not present in formal code. Startup which has the current SoTA alternates between code generation and informal reasoning, before generating the final code
            3.  Online RL - Expert iteration - collect successful trajectories, add to dataset and retrain. Added to the pass rate as much as CoT (~2.5 points)
        3.  Benchmarks - miniF2F
2.  Informal provers - sketching proofs and filling the gaps - LeanHammer
    1.  Motivation is to combine high level and low-level reasoning
    2.  "Hammers" are tools that are used for filling in gaps for proofs. However, they are not good for proofs with higher search space, only for interactive use with humans
    3.  Draft-Sketch-Proof: draft an informal proof, translate to a formal sketch, use a low-level prover to fill the gaps
        1.  Draft - Human/LLM
        2.  Sketch - LLM
        3.  Hammer - fill gaps
        4.  Proof Search - generate many informal proofs / informal sketches and translate \[search seems to be performed at a different "layer" of abstraction\]
        5.  Inference time proof search scaling - Increasing trajectories increases proofs found until it plateaus. Proofs generated using different LLMs, and match human levels of proof \[judged by count of proofs?\]
    4.  LeanHammer - Integrates automated theorem provers (SMT solvers) into interactive theorem prover (Lean, Isabelle, Coq)
        1.  ATPs struggle with large search space. Premise Selection- select a small subset of theorems and definitions that are likely to be useful for proving a given theorem. Mathlib has 250k premises. Premise selection reduces this search space.
        2.  Hammer Pipeline:
            1.  Goal---->Select Premise-----Translate to ATP language-----ATP solves-----Reconstruct to Lean----->Proof
            2.  Goal----->Select Premise-----Lean-auto------------------zuperposition--------Duper--------->Proof
        3.  Neural Premise selection - frame premise selection as retrieval with a neural language model
            1.  Embed mathlib/local premises
            2.  cosine similarity to select highest scoring premise
            3.  Contrastive loss on state, positive premise, negative premise. Retriever training is nuanced, output format dependent
        4.  Combine premise selector and ATP with a tree search: Aesop
            1.  Query ATP using premises
            2.  Apply tactics using the premises
        5.  At any step of the proof "hammer" can be called. If it succeeds, it will display the proof.
        6.  The retriever is less than <100M parameters.
3.  Research-level maths - assisting in research-level projects - MiniCTX
    1.  Steps of doing it manually - informal blueprint and a dependency graph of theorems, definitions, lemmas - formalise
    2.  Accessibility gap - Some methods are hard to integrate into tools
        1.  Not open source (AlphaProof)
        2.  Expensive to run (MCTS)
    3.  LLMLean - basic interface between lean and a language model, compatible with local LLMs
    4.  Benchmarking gap - Instead of solving self-contained standard results-based problems like IMO, benchmark on real problems which are context dependent
        1.  miniCTX: Test models on real Lean projects
            1.  future mathlib - theorem added after a time cutoff
            2.  Other recent projects included too
            3.  Contexts
                1.  In-file dependencies
                2.  Cross-file dependencies - premise and context selection necessary for good performance. Competition specific models do not perform well on these.
              


\---------  
https://rdi.berkeley.edu/adv-llm-agents/sp25



