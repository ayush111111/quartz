---
title: "Language models for autoformalization and theorem proving"
date: 2025-05-29
tags:
    - theorem-proving
    - autoformalization
    - math
---
Notes from Lecture 9 of [this](https://llmagents-learning.org/sp25) Open MOOC offered by Berkeley RDI  

\---
  
  
IMO, FrontierMath datasets for math  
math and coding are proxies for complex reasoning and planning

*   challenging for LLMs
*   Relatively easy to evaluate
*   unlimited applications

  
How do LLMs solve math

*   SFT - data focused
*   RL - verifiability focused

  

1.  Supervised Finetuning on Mathematical data
    1.  LLM pretrained on text and code ->base math LLM (using math-related web docs)
    2.  base math LLM -> Finetuned LLM - using problems with step-by-step solution
    3.  Finetuned LLM -> Tool-integrated LLM - using problems w/ tool integrated solutions data
    4.  training data is of highest importance
    5.  Human annotations with the final answers can be obtained but intermediate steps are difficult. RL can be used to train the intermediate steps - RL on Verifiable problems
        1.  Provide the model with the question. It generates the intermediate steps and the solution - which may be correct or incorrect
        2.  RL algorithms like GRPO optimize the model to earn high rewards - popularized by DeepSeek R1
        3.  The solution must be verifiable i.e a number.

  
Gaps

1.  Pre-college math to Advanced math research -
    1.  FrontierMath has numerical solutions (to evaluate them)
    2.  Models can guess answers but are bad at proving

  
The missing ingredient - Formal Reasoning - grounded in first/higher-order logic and dependent type theory

1.  Formal systems can verify proofs and provide feedback
2.  Verification enables rigorous evaluation of reasoning
3.  Proof assistants - Interactive theorem proving

  
LLMs for theorem proving

1.  we can train LLMs to generate either
    1.  the next step
    2.  complete proofs
2.  Proof steps can be assembled into complete proofs using search algorithms
3.  Generate next step generate from human proofs
4.  Examples

*   LeanDojo
    *   Open source LLM-based theorem prover
        *   data
        *   model checkpoints
        *   data extraction tools, lean interaction tools
    *   LeanDojo Benchmark
*   Retrieval Augmented Prover - allows the use of pre-existing lemma (and not start from scratch)
    *   Given a proof state (the goal to be proven) and a Library of lemmas
    *   Encode to vectors and perform vector search via cosine similarity
    *   concat retrieved lemmas and use an LLM to generate next step
*   Typical Neural Theorem prover - initial state, generate potential search steps using dfs/ monte carlo tree search - tactic generation using formal math libraries, local context and goal, and an LLM
*   Goedel-Prover - Uses expert-iteration. Add successfully generated intermediate proofs to the training set. train the prover again and iterate. This improves performance to a saturation point

1.  Limitations
    1.  math "action space", unlike chess etc. is not constrained
        1.  Taming the action space in proving inequalities (limited domain, so limited action space) proofs in the domain are regular
            1.  apply Am-gm inequality, Cauchy Schwarz, Titu etc
            2.  rewrite the current problem, into a form that an existing lemma becomes applicable
        2.  Tactic Generation and Pruning.
            1.  Inequality proving steps are of two types
                1.  Scaling - substitute the given inequality using a known lemma
                2.  Rewriting - transform the given inequality into an equivalent form
            2.  We enumerate and prune all patterns (the scaling tactics) using "symbolic" models
            3.  Rewriting is handled by an LLM
            4.  LIPS: LLM based inequality prover using symbolic reasoning
                1.  surpasses imo gold medalists for inequality proving
            5.  Hence, though the action space is infinite, domain specific constraints/patterns can be used to solve specific subsets
    2.  human created data is limited
        1.  Orthonormalization of theorem and proofs
            1.  theorems: informal theorem -> formal theorem
                1.  No reliable automatic evaluation - logic inequivalence is infeasible
                2.  Informal proofs - "left to the reader"
            2.  Restrict to specific domain - Euclidean geometry
                1.  LeanEuclid - Created Benchmark 48 from Euclid's elements, 125 from unigeo dataset - logical inconsistencies in Euclid's poof -e.g. not imagining all cases of triangles, assuming concaveness - Diagrammatic Reasoning gaps. e.g. proving two circles intersect at a point. Avigad identified a set of hidden axioms that can be formalised.
                2.  Equivalence checking between theorems becomes possible - Now possible because Euclidean geometry theorems are not general theorems, they take a particular form. This is done by SMT based solver
                3.  Hence theorem statements are verifiably autoformalised
            3.  Proof: informal theorem and proof -> formal proof
                1.  After theorem statements are formalise, the model autoformalises the proof
                2.  this proof is provided to Lean. Lean identifies set of reasoning gaps in the proof. If they are in agreement with the above axioms, then the formalisation is deemed as correct.


