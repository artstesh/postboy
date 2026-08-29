import { PostboyService } from './postboy.service';
import { BehaviorSubject, Observable, pipe, ReplaySubject, Subject } from 'rxjs';
import { IPostboyDependingService } from './i-postboy-depending.service';
import { PostboyExecutor } from './models/postboy-executor';
import { checkId, PostboyGenericMessage } from './models/postboy-generic-message';
import { PostboyExecutionHandler } from './models/postboy-execution.handler';
import { IdGenerator } from './utils/id.generator';
import { ConnectMessage } from './messages/connect-message.executor';
import { DisconnectMessage } from './messages/disconnect-message.executor';
import { ConnectExecutor } from './messages/connect-executor.executor';
import { ConnectHandler } from './messages/connect-handler.executor';

/**
 * Constructor signature of a message class.
 *
 * The bus identifies message types by the static `ID` such a constructor carries (see
 * {@link PostboyGenericMessage}), not by class identity — two different classes sharing
 * an `ID` collide on the same registration (the later one overrides the earlier one
 * with a warning).
 */
export type MessageType<T extends PostboyGenericMessage> = new (...args: any[]) => T;

/**
 * Base class for feature registrators: registers messages and executors for one feature
 * and remembers every recorded `ID`, so that a single {@link down} disconnects them all.
 *
 * Subclasses make their `record*` calls inside the abstract {@link _up} hook; services
 * attached via {@link registerServices} share the same lifecycle. Create one registrator
 * per feature (or per namespace, via `AddNamespace`) and keep the instance to tear the
 * feature down later.
 *
 * @example
 * ```ts
 * class FeatureRegistrator extends PostboyAbstractRegistrator {
 *   protected _up(): void {
 *     this.recordSubject(PingMessage).recordExecutor(GetDataExecutor, (e) => e.payload);
 *   }
 * }
 *
 * const reg = new FeatureRegistrator(postboy, 'feature-a');
 * reg.up(); // registrations are live
 * reg.down(); // everything recorded above is disconnected
 * ```
 */
export abstract class PostboyAbstractRegistrator {
  /**
   * Identifier of this registrator: the name passed to the constructor, or a generated
   * unique id when none was given. It identifies the registrator only — message routing
   * is not affected by it.
   */
  get namespace(): string {
    return this._namespace;
  }
  private ids: string[] = [];
  private services: IPostboyDependingService[] = [];
  private readonly _namespace: string;

  /**
   * @param postboy - The bus every `record*` call is executed on.
   * @param namespace - Optional name exposed by {@link namespace}; a random unique id is generated when omitted.
   */
  constructor(
    protected postboy: PostboyService,
    namespace: string | null = null,
  ) {
    this._namespace = namespace ?? IdGenerator.get();
  }

  /**
   * Sets the services that share this registrator's lifecycle: their `up()` runs on
   * {@link up} (after the registrations), their `down()` on {@link down} (before the
   * disconnection). Replaces any previously registered list.
   *
   * @param services - Services to attach to the lifecycle.
   */
  public registerServices(services: IPostboyDependingService[]): void {
    this.services = services;
  }

  /**
   * Activates the registrator: runs the {@link _up} registration hook, then calls `up()`
   * on every attached service.
   */
  public up(): void {
    this._up?.();
    this.services.forEach((s) => s.up());
  }

  /**
   * Registration hook executed by {@link up}. Subclasses make all their `record*` calls
   * here so that {@link down} can disconnect them.
   */
  protected abstract _up(): void;

  /**
   * Tears the registrator down, in order: calls `down()` on every attached service (then
   * clears the service list), then executes a `DisconnectMessage` for each recorded `ID`,
   * completing subscriber streams and removing handlers registered by this registrator.
   */
  public down(): void {
    this.services.forEach((s) => !!s.down && s.down());
    this.services = [];
    this.ids.forEach((id) => this.postboy.exec(new DisconnectMessage(id)));
  }

