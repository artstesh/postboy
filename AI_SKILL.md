# AI_SKILL.md — @artstesh/postboy v3.5 (Context Document for AI Agents)

> Source of truth: `src/index.ts` + `src/**/*.ts` of this repository. This document targets **consumers** of the library (code written against `@artstesh/postboy`), not contributors.

## 1. 🚀 SCOPE & IMPORTS

`@artstesh/postboy` is a framework-agnostic, strongly-typed message bus for TypeScript. Use it for decoupled pub/sub (`fire`/`sub`), synchronous command execution (`exec`), async request/response (`fireCallback`), a staged middleware pipeline with cancellation, and namespaced feature registrators with lifecycle (`up`/`down`). Sole runtime dependency: `rxjs` >= 7 (peer dependency).

Package entry (dual-format build since 3.4, produced with `tsup`):

```json
{
  "main": "lib/index.cjs",
  "module": "lib/index.mjs",
  "types": "lib/index.d.ts",
  "exports": {
    ".": {
      "types": "./lib/index.d.ts",
      "import": "./lib/index.mjs",
      "require": "./lib/index.cjs"
    }
  }
}
```

```ts
// ESM / TypeScript (named exports only — there is no default export)
import { PostboyService, PostboyGenericMessage, PostboyCallbackMessage, PostboyExecutor } from '@artstesh/postboy';

// CommonJS
const { PostboyService } = require('@artstesh/postboy');
```

Everything below is exported from the package root: `PostboyService`, `PostboyAbstractRegistrator`, `MessageType`, `IPostboyDependingService`, `PostboyMessage`, `PostboyGenericMessage`, `PostboyCallbackMessage`, `PostboyExecutor`, `PostboyExecutionHandler`, `PostboyMiddleware`, `PostboySubscription`, `PostboyMessageMetadata`, `PostboyMessageContext`, `PostboyMiddlewareService`, `PostboyMessageStore`, `PostboyNamespaceStore`, the pipeline types (`MiddlewareStage`, `MiddlewareDecision`, `MiddlewareDecisionType`, `PipelineContext`, `PipelineResult`, `CancelDetails`, `CancelError`), and the infrastructure messages `AddMiddleware`, `RemoveMiddleware`, `AddNamespace`, `EliminateNamespace`, `ConnectMessage`, `ConnectExecutor`, `ConnectHandler`, `DisconnectMessage`, `LockMessage`, `UnlockMessage`.

## 2. 🛠️ CORE API REFERENCE

### PostboyService

```ts
class PostboyService {
  constructor(resolver?: PostboyDependencyResolver) // omit in app code

  // Messaging
  fire(message: PostboyGenericMessage): void                    // throws CancelError if middleware interrupts; throws if type not registered
  fireCallback<T>(message: PostboyCallbackMessage<T>, action?: (e: T) => void): Observable<T> // action is invoked exactly once per emitted value; without action the dispatch is lazy (see §4)
  sub<T extends PostboyGenericMessage>(type: MessageType<T>): Observable<T>
  once<T extends PostboyGenericMessage>(type: MessageType<T>): Observable<T>   // = sub(type).pipe(first())
  exec<T>(executor: PostboyExecutor<T>): T                       // synchronous; throws if executor not registered or cancelled
  dispose(): void                                                // disposes namespaces, store, middleware

  // Bus mutations — @deprecated since v3; use exec(new XxxMessage(...)) equivalents below
  record<T>(type: MessageType<T>, sub: Subject<T>): void
  recordWithPipe<T>(type: MessageType<T>, sub: Subject<T>, pipe: (s: Subject<T>) => Observable<T>): void
  recordExecutor<E extends PostboyExecutor<T>, T>(type: MessageType<E>, exec: (e: E) => T): void
  recordHandler<E extends PostboyExecutor<R>, R>(executor: new (...a: any[]) => E, handler: PostboyExecutionHandler<R, E>): void
}
```

> Removed in v3.5: `lock`, `unlock`, `addMiddleware`, `removeMiddleware`, `addNamespace`, `eliminateNamespace`, `unregister` no longer exist on `PostboyService` — the message-driven flow is the **only** way to perform these operations.

