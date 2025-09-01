---
title: "AutoGen Paper Summary"
date: 2024-01-26
tags:
  - paper-summary
  - multi-agent
  - agents
---

AutoGen is a generalized multi-agent conversation framework based on conversable agents

[https://arxiv.org/abs/2308.08155](https://arxiv.org/abs/2308.08155)


# 1 Introduction

AutoGen is a generalized multi-agent conversation framework based on the following new concepts 

1. Customizable and conversable agents 

- agents can leverage LLMs, human inputs, tools 

- every agent is made conversable â€“ they can receive, react, and respond to messages

2. Conversation programming

streamlines the development of intricate applications via two primary steps

 - defining a set of conversable agents with specific capabilities and roles (as described above) 

- programming the interaction behavior between agents via conversation centric computation and control. 


# 2 The AutoGen Framework 


## 2.1 Conversable Agents


### Agent capabilities 



1. LLMs 
* role playing 
* implicit state inference and progress making conditioned on conversation history
* providing feedback
* adapting from feedback,
* coding
2. Humans 
* A user proxy agent allows configurable human involvement levels and patterns.e.g., frequency and conditions for requesting human input including the option for humans to skip providing input.
3. Tools 

* the default user proxy agent in AutoGen is able to execute code suggested by LLMs, or make LLM-suggested function calls. 



### Agent customization and cooperation

AutoGen allows easy creation of agents with specialized capabilities and roles by reusing or extending the built-in agents



* The ConversableAgent - the highest-level agent abstraction and, by default, can use LLMs, humans, and tools.
* The AssistantAgent - pre-configured ConversableAgent subclasses acting as an AI assistant (backed by LLMs) 
* UserProxyAgent - pre-configured ConversableAgent subclasses acting as a human proxy to solicit human input or execute code/function calls (backed by humans and/or tools)


## 2.2 Conversation Programming 

AutoGen utilizes conversation programming, a paradigm that considers two concepts:



1. Computation â€“ the actions agents take to compute their response in a multi-agent conversation.
2. Control flow â€“ the sequence (or conditions) under which these computations happen.

An agent takes actions relevant to the conversations it is involved in and its actions result in message passing for consequent conversations

When the assistant receives a message, the user proxy agent typically sends the human input as a reply. If there is no input, it executes any code in the assistantâ€™s message instead.

AutoGen features the following design patterns to facilitate conversation programming:



1. Unified interfaces and auto-reply mechanisms for automated agent chat.
* send/receive function
* generate reply function - for taking actions and generating a response
* agent auto-reply mechanism - 
    * Automatically invoke generate_reply
    * Can register custom reply functions
        * e.g. chatting with X before replying to Y
2. Control by fusion of programming and natural language
* Natural language control via LLMs. - In AutoGen, one can control the conversation flow by prompting the LLM-backed agents with natural language. E. g.
    *  The default system message of the built-in AssistantAgent in AutoGen uses natural language to instruct the agent to fix errors and generate code again if the previous result indicates there are errors. 
    *  â€œTERMINATEâ€ stops the program
* Programming-language control - Python code can be used to specify the termination condition, human input mode, and tool execution logic, e.g., the max number of auto replies. 
3. Control transition between natural and programming language.
* by invoking an LLM inference containing certain control logic in a customized reply function; or transition from natural language to code control via LLM-proposed function calls

AutoGen also supports dynamic conversation flows with multiple agents. AutoGen provides two general ways to achieve this: 

1. Customized generate reply function: 



* within the customized generate reply function, one agent can hold the current conversation while invoking conversations with other agents depending on the content of the current message and context. 

2. Function calls:



*  LLM decides whether or not to call a particular function depending on the conversation status. By messaging additional agents in the called functions, the LLM can drive dynamic multi-agent conversation. 

AutoGen supports more complex dynamic group chat via built-in GroupChatManager, which can dynamically select the next speaker and then broadcast its response to other agents


# 3 Applications of AutoGen





![image](https://github.com/ayush111111/blog/assets/52037893/78940184-e204-459d-8c13-24ea2a20be22)




### A1: Math Problem Solving


##### Scenario 1 - using two built-in agents from AutoGen


##### Scenario 2 - human-in-the-loop


##### Scenario 3 - multiple humans-in-the-loop  


### A2: Retrieval-Augmented Code Generation and Question Answering

employ AutoGen to build a RAG system 

The system consists of two agents: 



* a Retrieval-augmented User Proxy agent
* a Retrieval-augmented Assistant agent


##### Scenario 1



* AutoGen introduces a novel interactive retrieval feature 
* Better performance than DPR (Dense Passage Retrieval) and AutoGen without interactive retrieval


### A3: Decision Making in Text World Environments



* implemented a two-agent system to solve tasks from ALFWorld.
* LLM-backed assistant agent responsible for suggesting plans to conduct a task and an executor agent responsible for executing actions  (ReAct prompting) 
* introduced a grounding agent, which supplies crucial commonsense knowledgeâ€“such as â€œYou must find and take the object before you can examine it. You must go to where the target object is before you can use it.â€â€“whenever the system exhibits early signs of recurring errors (15%gain)


### A4: Multi-Agent Coding



- Writing code to interpret optimization solutions
  - The workflow is as follows:
    1. The end user sends questions, such as "What if we prohibit shipping from supplier 1 to roastery 2?" to the Commander agent.
    2. The Commander coordinates with two assistant agents, including the Writer and the Safeguard, to answer the question.
    3. The Writer will craft code and send the code to the Commander.
    4. After receiving the code, the Commander checks the code safety with the Safeguard; if cleared, the Commander will use external tools (e.g., Python) to execute the code.
    5. The Writer is requested to interpret the execution results.
    6. The Commander then provides this concluding answer to the end user.
    7. If, at a particular step, there is an exception, e.g., security red flag raised by Safeguard, the Commander redirects the issue back to the Writer with debugging information.
    8. The process might be repeated multiple times until the user's question is answered or timed-out.



### A5: Dynamic Group Chat



* AutoGen provides native support for a dynamic group chat communication pattern, in which participating agents share the same context and converse with the others in a dynamic manner instead of following a pre-defined order. 
* Dynamic group chat relies on ongoing conversations to guide the flow of interaction among agents. These make dynamic group chat ideal for situations where collaboration** without strict communication order **is beneficial.
* GroupChatManager class serves as the conductor of conversation among agents and repeats the following three steps: 
      1. dynamically selecting a speaker
      2. collecting responses from the selected speaker
      3. broadcasting the message

Through a pilot study on 12 manually crafted complex tasks, we observed that compared to a prompt that is purely based on the task, **utilizing a role-play prompt **often leads to more effective consideration of both conversation context and role alignment during the problem-solving and speaker-selection process. Consequently, this leads to a higher success rate and fewer LLM calls


### A6: Conversational Chess

Features -



  1. Natural, flexible, and engaging game dynamics, enabled by the customizable agent design in AutoGen. 
  2. Grounding, which is a crucial aspect to maintain game integrity. During gameplay, the board agent checks each proposed move for legality; if a move is invalid, the agent responds with an error, prompting the player agent to re-propose a legal move before continuing. As an ablation study, we removed the board agent and instead only relied on a relevant prompt â€œyou should make sure both you and the opponent are making legal movesâ€ to ground their move. 
  
      The results highlighted that **without the board agent**, illegitimate moves caused game disruptions. 



# Discussion


## A Related work


#### Single-Agent Systems:

- AutoGPT, 

- ChatGPT+ (with code interpreter or plugin),

- LangChain Agents
   - ReAct agent (a notable example)
   - Not designed for communicative and collaborative modes.
   - Summary of its limitations can be found in (Woolf, 2023)

- Transformers Agent


#### Multi-Agent Systems:

BabyAGI



* BabyAGI adopts a static agent conversation pattern, i.e., a predefined order of agent communication

CAMEL



* demonstrates how role playing can be used to let chat agents communicate with each other for task completion.
* CAMEL does not natively support tool usage, such as code execution
*  only supports static conversation patterns

Multi-Agent Debate



* effective way to encourage divergent thinking and to improve the factuality and reasoning in LLM
* Each agent is simply an LLM inference instance, no tool or human is involved
* inter-agent conversation needs to follow a pre-defined order

MetaGPT



* specialized for software development






![image](https://github.com/ayush111111/blog/assets/52037893/26a9061b-8803-48e2-a280-12cfcfa55a7a)


## Expanded discussion



* A1 (scenario 3), A5, and A6 follow a dynamic conversation pattern


#### Benefits of autogen

Ease of use: The built-in agents can be used out-of-the-box, delivering strong performance even without any customization. (A1, A3)

 

â€¢ Modularity: 



* The division of tasks into separate agents promotes modularity in the system.
*  Each agent can be developed, tested, and maintained independently (A3, A4, A5, and A6) 

â€¢ Programmability:



* AutoGen allows users to extend/customize existing agents to develop systems satisfying their specific needs with ease. (A1-A6)

 â€¢ Allowing human involvement:



* AutoGen provides a native mechanism to achieve human participation and/or human oversight
* also facilitates interactive user instructions to ensure the process stays on the desired path. (A1, A2, A5, and A6) 

â€¢ Collaborative/adversarial agent interactions: 



* agents can complement each otherâ€™s abilities and collectively arrive at better solutions. (A1, A2, A3, and A4).
* agents are required to work in an adversarial way. Relevant information is shared among different conversations in a controlled manner, preventing distraction or hallucination. (A4, A6). 


####  General Guidelines for Using AutoGen

1. Consider using built-in agents first
   - AssistantAgent - carefully prompted for generic problem solving
   - UserProxyAgent - solicits human inputs and performs tool execution. Try using these
   - When customizing agents for an application, consider the following options:
     - Human input mode, termination condition, code execution configuration, and LLM configuration can be specified.
     - Adding instructions in an initial user message, which is an effective way to boost performance without needing to modify the system message.
     - UserProxyAgent can be extended to handle different execution environments and exceptions, etc.
     - When system message modification is needed, consider leveraging the LLMâ€™s capability to program its conversation flow with natural language.

2. Start with a simple conversation topology


      
      * Consider using the two-agent chat or the group chat setup first, as they can often be extended with the least code
      * The two-agent chat can be easily extended to involve more than two agents by using LLM-consumable functions in a dynamic way.

3. Try to reuse built-in reply method

4. Start with humans always in the loop


      
      * helps evaluate the effectiveness of AssistantAgent, tuning the prompt, discovering corner cases, and debugging.
      

##### Scenarios to use other libraries in



1. For (sub)tasks that do not have requirements for back-and-forth trouble-shooting, multi-agent interaction, etc., a unidirectional  pipeline can also be orchestrated with LangChain/ LlamaIndex Guidance/ Semantic Kernel /Gorilla /or low-level inference API autogen.oai
2. When existing tools from LangChain etc. are helpful, one can use them as tool backends for AutoGen agents.

     For example, one can readily use tools, e.g Wolfram Alpha, from LangChain in  an AutoGen agent.

3. For specific applications, one may want to leverage agents implemented in other libraries/packages. To achieve this, one could wrap those agents as conversable agents in AutoGen and then use them to build LLM applications through multi-agent conversation. 
4. It can be hard to find an optimal operating point among many tunable choices, such as the LLM inference configuration. black Box optimization packages like â€˜flaml.tuneâ€™ (automated hyperparameter tuning)


##### Future Work / Open questions



1. Designing optimal multi-agent workflows:
* Creating a multi-agent workflow for a given task can involve many decisions, e.g.,
    *  how many agents to include
    * how to assign agent roles and agent capabilities, 
    * how the agents should interact with each other, and whether to automate a particular part of the workflow.

    There may not exist a one-fits-all answer, and the best solution might depend on the specific application. This raises important questions: For what types of tasks and applications are multi-agent workflows most useful? How do multiple agents help in different applications? For a given task, what is the optimal (e.g., cost-effective) multi-agent workflow?

2. Creating highly capable agents
* systematic work will be required to develop guidelines for application-specific agents, to create a large OSS knowledge base of agents, and to create agents that can discover and upgrade their skills 
3. Enabling scale, safety, and human agency
* essential to develop clear mechanisms and tools to track and debug their behavior
* building fail-safes against cascading failures and exploitation, mitigating reward hacking, out of control and undesired behaviors, maintaining effective human oversight of applications built with AutoGen agents will become important

