---
title: "Lessons from 250k LLM calls summary"
date: 2024-03-13
tags:
  - evaluation
  - retrieval
  - prompting
---
Summary of [this](https://www.credal.ai/blog/takeaways-from-using-llms-on-corporate-documents) nice article written by credal.ai 

---
## 1. Questions on complex data sources require carefully formatted data
---
### Issues
A. Asking questions that dont have a word for word match (eg. summarise the content)
- <u>solution</u>
  -  finding a sub-section summary within the document
- <u>implementation</u>
  - use LLMs to tag sub-sections with metadata
  - figuring out what all the possible tags should be upfront is impossible. If the human expert can tell us the important concepts to look out for, the LLM can identify which parts of each document (or which documents as a whole) are relevant.

---
B. Issues due to references/footnotes/similar human-readable metadata - 
- <u>solution</u>
  -  convert text to an LLM understandable format
- <u>implementation</u>
  -  replacing references/footnotes in the document with their full text description.
  -  eg The time machine[75] -> The time machine[Authored by HG Wells]
    
---
C. LLM cannot read tables/dates 
- <u>solution</u> - provide the table as a seperate input csv. 

---
## 2. Good prompts focus on the hardest part of the task
---
### Issues

A1. Selection of Person to answer a question from a slack channel
- <u>solution</u>
  - Use an LLM call 
- <u>implementation</u>
  -  Prompt : You will be provided with names and descriptions for each expert. The description will describe what the expert does and potentially include specific instructions for when the expert should be used.  Let's say you are given the following expert metadata to pick from:
  Name: "Internal data expert", Description/Routing instructions: "This expert picks the best datas to refer to for internal company data requests. Only respond to questions about which data to look at for analytical questions and ignore any statements.", expertId: "25dc3fds6d-f9d2-42a5-ab3f-709442920313"
Here are some user queries followed by the expertId you would pick followed by the reasoning for why:
  User message: "What is going on with the Coca Cola account?", expertId: "96f52391-ee42-4c35-bb23-9d5599615287", reasoning: "This is a question regarding a customer account and the CRM expert mentions that it answers questions about our companies customers.

---
A2. Formatting into structured output using a cheaper model
- <u>solution</u>
  - Using multiple cheaper calls instead of one expensive call
- <u>implementation</u>
  - Chaining gpt-3.5 calls solves the issue and is cheaper too

Resolving 2A1 and 2A2 through a single prompt was unsuccesful. The models Focus should be used for the hardest part of the task. The output responses can be chained to obtain the same result as the single prompt.
 

-----

<u>Notes</u>
- Reason why 1C works may be due to differences in formats (md vs csv) or simply because the LLMs focus is better when csv-s are provided as a seperate prompt. Image models / Document models can also resolve this issue.
- metadata tagging is underrated