### Infrastructure messages (the only way to mutate the bus)

All extend `PostboyExecutor<void>`-like executors, have a static readonly `ID`, and are dispatched via `postboy.exec(...)`:

| Message | Constructor | Purpose |
|---|---|---|
| `ConnectMessage<T>` | `(type: MessageType<T>, sub: Subject<T>, pipe?: (s: Subject<T>) => Observable<T>)` | register a message subject (replaces deprecated `record` / `recordWithPipe`) |
| `ConnectExecutor<E, T>` | `(type: MessageType<E>, exec: (e: E) => T)` | register an executor function (replaces `recordExecutor`) |
| `ConnectHandler<E, R>` | `(executor: new (...a: any[]) => E, handler: PostboyExecutionHandler<R, E>)` | register a handler object (replaces `recordHandler`) |
| `DisconnectMessage` | `(messageId: string)` — the static `ID` to remove; closes subscriptions and blocks further fire/sub |
| `AddMiddleware` / `RemoveMiddleware` | `(middleware: PostboyMiddleware)` | manage the middleware pipeline |
| `LockMessage<T>` / `UnlockMessage<T>` | `(type: MessageType<T>)` | locked message types are silently not dispatched (registration still works) |
| `AddNamespace` | `(space: string)` — returns the created `PostboyAbstractRegistrator` |
| `EliminateNamespace` | `(space: string)` |

### Middleware pipeline (v3.5)

Middleware is an abstract class with a staged lifecycle. Every `fire` / `fireCallback` / `exec` passes through it:

```ts
enum MiddlewareStage { Publish = 1, Callback, Execute }
enum MiddlewareDecisionType { Continue = 1, Interrupt }
interface MiddlewareDecision { type: MiddlewareDecisionType }
interface PipelineContext<T extends PostboyMessage = PostboyMessage> { stage: MiddlewareStage; message: T }

abstract class PostboyMiddleware {
  readonly name: string;                                  // defaults to class name
  canHandle(context: PipelineContext): boolean            // filter by stage/message; default true
  before(context: PipelineContext): MiddlewareDecision    // return { type: MiddlewareDecisionType.Interrupt } to CANCEL
  after(context: PipelineContext, result?: unknown): void // post-hook; `result` set for the Execute stage
  dispose(): void                                         // called on removal / bus dispose
}

class CancelError extends Error {                         // thrown when a middleware interrupts
  readonly details: CancelDetails;                        // { stage, middleware, messageId, namespace?, reason? }
  name = 'PostboyCancelError';
}
```

Key rules:

- An `Interrupt` returned from `before(...)` throws `CancelError` from `fire`/`exec`/`fireCallback` — the operation does NOT run and `after` hooks for it are not called.
- `canHandle` is consulted for both `before` and `after`; use `context.stage` to distinguish Publish/Callback/Execute.
- Middleware runs for infrastructure messages too — filter with `canHandle` if needed.
- Registration/removal via `exec(new AddMiddleware(mw))` / `exec(new RemoveMiddleware(mw))`; `RemoveMiddleware` calls `mw.dispose()`.

### PostboyAbstractRegistrator

Groups registrations under a namespace; auto-disconnects everything on `down()`.

```ts
abstract class PostboyAbstractRegistrator {
  constructor(postboy: PostboyService, namespace?: string | null) // null → generated id
  get namespace(): string
  registerServices(services: IPostboyDependingService[]): void
  up(): void          // calls abstract protected _up(), then services' up()
  down(): void        // calls services' down(), then exec(new DisconnectMessage(id)) for each recorded id
  protected abstract _up(): void

  // chainable (return this); NOT deprecated — internally use the v3 Connect* messages:
  record<T>(type: MessageType<T>, sub: Subject<T>): this
  recordWithPipe<T>(type, sub, pipe: (s: Subject<T>) => Observable<T>): this
  recordExecutor<E extends PostboyExecutor<T>, T>(type: MessageType<E>, exec: (e: E) => T): this
  recordHandler<E extends PostboyExecutor<R>, R>(executor: ctor, handler: PostboyExecutionHandler<R, E>): this
  recordReplay<T>(type: MessageType<T>, bufferSize = 1): this     // ReplaySubject
  recordBehavior<T>(type: MessageType<T>, initial: T): this      // BehaviorSubject
  recordSubject<T>(type: MessageType<T>): this                   // plain Subject
}
```

