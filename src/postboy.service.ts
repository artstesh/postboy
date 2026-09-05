import { first, Observable, Subject, tap } from 'rxjs';
import { checkId, PostboyGenericMessage } from './models/postboy-generic-message';
import { PostboySubscription } from './models/postboy-subscription';
import { PostboyExecutor } from './models/postboy-executor';
import { PostboyCallbackMessage } from './models/postboy-callback.message';
import { MessageType } from './postboy-abstract.registrator';
import { PostboyExecutionHandler } from './models/postboy-execution.handler';
import { PostboyDependencyResolver } from './services/postboy-dependency.resolver';
import { PostboyMiddlewareService } from './services/postboy-middleware.service';
import { PostboyMessageStore } from './services/postboy-message.store';
import { PostboyNamespaceStore } from './services/postboy-namespace.store';
import { AddNamespace } from './messages/add-namespace.executor';
import { EliminateNamespace } from './messages/eliminate-namespace.executor';
import { AddMiddleware } from './messages/add-middleware.executor';
import { RemoveMiddleware } from './messages/remove-middleware.executor';
import { LockMessage } from './messages/lock-message.executor';
import { UnlockMessage } from './messages/unlock-message.executor';
import { DisconnectMessage } from './messages/disconnect-message.executor';
import { ConnectMessage } from './messages/connect-message.executor';
import { ConnectExecutor } from './messages/connect-executor.executor';
import { ConnectHandler } from './messages/connect-handler.executor';

/**
 * The central message bus of the postboy library.
 *
 * All routing is keyed by the static `ID` declared on message and executor classes —
 * not by class identity. Three kinds of traffic are supported:
 * - pub/sub: register a message type with a `ConnectMessage`, subscribe via {@link sub},
 *   dispatch via {@link fire};
 * - synchronous commands: register a handler with a `ConnectExecutor`/`ConnectHandler`,
 *   invoke it via {@link exec};
 * - async request/response: a {@link PostboyCallbackMessage} fired via {@link fireCallback}.
 *
 * Every bus mutation — registration, middleware, locking, namespaces — is performed by
 * executing one of the infrastructure messages via {@link exec}; the constructor wires
 * their handlers automatically.
 *
 * @example
 * ```ts
 * class PingMessage extends PostboyGenericMessage {
 *   static readonly ID = 'app.ping';
 *   constructor(public text: string) {
 *     super();
 *   }
 * }
 *
 * const postboy = new PostboyService();
 * postboy.exec(new ConnectMessage(PingMessage, new Subject<PingMessage>()));
 * postboy.sub(PingMessage).subscribe((m) => console.log(m.text));
 * postboy.fire(new PingMessage('hello'));
 * ```
 */
export class PostboyService {
  /** Ids of message types locked via `LockMessage`; {@link fire} and {@link fireCallback} skip their delivery. */
  protected locked = new Set<string>();
  private middleware: PostboyMiddlewareService;
  private store: PostboyMessageStore;
  private namespaceStore: PostboyNamespaceStore;
  private dependencyResolver: PostboyDependencyResolver;

  /**
   * Creates a bus and registers handlers for all infrastructure messages.
   *
   * @param resolver - Supplies the internal collaborators (middleware pipeline, message store, namespace store).
   * Defaults to a `PostboyDependencyResolver` with fresh instances; pass a custom one to inject test doubles.
   */
  constructor(resolver?: PostboyDependencyResolver) {
    this.dependencyResolver = resolver || new PostboyDependencyResolver();
    this.middleware = this.dependencyResolver.getMiddlewareService();
    this.store = this.dependencyResolver.getMessageStore();
    this.namespaceStore = this.dependencyResolver.getNamespaceStore();
    this.registerInfrastructureMessages();
  }

  /** Registers handlers for the infrastructure messages — the only way to mutate the bus. */
  private registerInfrastructureMessages() {
    this.store.registerExecutor(DisconnectMessage.ID, (e) => this.store.unregister((e as DisconnectMessage).messageId));
    this.store.registerExecutor(UnlockMessage.ID, (e) => this.locked.delete(checkId((e as UnlockMessage<any>).type)));
    this.store.registerExecutor(LockMessage.ID, (e) => this.locked.add(checkId((e as LockMessage<any>).type)));
    this.store.registerExecutor(AddMiddleware.ID, (e) =>
      this.middleware.addMiddleware((e as AddMiddleware).middleware),
    );
    this.store.registerExecutor(RemoveMiddleware.ID, (e) =>
      this.middleware.removeMiddleware((e as RemoveMiddleware).middleware),
    );
    this.store.registerExecutor(AddNamespace.ID, (e) => this.namespaceStore.addSpace((e as AddNamespace).space, this));
    this.store.registerExecutor(EliminateNamespace.ID, (e) =>
      this.namespaceStore.eliminateSpace((e as EliminateNamespace).space),
    );
    this.store.registerExecutor(ConnectMessage.ID, (e) => {
      const { type, sub, pipe } = e as ConnectMessage<any>;
      this.store.registerMessage(checkId(type), new PostboySubscription<any>(sub, pipe));
    });
    this.store.registerExecutor(ConnectExecutor.ID, (e) => {
      const { type, exec } = e as ConnectExecutor<any, any>;
      this.store.registerExecutor(checkId(type), exec);
    });
    this.store.registerExecutor(ConnectHandler.ID, (e) => {
      const { executor, handler } = e as ConnectHandler<any, any>;
      this.store.registerExecutor(checkId(executor), (e) => handler.handle(e));
    });
  }

