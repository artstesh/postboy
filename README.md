# Introduction

## 1.1 About the Library
Modern web development often feels like a survival race: components are scattered across dependency trees, services communicate through layers of abstraction, and events multiply like rabbits in the Australian outback. In this chaos, managing communication isn’t just a task—it’s an art of balancing flexibility and order.

**Postboy** was born from this chaos. It’s not just another RxJS-based Event Bus—it’s an attempt to bridge the gap between the power of reactive programming and everyday simplicity. Over years of working with Angular, I’ve watched standard event-handling approaches drown in boilerplate code, while complex state managers morphed into impenetrable "black boxes." Postboy is my answer to these challenges.

**Key Features:**
- Lightweight architecture with zero hidden dependencies.
- Flexible messaging system backed by TypeScript typing.
- Middleware for intercepting and transforming events (logging, validation, metrics).
- Async operations and callback management tools.
- Reactive patterns out of the box: ReplaySubject, BehaviorSubject, and more.

Postboy doesn’t aim to replace NgRx or Akita—it solves a narrower set of problems but does so with minimal entry barriers.

---

## 1.2. Core Concepts
Imagine Postboy as your app’s postal service. Here’s how it works:

- **Messages (PostboyMessage)**  
  These are data envelopes. Every message has a unique `ID` and can carry anything: a simple notification, a complex DTO, or even a `UserLoggedInEvent` or `DataFetchRequest`.

- **Subscriptions**  
  Like subscribing to a magazine. Components register interest in specific message types and react when they "arrive in the mailbox."

- **Handlers (Executors)**  
  Special agents that execute synchronous tasks on demand. Need to fetch data from a store or validate permissions? An Executor handles it without event spaghetti.

- **Middleware**  
  Customs officers inspecting every message at the border. Need to add auth headers or log errors? Middleware centralizes these tasks.

- **Registrators**  
  Archivists managing subscription lifecycles. They prevent memory leaks and keep your codebase tidy.

---

### Why Does It Work?
Over the past five years, I’ve built dozens of enterprise apps. One recurring issue? Logic fragmentation. Components communicate via `@Output()` chains and services until a single button change breaks three screens. Postboy offers an alternative: a centralized yet unobtrusive event bus that doesn’t demand architectural overhauls.