## 3. 📐 TYPESCRIPT TYPES

```ts
// Every message and executor MUST declare: static readonly ID = '<unique-string>';
type MessageType<T extends PostboyGenericMessage> = new (...args: any[]) => T;

abstract class PostboyMessage {
  metadata: PostboyMessageMetadata;
  get id(): string;                       // = constructor.ID
  setMetadata(m: Partial<PostboyMessageMetadata>): this;
}
abstract class PostboyGenericMessage extends PostboyMessage {}          // base for pub/sub messages
abstract class PostboyCallbackMessage<T> extends PostboyGenericMessage {
  result: Observable<T>;                  // readonly observable over an internal Subject
  next(value: T): void;                   // emit partial result
  finish(value: T): void;                 // emit final value + complete
  complete(): void;
}
abstract class PostboyExecutor<T> extends PostboyMessage {}             // base for sync commands
abstract class PostboyExecutionHandler<R, E extends PostboyExecutor<R>> {
  abstract handle(executor: E): R;
}

interface PostboyMessageMetadata { correlationId?: string; causationId?: string; tags?: Set<string>; [key: string]: any }
interface PostboyMessageContext { correlationId: string; currentMessageId: string; parentMessageId?: string; depth: number; startedAt: Date; tags?: Set<string> }
interface IPostboyDependingService { up(): void; down?(): void }
```

Note: `PostboyContextService` exists in `src/services/` (correlation-context tracking based on `node:async_hooks`) but is **not exported** from the package root — do not reference it.

## 4. 💡 BEST PRACTICES & IDIOMATIC USAGE

Canonical wiring order: **define class with static ID → register (registrator or ConnectMessage) → subscribe → fire/exec**.

```ts
import { PostboyService, PostboyGenericMessage, PostboyCallbackMessage, PostboyExecutor } from '@artstesh/postboy';
import { Subject } from 'rxjs';

// 1. Define messages (static ID is mandatory)
class PingMessage extends PostboyGenericMessage { static readonly ID = 'app.ping'; constructor(public text: string) { super(); } }
class FetchDataMessage extends PostboyCallbackMessage<string> { static readonly ID = 'app.fetch-data'; }
class GetDataExecutor extends PostboyExecutor<string> { static readonly ID = 'app.get-data'; }

const postboy = new PostboyService();

// 2. Register (v3 style — via infrastructure messages)
postboy.exec(new ConnectMessage(PingMessage, new Subject<PingMessage>()));
postboy.exec(new ConnectExecutor(GetDataExecutor, (e) => 'some-data'));

// 3. Subscribe / execute
postboy.sub(PingMessage).subscribe((m) => console.log(m.text));
postboy.fire(new PingMessage('hello'));
const data: string = postboy.exec(new GetDataExecutor());   // synchronous

// 4. Async request/response: the responder subscribes to the callback message and completes it
postboy.sub(FetchDataMessage).subscribe((m) => m.finish('payload'));
const result = await postboy.fireCallback(new FetchDataMessage()).toPromise(); // or firstValueFrom(...)

// 5. Feature-scoped registrator with lifecycle
class FeatureRegistrator extends PostboyAbstractRegistrator {
  protected _up(): void { this.recordSubject(PingMessage); }
}
const reg = new FeatureRegistrator(postboy, 'feature-a');
reg.up();     // registrations active
reg.down();   // auto-disconnects everything recorded by this registrator
```

Rules of composition:

