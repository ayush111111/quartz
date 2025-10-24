---
title: "Evolution of system designs from an AI Engineer perspective"
date: 2025-09-17
tags:
    - neocloud
    - cloud
    - MPI
    - lecture-notes
---
Notes from Lecture 2 of [this](agenticai-learning.org/f25) Open MOOC offered by Berkeley RDI
---
<p>TLDR: Talk by an entrepreneur about the evolution of compute requirements for AI</p>
<ol>
<li>New algorithms<ol>
<li>timeline - 2022-gpt, 2023-MoE, 2024-Test time scaling, 2025-RL</li>
<li>RL allows more sophisticated loss functions (as compared to just next-token prediction)</li>
</ol>
</li>
<li>Applications - parameters<ol>
<li>Consumer apps - thriving - landscape is highly fluid competetitive - chat, code, search. Prosumers are willing to pay e.g for productivity.</li>
<li>Business apps - nascent - but enterprise apps are moving faster. started with closed source, and moved to train/tune their own as data built up.</li>
<li>Perfect app experience is correlated but independent from models.</li>
</ol>
</li>
<li>AI Infra<ol>
<li>bitter lesson - generalised method that leverage computation are most effective</li>
<li>Cloud history - scientific computing (1970s), Virtual Private servers (90s), Web service cloud (AWS) (OOs), data clouds (snowflake, databricks)(10s), AI cloud (requires exaflops of compute) (20s)</li>
<li>AI is different than computational compute<ol>
<li>data compute - io &gt;&gt; compute, simple abstraction, very distributed systems (mapreduce etc)</li>
<li>web services - io &gt; compute, arbitrary code, parallel system</li>
<li>AI Compute - compute &gt;&gt; IO, arbitrary code, very distributed systems (e.g distributed training) - slurm, MPI style</li>
</ol>
</li>
<li>Conventional cloud proposition no longer holds<ol>
<li>proposition (1. easy way to install and acquire software (e.g cloud database), 2. flexible supply chain (ec2 instances))</li>
<li>For AI Cloud,<ol>
<li>the software is simple (few libraries, frameworks) as opposed to many applications and middleware that conventional cloud is designed for,</li>
<li>Workload is unified (numerical computation) whereas conventional cloud is designed for varied workloads.</li>
<li>Supply Chain flexibility - conventional cloud - supports virtualisation and migration of applications between VMs, AI Cloud - low flexibility as training job machines are occupied, if one gpu fails, restart the entire job</li>
</ol>
</li>
<li>NeoCLoud - semi-analysis (website) - lambda, nvidia&#39;s offerings etc</li>
<li>Things to care about<ol>
<li>developer efficiency</li>
<li>Infra efficiency - account of GPUs dying</li>
</ol>
</li>
<li>Best practices - multi cloud GPU supply chain, elasticity and utilisation management, ai native platform for ev, training and inference (ray, anyscale)</li>
</ol>
</li>
</ol>
</li>
<li>Hardware - hw and sw design - using NV switches - each machinee is able to access another machines memory- all machines in a rack act like a single device &quot;mainframe&quot; - of GPUs</li>
<li>make workloads - idempotent and interruptible - ideally</li>
</ol>