  /**
   * Registers a message type with the given subject and remembers its `ID` for {@link down}.
   *
   * @param type - The constructor of the message type; must declare its own static `ID`.
   * @param sub - The subject subscribers will observe.
   * @return This registrator, for chaining.
   */
  public record<T extends PostboyGenericMessage>(type: MessageType<T>, sub: Subject<T>): PostboyAbstractRegistrator {
    this.ids.push(checkId(type));
    this.postboy.exec(new ConnectMessage(type, sub));
    return this;
  }

  /**
   * Registers a message type whose stream is transformed by a pipe before reaching
   * subscribers, and remembers its `ID` for {@link down}.
   *
   * @param type - The constructor of the message type; must declare its own static `ID`.
   * @param sub - The subject subscribers will observe.
   * @param pipe - Wraps the subject into the observable handed out by `PostboyService.sub`, e.g. to apply operators.
   * @return This registrator, for chaining.
   */
  public recordWithPipe<T extends PostboyGenericMessage>(
    type: MessageType<T>,
    sub: Subject<T>,
    pipe: (s: Subject<T>) => Observable<T>,
  ): PostboyAbstractRegistrator {
    this.ids.push(checkId(type));
    this.postboy.exec(new ConnectMessage(type, sub, pipe));
    return this;
  }

  /**
   * Registers a synchronous handler for an executor type and remembers its `ID` for {@link down}.
   *
   * @param type - The constructor of the executor class; must declare its own static `ID`.
   * @param exec - Called with the executor instance on every `PostboyService.exec` of this type.
   * @return This registrator, for chaining.
   */
  public recordExecutor<E extends PostboyExecutor<T>, T>(
    type: new (...args: any[]) => E,
    exec: (e: E) => T,
  ): PostboyAbstractRegistrator {
    this.ids.push(checkId(type));
    this.postboy.exec(new ConnectExecutor(type, exec));
    return this;
  }

  /**
   * Registers a {@link PostboyExecutionHandler} for an executor type and remembers its
   * `ID` for {@link down}. The handler's `handle` method is invoked on every
   * `PostboyService.exec` of this type.
   *
   * @param executor - The constructor of the executor class; must declare its own static `ID`.
   * @param handler - The handler instance receiving the executor.
   * @return This registrator, for chaining.
   */
  public recordHandler<E extends PostboyExecutor<R>, R>(
    executor: new (...args: any[]) => E,
    handler: PostboyExecutionHandler<R, E>,
  ): PostboyAbstractRegistrator {
    this.ids.push(checkId(executor));
    this.postboy.exec(new ConnectHandler(executor, handler));
    return this;
  }

  /**
   * Registers the type with a `ReplaySubject`: new subscribers first receive up to
   * `bufferSize` most recently fired messages, then live ones. Suited for
   * "latest events" streams where late subscribers need recent history.
   *
   * @param type - The constructor of the message type; must declare its own static `ID`.
   * @param bufferSize - How many past messages to replay to new subscribers; defaults to 1.
   * @return This registrator, for chaining.
   */
  public recordReplay<T extends PostboyGenericMessage>(
    type: MessageType<T>,
    bufferSize = 1,
  ): PostboyAbstractRegistrator {
    this.record(type, new ReplaySubject<T>(bufferSize));
    return this;
  }

  /**
   * Registers the type with a `BehaviorSubject` seeded with `initial`: every new
   * subscriber immediately receives the most recent message — the seed itself until
   * anything is fired. Suited for state-like messages rather than one-off events.
   *
   * @param type - The constructor of the message type; must declare its own static `ID`.
   * @param initial - The message instance new subscribers receive before any `PostboyService.fire`.
   * @return This registrator, for chaining.
   */
  public recordBehavior<T extends PostboyGenericMessage>(type: MessageType<T>, initial: T): PostboyAbstractRegistrator {
    this.record(type, new BehaviorSubject<T>(initial));
    return this;
  }

  /**
   * Registers the type with a plain `Subject`: subscribers only see messages fired after
   * they subscribed. The default choice for event-like messages.
   *
   * @param type - The constructor of the message type; must declare its own static `ID`.
   * @return This registrator, for chaining.
   */
  public recordSubject<T extends PostboyGenericMessage>(type: MessageType<T>) {
    this.record(type, new Subject<T>());
    return this;
  }
}
