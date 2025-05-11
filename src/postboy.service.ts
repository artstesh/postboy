import {Observable, Subject} from 'rxjs';
import {checkId, PostboyGenericMessage} from './models/postboy-generic-message';
import {LockerStore} from './locker.store';
import {PostboyLocker} from './models/postboy.locker';
import {PostboySubscription} from './models/postboy-subscription';
import {PostboyExecutor} from './models/postboy-executor';
import {PostboyCallbackMessage} from './models/postboy-callback.message';
import {MessageType} from './postboy-abstract.registrator';
import {PostboyExecutionHandler} from './models/postboy-execution.handler';
import {PostboyMiddlewareService} from "./services/postboy-middleware.service";
import {PostboyMessageStore} from "./services/postboy-message.store";
import {PostboyDependencyResolver} from "./services/postboy-dependency.resolver";
import {PostboyMiddleware} from "./models/postboy-middleware";

export class PostboyService {
  private locker = new LockerStore();
  protected locked = new Set<string>();
  private middleware: PostboyMiddlewareService;
  private store: PostboyMessageStore;

  constructor(resolver?: PostboyDependencyResolver) {
    const rsv = resolver || new PostboyDependencyResolver();
    this.middleware = rsv.getMiddlewareService();
    this.store = rsv.getMessageStore();
  }


  /**
   * @deprecated The method should be replaced with lock<T>/unlock<T>
   */
  public addLocker(locker: PostboyLocker): void {
    this.locker.addLocker(locker);
  }

  /**
   * Locks a specific message type to prevent further modifications or actions.
   *
   * @param {MessageType<T>} type - The message type to be locked. It must extend from the `PostboyGenericMessage`.
   * @return {void} This method does not return a value.
   */
  public lock<T extends PostboyGenericMessage>(type: MessageType<T>): void {
    this.locked.add(checkId(type));
  }

  /**
   * Unlocks a previously locked message type by removing its ID from the locked set.
   *
   * @param {MessageType<T>} type - The message type to unlock, which is a generic type extending PostboyGenericMessage.
   * @return {void} This method does not return any value.
   */
  public unlock<T extends PostboyGenericMessage>(type: MessageType<T>): void {
    this.locked.delete(checkId(type));
  }

  public addMiddleware(middleware: PostboyMiddleware): void {
    return this.middleware.addMiddleware(middleware);
  }

  public removeMiddleware(middleware: PostboyMiddleware): void {
    return this.middleware.removeMiddleware(middleware);
  }

  /**
   * @deprecated The method should be replaced with recordExecutor<T>
   */
  public registerExecutor<E extends PostboyExecutor<T>, T>(id: string, exec: (e: E) => T): void {
    this.store.registerExecutor(id, exec as ((e: PostboyExecutor<T>) => T));
  }

  /**
   * @deprecated The method should be replaced with exec<T>
   */
  public execute<E extends PostboyExecutor<T>, T>(executor: E): T {
    this.middleware.manage(executor);
    return this.store.getExecutor<T>(executor.id)(executor);
  }

  /**
   * @deprecated The method should be replaced with record<T>
   */
  public register<T>(id: string, sub: Subject<T>): void {
    this.store.registerMessage(id, new PostboySubscription<T>(sub, (s) => s.asObservable()));
  }

  /**
   * @deprecated The method should be replaced with recordWithPipe<T>
   */
  public registerWithPipe<T>(id: string, sub: Subject<T>, pipe: (s: Subject<T>) => Observable<T>): void {
    this.store.registerMessage(id, new PostboySubscription<T>(sub,pipe));
  }

  public unregister(id: string): void {
    return this.store.unregister(id);
  }

  /**
   * @deprecated The method should be replaced with sub<T>
   */
  public subscribe<T>(id: string): Observable<T> {
    return this.store.getMessage(id, id).sub();
  }

  /**
   * Fires a registered event and passes the message to its subscribers.
   *
   * @param {PostboyGenericMessage} message - The message object containing the event data.
   * @return {void} This method does not return a value.
   * @throws {Error} Throws an error if no registered event is found for the provided message ID.
   */
  public fire(message: PostboyGenericMessage): void {
    this.middleware.manage(message);
    if (this.locker.check(message.id))
      this.store.getMessage(message.id, message.constructor.name).fire(message);
  }