- One registration per message ID; re-registering overwrites silently. Group a feature's registrations in one `PostboyAbstractRegistrator` subclass so `down()` cleans them all.
- Use `recordReplay` for "latest value on subscribe" semantics and `recordBehavior` for state; use `recordWithPipe`/`ConnectMessage` with a pipe for shared/debounced streams.
- Prefer registrators over bare `exec(new ConnectMessage(...))` in application code — they track IDs and dispose.
- Middleware: move validation/gating to `before` (return `Interrupt` to cancel), logging/side effects to `after`. Catch `CancelError` at call sites where cancellation is expected and check `error.details` (stage, middleware, messageId, reason).
- `fireCallback` with no `action` argument dispatches the message **lazily** — the subject fires only when the returned Observable is subscribed. Pass `action` (or subscribe immediately) when the request must be sent right away. The request is dispatched **at most once per `fireCallback` call**: further subscriptions to the returned Observable never re-send it. When `action` IS passed, it is invoked exactly once per emitted value, no matter how many subscriptions the returned Observable has — do not add extra `subscribe(action)` calls on the result. `after` middleware hooks for the Callback stage fire on each result emission.
- Error handling: `checkId` throws `"<ClassName> should have a static ID field"`; `fire` throws for unregistered message IDs; `exec` throws for unregistered executor IDs (TypeError calling undefined). Wrap `exec`/`fire` in try/catch at call sites where registration is not guaranteed; treat a locked message as a no-op, not an error.

## 5. ⚠️ ANTI-PATTERNS & PITFALLS

**Do NOT use these (common LLM hallucinations):**

- `postboy.lock(...)` / `unlock(...)` / `addMiddleware(...)` / `removeMiddleware(...)` / `addNamespace(...)` / `eliminateNamespace(...)` / `unregister(...)` — **removed in v3.5**, they no longer exist. Generate `exec(new LockMessage/UnlockMessage/AddMiddleware/RemoveMiddleware/AddNamespace/EliminateNamespace/DisconnectMessage(...))` instead.
- `postboy.record(...)`, `recordExecutor`, `recordHandler` — still present but `@deprecated`; generate `exec(new ConnectMessage/ConnectExecutor/ConnectHandler(...))` instead. (Exception: the chainable `record*` methods on `PostboyAbstractRegistrator` are NOT deprecated — use those.)
- Old single-hook middleware (`interface PostboyMiddleware { handle(message) }`) — replaced in v3.5 by the abstract class with `canHandle`/`before`/`after`/`dispose` and stage-based `PipelineContext`. There is no `handle()` anymore.
- `PostboyContextService` — not exported from the package root (and it depends on `node:async_hooks`, server-only). Do not import or emulate it.
- `postboy.subscribe(...)` / `postboy.on(...)` / `postboy.emit(...)` — do not exist. The verbs are `sub`, `once`, `fire`, `fireCallback`, `exec`.
- `new PostboyService(someConfig)` — the optional constructor arg is a `PostboyDependencyResolver`, not settings. Construct with no arguments.
- `PostboyMessage` without a static `ID` — `checkId` throws. `ID` must be `static readonly` on the class itself (inheriting a parent's `ID` causes ID collisions and cross-talk).
- Mocking helper assumptions: `postboy.sub(type)` returns `Observable<T>` (not a `Subject`). Do not call `.next()` on it.
- `isCancelError(...)` exists in sources but is not exported from the package root — use `error.name === 'PostboyCancelError'` or `error instanceof CancelError`.

**Hard constraints:**

- Never `fire`/`sub` a message before it is registered (throws / cold no-op respectively). Register in `up()` / module init, subscribe after.
- Never fire `LockMessage`/`DisconnectMessage` for infrastructure IDs you don't own — locked messages are silently dropped, which looks like data loss.
- Never reuse the same `ID` string across two message classes; all routing is keyed by static `ID`, not class identity.
- Never fire a callback message's `result` from outside: the responder calls `message.next/finish` in its `sub` handler; calling `fireCallback` again with the same instance re-subscribes `action`.
- Do not forget `registrator.down()` / `postboy.dispose()` on teardown — Subjects are not auto-completed otherwise. `dispose()` also calls `dispose()` on every registered middleware.
- `exec` is synchronous and returns `T` directly — do not `await` it or treat its result as an `Observable`. For async results use `PostboyCallbackMessage` + `fireCallback`.
