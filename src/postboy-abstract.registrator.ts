import { PostboyService } from './postboy.service';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { IPostboyDependingService } from './i-postboy-depending.service';
import { PostboyExecutor } from './models/postboy-executor';
import { checkId, PostboyGenericMessage } from './models/postboy-generic-message';

export type MessageType<T extends PostboyGenericMessage> = new (...args: any[]) => T;

export abstract class PostboyAbstractRegistrator {
  private ids: string[] = [];
  private services: IPostboyDependingService[] = [];

  constructor(protected postboy: PostboyService) {}

  /**
   * Registers a list of services to be used by the application.
   *
   * @param {IPostboyDependingService[]} services - An array of services to register.
   * @return {void} This method does not return a value.
   */
  public registerServices(services: IPostboyDependingService[]): void {
    this.services = services;
  }

  public up(): void {
    this._up();
    this.services.forEach((s) => s.up());
  }

  protected abstract _up(): void;

  /**
   * @deprecated The method should be replaced with recordExecutor<T>
   */
  public registerExecutor<E extends PostboyExecutor<T>, T>(id: string, exec: (e: E) => T): void {
    this.postboy.registerExecutor(id, exec);
  }

  /**
   * @deprecated The method should be replaced with record<T>
   */
  public register<T>(id: string, sub: Subject<T>): void {
    this.ids.push(id);
    this.postboy.register(id, sub);
  }

  /**
   * @deprecated The method should be replaced with recordWithPipe<T>
   */
  public registerWithPipe<T>(id: string, sub: Subject<T>, pipe: (s: Subject<T>) => Observable<T>): void {
    this.ids.push(id);
    this.postboy.registerWithPipe(id, sub, pipe);
  }

  /**
   * @deprecated The method should be replaced with recordReplay<T>
   */
  public registerReplay = <T>(id: string, bufferSize = 1) => this.register(id, new ReplaySubject<T>(bufferSize));

  /**
   * @deprecated The method should be replaced with recordBehavior<T>
   */
  public registerBehavior = <T>(id: string, initial: T) => this.register(id, new BehaviorSubject<T>(initial));

  /**
   * @deprecated The method should be replaced with recordSubject<T>
   */
  public registerSubject = <T>(id: string) => this.register(id, new Subject<T>());

  public down(): void {
    this.services = [];
    this.ids.forEach((id) => this.postboy.unregister(id));
  }

  // future

  /**
   * Records a type and its corresponding Subject<T> into the Postboy system and updates the internal identifiers.
   *
   * @param {MessageType<T>} type - A constructor for the generic message type T.
   * @param {Subject<T>} sub - The subject associated with the generic message type.
   * @return {this} Returns the current instance for method chaining.
   */
  public record<T extends PostboyGenericMessage>(type: MessageType<T>, sub: Subject<T>): this {
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
  ): this {
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
  public recordExecutor<E extends PostboyExecutor<T>, T>(type: new (...args: any[]) => E, exec: (e: E) => T): void {
    this.postboy.recordExecutor(type, exec);
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
  public recordReplay = <T extends PostboyGenericMessage>(type: MessageType<T>, bufferSize = 1) =>
    this.record(type, new ReplaySubject<T>(bufferSize));

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
  public recordBehavior = <T extends PostboyGenericMessage>(type: MessageType<T>, initial: T) =>
    this.record(type, new BehaviorSubject<T>(initial));

  /**
   * A function that creates and returns a new generic message recorder for a specific message type.
   *
   * @template T - A type parameter extending from `PostboyGenericMessage`.
   * @param {MessageType<T>} type - The constructor for the message type being recorded.
   * @returns {Subject<T>} A new instance of `Subject<T>` bound to the specified message type.
   */
  public recordSubject = <T extends PostboyGenericMessage>(type: MessageType<T>) =>
    this.record(type, new Subject<T>());
}