  /**
   * Publishes a message to all current subscribers of its type.
   *
   * Runs the `Publish`-stage middleware `before` hooks, delivers the message to the
   * registered subject, then runs the `after` hooks. If the type is locked (see
   * `LockMessage`), delivery is silently skipped — subscribers receive nothing — but
   * both middleware hooks still run.
   *
   * @param message - The message instance to publish.
   * @throws CancelError When a `Publish`-stage middleware returns an interrupt decision.
   * @throws Error When no message of this type is registered; the `after` hooks are then skipped.
   */
  public fire(message: PostboyGenericMessage): void {
    this.middleware.beforePublish(message);
    if (!this.locked.has(message.id)) {
      this.store.getMessage(message.id, message.constructor.name).fire(message);
    }
    this.middleware.afterPublish(message);
  }

  /**
   * Fires a {@link PostboyCallbackMessage} and returns an observable of its result (async request/response).
   *
   * The responder side subscribes to the message type via {@link sub} and produces the
   * result with `message.next(...)` / `message.finish(...)`.
   *
   * Dispatch semantics depend on `action`:
   * - with `action`, the message is dispatched immediately and `action` is invoked once
   *   per emitted result value, independently of any subscriptions to the returned
   *   observable;
   * - without `action`, dispatch is lazy: it happens on the first subscription to the
   *   returned observable.
   *
   * In both modes the message is dispatched at most once per `fireCallback` call:
   * further subscriptions to the returned observable never re-send the request.
   *
   * `Callback`-stage middleware `before` hooks run at call time; `after` hooks run on
   * every emitted result value. If the type is locked, dispatch is silently skipped.
   * The result observable completes when the message type is disconnected
   * (see `DisconnectMessage`) or the bus is disposed.
   *
   * @param message - The callback message carrying the request.
   * @param action - Optional callback invoked once per emitted result value.
   * @return An observable emitting the result values produced by the responder.
   * @throws CancelError When a `Callback`-stage middleware returns an interrupt decision.
   * @throws Error When no message of this type is registered; thrown synchronously, before any dispatch.
   *
   * @example
   * ```ts
   * postboy.exec(new ConnectMessage(FetchDataMessage, new Subject<FetchDataMessage>()));
   * // responder: produces the result
   * postboy.sub(FetchDataMessage).subscribe((m) => m.finish('payload'));
   * // requester: consumes it
   * postboy.fireCallback(new FetchDataMessage()).subscribe((payload) => console.log(payload));
   * ```
   */
  public fireCallback<T>(message: PostboyCallbackMessage<T>, action?: (e: T) => void): Observable<T> {
    this.middleware.beforeCallback(message);
    this.store.callbackFired(message);
    if (action) message.result.subscribe(action);
    const msg = this.store.getMessage(message.id, message.constructor.name);
    let dispatched = false;
    const observable = new Observable<T>((subscriber) => {
      const subscription = message.result.pipe(tap(() => this.middleware.afterCallback(message))).subscribe(subscriber);

      if (!dispatched && !this.locked.has(message.id)) {
        dispatched = true;
        msg.fire(message);
      }

      return () => subscription.unsubscribe();
    });
    if (!!action) observable.subscribe();
    return observable;
  }

  /**
   * Synchronously executes a registered executor command and returns its result — never `await` it.
   *
   * Runs the `Execute`-stage middleware `before` hooks, invokes the handler registered
   * for the executor's static `ID`, then the `after` hooks with the result. For async
   * results use a {@link PostboyCallbackMessage} with {@link fireCallback} instead.
   *
   * This is also the entry point for the infrastructure messages themselves
   * (`ConnectMessage`, `AddMiddleware`, ...), so middleware sees them on the `Execute`
   * stage too — filter them out with `canHandle` if needed.
   *
   * @param executor - The executor instance carrying the command.
   * @return Whatever the registered handler returns.
   * @throws CancelError When an `Execute`-stage middleware returns an interrupt decision.
   * @throws Error When no handler is registered for this executor type.
   */
  public exec<T>(executor: PostboyExecutor<T>): T {
    this.middleware.beforeExecute(executor);
    const result = this.store.getExecutor<T>(executor.id)(executor);
    this.middleware.afterExecute(executor, result);
    return result;
  }

