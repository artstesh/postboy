import { PostboyService } from './postboy.service';
import { BehaviorSubject, Observable, pipe, ReplaySubject, Subject } from 'rxjs';
import { IPostboyDependingService } from './i-postboy-depending.service';
import { PostboyExecutor } from './models/postboy-executor';
import { checkId, PostboyGenericMessage } from './models/postboy-generic-message';
import { PostboyExecutionHandler } from './models/postboy-execution.handler';
import { IdGenerator } from './utils/id.generator';

export type MessageType<T extends PostboyGenericMessage> = new (...args: any[]) => T;

export abstract class PostboyAbstractRegistrator {
  get namespace(): string {
    return this._namespace;
  }
  private ids: string[] = [];
  private services: IPostboyDependingService[] = [];
  private readonly _namespace: string;

  constructor(
    protected postboy: PostboyService,
    namespace: string | null = null,
  ) {
    this._namespace = namespace ?? IdGenerator.get();
  }

  /**
   * Registers a list of services to be used by the application.
   *
   * @param {IPostboyDependingService[]} services - An array of services to register.
   * @return {void} This method does not return a value.
   */
  public registerServices(services: IPostboyDependingService[]): void {
    this.services = services;
  }

  /**
   * Initiates the 'up' process for the current instance and all associated services.
   *
   * @return {void} Does not return a value.
   */
  public up(): void {
    this._up?.();
    this.services.forEach((s) => s.up());
  }

  protected abstract _up(): void;

  public down(): void {
    this.services.forEach((s) => !!s.down && s.down());
    this.services = [];
    this.ids.forEach((id) => this.postboy.unregister(id));
  }

  /**
   * Records a type and its corresponding Subject<T> into the Postboy system and updates the internal identifiers.
   *
   * @param {MessageType<T>} type - A constructor for the generic message type T.
   * @param {Subject<T>} sub - The subject associated with the generic message type.
   * @return {this} Returns the current instance for method chaining.
   */
  public record<T extends PostboyGenericMessage>(type: MessageType<T>, sub: Subject<T>): PostboyAbstractRegistrator {
    this.ids.push(checkId(type));
    this.postboy.record(type, sub);
    return this;
  }

  /**
   * Records a message type with a specific subject and applies a transformation pipe to the subject.
   *
   * @param {MessageType<T>} type - The constructor of the message type to record, which extends PostboyGenericMessage.
   * @param {Subject<T>} sub - The Subject instance to associate with the message type.
   * @param {(s: Subject<T>) => Observable<T>} pipe - A function that takes the subject as input and returns an Observable with transformations applied.
   * @return {this} The current instance of the class for chaining.
   */
  public recordWithPipe<T extends PostboyGenericMessage>(
    type: MessageType<T>,
    sub: Subject<T>,
    pipe: (s: Subject<T>) => Observable<T>,
  ): PostboyAbstractRegistrator {
    this.ids.push(checkId(type));
    this.postboy.recordWithPipe(type, sub, pipe);
    return this;
  }

  /**
   * Records an executor associated with a specific type and execution logic.
   *
   * @param type The class constructor of the executor type to be recorded, which extends PostboyExecutor.
   * @param exec A callback function that executes the logic using an instance of the specified executor type.
   * @return void
   */
  public recordExecutor<E extends PostboyExecutor<T>, T>(
    type: new (...args: any[]) => E,
    exec: (e: E) => T,
  ): PostboyAbstractRegistrator {
    this.postboy.recordExecutor(type, exec);
    return this;
  }

  /**
   * Records a handler for a specific executor type.
   *
   * @param executor The constructor of the executor type, which extends `PostboyExecutor`.
   * @param handler The execution handler associated with the given executor type.
   * @return void
   */
  public recordHandler<E extends PostboyExecutor<R>, R>(
    executor: new (...args: any[]) => E,
    handler: PostboyExecutionHandler<R, E>,
  ): PostboyAbstractRegistrator {
    this.postboy.recordHandler(executor, handler);
    return this;
  }

  /**
   * A utility function that facilitates the recording and replaying of messages
   * using a ReplaySubject. This function is designed to handle messages of a
   * specific type and allows specifying a buffer size to determine how many
   * of the most recent messages should be replayed.
   *
   * @template T Extends the PostboyGenericMessage type, representing the type of message
   * to be recorded and replayed.
   * @param {MessageType<T>} type The constructor of the message type to be recorded and replayed.
   * @param {number} [bufferSize=1] The number of recent messages to retain in the ReplaySubject's buffer.
   * Defaults to 1 if not specified.
   * @returns The result of invoking the `record` method with the given message type and configured ReplaySubject.
   */
  public recordReplay<T extends PostboyGenericMessage>(
    type: MessageType<T>,
    bufferSize = 1,
  ): PostboyAbstractRegistrator {
    this.record(type, new ReplaySubject<T>(bufferSize));
    return this;
  }

  /**
   * Represents a method that records a specific behavior associated with a message type.
   * It creates a `BehaviorSubject` initialized with the provided initial message
   * and associates it with the given message type using the `record` method.
   *
   * @template T - A type parameter extending `PostboyGenericMessage` that defines the message structure.
   * @param {MessageType<T>} type - The constructor function of the message type to be recorded.
   * @param {T} initial - The initial value of the message that will be set in the `BehaviorSubject`.
   * @returns {void} - This function does not return a value; instead, it modifies the internal state.
   */
  public recordBehavior<T extends PostboyGenericMessage>(type: MessageType<T>, initial: T): PostboyAbstractRegistrator {
    this.record(type, new BehaviorSubject<T>(initial));
    return this;
  }

  /**
   * A function that creates and returns a new generic message recorder for a specific message type.
   *
   * @template T - A type parameter extending from `PostboyGenericMessage`.
   * @param {MessageType<T>} type - The constructor for the message type being recorded.
   * @returns {Subject<T>} A new instance of `Subject<T>` bound to the specified message type.
   */
  public recordSubject<T extends PostboyGenericMessage>(type: MessageType<T>) {
    this.record(type, new Subject<T>());
    return this;
  }
}
