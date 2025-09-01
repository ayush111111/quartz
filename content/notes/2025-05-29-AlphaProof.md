---
title: "AlphaProof"
date: 2025-05-29
tags:
    - theorem-proving
    - math
    - formal-methods
---
Notes from Lecture 8 of [this](https://llmagents-learning.org/sp25) Open MOOC offered by Berkeley RDI  

\---

  

  
A brief history of formalisation in mathematics
What constitutes a mathematical proof evolved from words to symbols, this added - 
1.  Rigor and Clarity
2.  Efficiency and Communication
3.  Abstraction and Generalisation
4.  Unification
5.  Created new fields

  
Computer formalisation of Mathematics

*   Correctness concerns disappear - perfect verification (lean tells that it is not correct)
*   Use software stacks - collaboration (authors can trust the proof instead of performing manual verification), gamified "levels" of theorems
*   Lean aims to build Mathlib - aims to be general and unified

  
Reinforcement Learning

*   The "Zero" philosophy - If an agent can learn to master an environment tabula rase (without any information) then you demonstrably have a system that is discovering and learning new knowledge by itself
*   It also means that this algorithm is general and should apply to other domains
*   A huge apart of science is to explore areas that are not well understood and generate and discover new interesting truths.
*   AlphaGoZero and AlphaZero
    *   learned by simply playing games against itself, starting from complete random play
    *   rediscovered human patterns in days, and ultimately discarded some of it in preference of new discoveries
*   AlphaTensor - what is the most efficient way to multiply two matrices together
    *   Naive - n^3
    *   2 by 2 can be done in 7 moves at best
    *   alphatensor discovered the most efficient, novel and provably correct methods for 4 by 4 and 5 by 5 and others, which were previously undiscovered. Also can access huge action spaces (10^30)
*   What made these systems work?
    *   Scaled trial and error
    *   Grounded feedback signal
    *   Search - sampling highest probability action
    *   Curriculum - self-play for AlphaGo gives the right opponent
*   Lean allows the "Zero" principles to be applied to mathematics
*   AlphaProof
    *   trial and error scaling
        *   insilico environment for math
        *   perfect feedback signal for proving
    *   Finding problems to solve
        *   human defined
        *   alphaproof defined
            *   around human mathematics (auto-formalisation, test-time RL)
            *   augment human mathematics
    *   Should training be done in natural language (informal) or formal maths
        *   informal - large amount of data, unverifiable
        *   formal - small amount of data, verifiable - bet is that this will be rewarded in the long term
    *   IMO - hard problems -
        *   Geometry
            *   mathlib is sparse in 2D Euclidean geometry
            *   AlphaGeometry and AlphaProof join forces
        *   Not all answers are "proofs"
            *   easy mode - correct answer given by oracle, AI proves it
            *   hard mode - AI determines the answer, and proves it - generate candidate answers using Gemini
        *   Input Formalisation - input is given in natural language to participants, but alphaproof receives a formalised variant by lean experts
        *   Protocol
            *   Lean experts formalise
            *   generate O(100) answer candidates with Gemini
            *   Filter the easily disprovable ones
            *   Run Test-time RL
        *   Challenges
            *   gaps in mathlib - geometry, even p1 (that it solved)
            *   human data is in natural language
            *   Combinatorics problems are difficult to formalise and solve
        *   Methods
            *   Formaliser Model - output a lean formalisation for an input problem - Auto formalisation - generate lean "variants" for it (100s that are close to the human problem)
            *   Prover Model - Output N solving tactics, for an input lean state - trained on Mathlib - 300k lines of proof - learn a good prior of actions to take (supervised training) - but mathlib does not have IMO style problems
            *   Train Prover model by RL - to solve for IMO problems and also generalise
                *   Fir each formal problem
                    *   generate experience of (dis)proving by searching over lean steps
                    *   Use Lean to verify proofs
                    *   Reinforce the prover network with each success
            *   Prover Model + AlphaZero Search
                *   Search over actions (one line in the proof)
                *   Compute new lean state after every action/tactic -lean updates the state
                *   Explore high prior, high value paths but also explore low visited path
            *   Test-Time RL-
                *   For each problem
                    *   Generate variants of the problem
                    *   Run RL exactly as previous step
  
\---------    
https://rdi.berkeley.edu/adv-llm-agents/sp25