  /**
   * Triggers a callback function associated with a given message.
   *
   * @param {PostboyCallbackMessage<T>} message - The message object used to trigger the callback.
   * It contains details about the event and result subscription.
   * @param {(e: T) => void} [action] - Optional callback function to execute when the result of the message is emitted.
   * @return {void} This method does not return any value.
   */
  public fireCallback<T>(message: PostboyCallbackMessage<T>, action?: (e: T) => void): Observable<T> {
    this.middleware.manage(message);
    message.result.subscribe(action);
    if (this.locker.check(message.id))
      setTimeout(() => this.store.getMessage(message.id, message.constructor.name).fire(message));
    return message.result;
  }

  // future

  /**
   * Subscribes to a specific message type and returns an observable of that type.
   *
   * @param type The constructor function of the type that extends PostboyGenericMessage.
   * @return An Observable of the specified generic message type.
   */
  public sub<T extends PostboyGenericMessage>(type: MessageType<T>): Observable<T> {
    return this.store.getMessage(checkId(type), type.name).sub();
  }

  /**
   * Registers a given message type and its associated subject subscription with the system.
   *
   * @param type The constructor function of the message type that extends the PostboyGenericMessage.
   * @param sub The Subject instance for the provided message type, used for managing subscriptions.
   * @return {void} No return value.
   */
  public record<T extends PostboyGenericMessage>(type: MessageType<T>, sub: Subject<T>): void {
    this.store.registerMessage(checkId(type), new PostboySubscription<T>(sub, (s) => s.asObservable()));
  }

  /**
   * Registers a generic message type with a Subject and a transformation pipe.
   *
   * @param {MessageType<T>} type - The constructor of the message type being registered.
   * @param {Subject<T>} sub - The Subject instance used to handle incoming messages of the specified type.
   * @param {(s: Subject<T>) => Observable<T>} pipe - A function that applies a transformation or processing logic to the Subject and returns an Observable.
   * @return {void} No return value.
   */
  public recordWithPipe<T extends PostboyGenericMessage>(
    type: MessageType<T>,
    sub: Subject<T>,
    pipe: (s: Subject<T>) => Observable<T>,
  ): void {
    this.store.registerMessage(checkId(type), new PostboySubscription<T>(sub, pipe));
  }

  /**
   * Records an executor instance and its corresponding execution function.
   *
   * @param {new (...args: any[]) => E} type - The constructor type of the executor.
   * @param {(e: E) => T} exec - The function to execute with the provided executor instance.
   * @return {void} No return value.
   */
  public recordExecutor<E extends PostboyExecutor<T>, T>(type: new (...args: any[]) => E, exec: (e: E) => T): void {
    this.store.registerExecutor(checkId(type), exec as ((e: PostboyExecutor<T>) => T));
  }

  /**
   * Executes the provided executor function and returns its result.
   *
   * @param {PostboyExecutor<T>} executor The executor to be executed, which includes its identifier and logic.
   * @return {T} The resulting output from the executed executor function.
   * @throws {Error} If the specified executor is not registered.
   */
  public exec<T>(executor: PostboyExecutor<T>): T {
    this.middleware.manage(executor);
    return this.store.getExecutor<T>(executor.id)(executor);
  }

  /**
   * Manages the recording of an executor and its corresponding handler into internal storage.
   *
   * @param {new (...args: any[]) => E} executor - The constructor for a class extending PostboyExecutor, used to register the executor type.
   * @param {PostboyExecutionHandler<R, E>} handler - The handler responsible for processing the specific executor.
   * @return {void} No return value.
   */
  public recordHandler<E extends PostboyExecutor<R>, R>(
    executor: new (...args: any[]) => E,
    handler: PostboyExecutionHandler<R, E>,
  ): void {
    this.store.registerExecutor(checkId(executor), (e) => handler.handle(e as E));
  }
}