  /**
   * Returns the observable stream of a registered message type.
   *
   * Every call returns a view of the one registered subject — or of its pipe, when the
   * type was registered via `ConnectMessage` with a pipe. It is an `Observable`, not a
   * `Subject`: never call `next` on it, emit via {@link fire}. Subscribers only receive
   * messages fired after their subscription, unless the type was registered with a
   * replay or behavior subject.
   *
   * @param type - The constructor of the message type; must declare its own static `ID`.
   * @throws Error When the class has no static `ID` or no message of this type is registered.
   */
  public sub<T extends PostboyGenericMessage>(type: MessageType<T>): Observable<T> {
    return this.store.getMessage(checkId(type), type.name).sub();
  }

  /**
   * Like {@link sub}, but completes right after the first message of the type arrives.
   *
   * @param type - The constructor of the message type; must declare its own static `ID`.
   * @return An observable that emits one message and then completes.
   * @throws Error When the class has no static `ID` or no message of this type is registered.
   */
  public once<T extends PostboyGenericMessage>(type: MessageType<T>): Observable<T> {
    return this.sub(type).pipe(first());
  }

  /**
   * Registers a message type with the given subject.
   *
   * Re-registering the same `ID` logs a warning and overrides the previous registration.
   *
   * @deprecated The method should be replaced with firing {@link ConnectMessage} message.
   * @param type - The constructor of the message type; must declare its own static `ID`.
   * @param sub - The subject subscribers will observe.
   */
  public record<T extends PostboyGenericMessage>(type: MessageType<T>, sub: Subject<T>): void {
    this.store.registerMessage(checkId(type), new PostboySubscription<T>(sub, (s) => s.asObservable()));
  }

  /**
   * Registers a message type whose stream is transformed by a pipe before reaching subscribers.
   *
   * Re-registering the same `ID` logs a warning and overrides the previous registration.
   *
   * @deprecated The method should be replaced with firing {@link ConnectMessage} message.
   * @param type - The constructor of the message type; must declare its own static `ID`.
   * @param sub - The subject subscribers will observe.
   * @param pipe - Wraps the subject into the observable handed out by {@link sub}, e.g. to apply operators.
   */
  public recordWithPipe<T extends PostboyGenericMessage>(
    type: MessageType<T>,
    sub: Subject<T>,
    pipe: (s: Subject<T>) => Observable<T>,
  ): void {
    this.store.registerMessage(checkId(type), new PostboySubscription<T>(sub, pipe));
  }

  /**
   * Registers a synchronous handler for an executor type, invoked by {@link exec}.
   *
   * Re-registering the same `ID` logs a warning and overrides the previous registration.
   *
   * @deprecated The method should be replaced with firing {@link ConnectExecutor} message.
   * @param type - The constructor of the executor class; must declare its own static `ID`.
   * @param exec - Called with the executor instance on every {@link exec} of this type.
   */
  public recordExecutor<E extends PostboyExecutor<T>, T>(type: MessageType<E>, exec: (e: E) => T): void {
    this.store.registerExecutor(checkId(type), exec as (e: PostboyExecutor<T>) => T);
  }

  /**
   * Registers a {@link PostboyExecutionHandler} instance for an executor type, invoked by {@link exec}.
   *
   * Re-registering the same `ID` logs a warning and overrides the previous registration.
   *
   * @deprecated The method should be replaced with firing {@link ConnectHandler} message.
   * @param executor - The constructor of the executor class; must declare its own static `ID`.
   * @param handler - Its `handle` method is called with the executor instance on every {@link exec} of this type.
   */
  public recordHandler<E extends PostboyExecutor<R>, R>(
    executor: new (...args: any[]) => E,
    handler: PostboyExecutionHandler<R, E>,
  ): void {
    this.store.registerExecutor(checkId(executor), (e) => handler.handle(e as E));
  }

  /**
   * Tears down the whole bus: calls `down()` on every namespace registrator (completing
   * everything they registered), completes all remaining message subscriptions and
   * callback results, disposes every middleware, and releases all locked ids.
   *
   * Infrastructure registrations are re-created only by constructing a new service.
   */
  public dispose(): void {
    this.namespaceStore?.dispose();
    this.store.dispose();
    this.middleware.dispose();
    this.locked.clear();
  }
}
