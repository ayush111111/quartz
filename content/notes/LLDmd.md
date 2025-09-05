---
title: "Low Level Design and Machine Coding"
date: 2025-09-01

---

# Motivation
Having a PR rejected because I did not pay attention to the nature of the variable on which I was assigning data really stung :/
Patterns like Dependancy Injection, Abstract Factory, are pretty intuitive but I was not able to figure out how I was violating the principles of the state pattern without external help.
Hence, learning about this set of principles is necessary to avoid similar mistakes in the future
This knowledge is compiled and marketed as a resource for the LLD / Machine Coding interview round. As popular as it is to dunk on them, having a singular well compiled resource is well worth it in my opinion.
I bought an educative io subscription to learn it, I must say that I fell prey to their aggressive marketing techniques. It is pretty surface level, though it has good breadth. Personal blogs on the internet are the best sources of information.

PTR
- For the Elevator Management System and the Parking Lot System the system handles CRUD operations for the key class (e.g assigning a car to a parking lot) but for the Library Management System, a seperate item called BookReservation is created those operations. I thought it would be dependant only on the count of the objects being handled but the complexity of the operation involved is a better heuristic to go by. For example, if a gym locker only needs isAvailable functionality, just using a list is enough, though the count of lockers may be high 
## TLDRs

### OOP Principles
- Encapsulation; Hide implementation, expose controlled interface
- Abstraction; Simplify complexity via essential interface
- Inheritance; Reuse and extend existing types
- Polymorphism; Many forms under a single interface

### SOLID Principles
- Single Responsibility; One class, one responsibility
- Open/Closed; Open for extension, closed for modification
- Liskov Substitution; Subtypes replace base without surprises
- Interface Segregation; Small, focused interfaces; no bloat
- Dependency Inversion; Depend on abstractions, not concretes

### Design Principles
- Builder; Piecewise construction for complex objects
- Factory; Encapsulate wholesale object creation
- Abstract Factory; Create families of related objects
- Prototype; Clone prototypes, customize copied objects
- Singleton; Single globally accessible instance
- Adapter; Convert interface to required interface
- Bridge; Decouple abstraction from implementation hierarchies
- Composite; Treat composites and leaves uniformly
- Decorator; Dynamically add responsibilities to objects
- Facade; Simplify subsystem behind single interface
- Flyweight; Share state to reduce memory
- Proxy; Surrogate controlling access to resource
- Chain of Responsibility; Pass request along handler chain
- Command; Encapsulate actions as objects
- CQS; Separate commands from queries
- Interpreter; Parse and evaluate textual languages
- Iterator; Provide traversal object over collection
- Mediator; Centralize component communication and coordination
- Memento; Capture and restore object state
- Observer; Subscribe to receive event notifications
- State; Object behavior varies with state
- Strategy; Swap interchangeable algorithms at runtime
- Template Method; Define algorithm skeleton, override steps
- Visitor; Add operations without altering classes


## Design Patterns
Patterns are language specific [python-patterns.guide](https://python-patterns.guide/),

#### Singleton; Use modules (single-instance by default) instead of forcing Singleton classes.

#### Factory; Use functions or lambdas for object creation; avoid unnecessary factory classes.

#### Facade; Provide simplified interfaces via modules or small wrapper functions; leverage Python imports and visibility.

#### Decorator; Use Python’s `@decorator` syntax and first-class functions for straightforward decoration.

#### Adapter; Prefer duck typing or small wrapper objects—implement the required methods rather than enforcing strict interfaces.

#### Command; Commands can be plain functions, callables, or lambdas; classes are optional.

#### Iterator; Use generators (`yield`) and the iterator protocol (`__iter__` / `__next__`) for concise, idiomatic iteration.

#### Observer; Use callbacks, signals, or event libraries; observers can be any callable—no enforced interface required.

#### State; Swap behavior dynamically via objects, functions, or dicts; heavy inheritance is often unnecessary in Python.

#### Template; Prefer default args, mixins, or base classes with overridable methods; clear docs often substitute formal interfaces.

#### Proxy; Use `__getattr__`/`__setattr__` for transparent proxies; decorators and context managers commonly serve proxy roles.

#### Composite; Leverage lists, containers, and duck typing to build trees without rigid class hierarchies.

#### Chain of Responsibility; Chain callables or use generator pipelines / simple data structures to pass and transform requests.

#### Builder; Use keyword arguments, default parameters, or a fluent interface instead of formal builder classes when possible.

#### Abstract Factory; Prefer simple factory functions or lightweight factory classes—dynamic typing reduces need for heavy abstraction.

#### Prototype; Use the `copy` module or implement `__copy__` / `__deepcopy__` to clone objects.

#### Bridge; Use composition and duck typing to decouple abstraction from implementation.

#### Flyweight; Use dictionaries, caching, or `functools.lru_cache` to share objects/data efficiently.

#### Mediator; Use a simple hub object, event library, or functions to coordinate interactions between components.

#### Memento; Use `pickle` or serialize state via dictionaries for save/restore operations.

#### Interpreter; For small DSLs, consider `eval`/`exec`, parsing libraries, or recursive evaluator functions.

#### Visitor; Use dynamic dispatch (e.g., `getattr`) or simple function passing; strict visitor interfaces are rarely needed.

See [Design Patterns](https://ayush111111.github.io/quartz/notes/LLD2).

## Case studies
