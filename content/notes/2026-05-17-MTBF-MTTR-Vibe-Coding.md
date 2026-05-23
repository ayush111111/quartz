---
title: "MTBF, MTTR, and Vibe Coding"
date: 2026-05-17
tags:
    - miscellaneous
---

MTBF is how long your system goes between breaking. MTTR is how fast you fix it when it does. Vibe coding massively favors MTTR. Ship fast, break things, let the agent patch it. Hashimoto's thesis is that companies are doing this without realizing they've abandoned MTBF entirely. He saw the same thing play out during the cloud infrastructure transition, where teams automated themselves into systems that looked healthy on every dashboard but were globally incomprehensible. Nobody noticed the architecture decaying because changes outpaced understanding. It works when you have instant deploys, good observability, and users who get your fix the moment you push it. It doesn't when bugs have long tails, when you can't force-update your users, or when the cost of a single failure is high.
