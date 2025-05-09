import {Observable, Subject} from 'rxjs';
import {checkId, PostboyGenericMessage} from './models/postboy-generic-message';
import {PostboySubscription} from './models/postboy-subscription';
import {PostboyExecutor} from './models/postboy-executor';
import {PostboyCallbackMessage} from './models/postboy-callback.message';
import {MessageType} from './postboy-abstract.registrator';
import {PostboyExecutionHandler} from './models/postboy-execution.handler';
import {PostboyMiddleware} from "./models/postboy-middleware";
import {PostboyDependencyResolver} from "./services/postboy-dependency.resolver";
import {PostboyMiddlewareService} from "./services/postboy-middleware.service";
import {PostboyMessageStore} from "./services/postboy-message.store";

export class PostboyService {
  protected locked = new Set<string>();
  private middleware: PostboyMiddlewareService;
  private store: PostboyMessageStore;

  constructor(resolver?: PostboyDependencyResolver) {
    const rsv = resolver || new PostboyDependencyResolver();
    this.middleware = rsv.getMiddlewareService();
    this.store = rsv.getMessageStore();
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

  /**
   * Adds a middleware to the middleware stack.
   *
   * @param {PostboyMiddleware} middleware - The middleware instance to be added.
   * @return {void}
   */
  public addMiddleware(middleware: PostboyMiddleware): void {
    return this.middleware.addMiddleware(middleware);
  }

  /**
   * Removes a middleware from the current middleware stack.
   *
   * @param {PostboyMiddleware} middleware - The middleware instance to be removed.
   * @return {void} No return value.
   */
  public removeMiddleware(middleware: PostboyMiddleware): void {
    return this.middleware.removeMiddleware(middleware);
  }

  /**
   * Unregisters a message identified by the given ID from the store.
   *
   * @param {string} id - The unique identifier of the item to unregister.
   * @return {void} No value is returned.
   */
  public unregister(id: string): void {
    return this.store.unregister(id);
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
    if (!this.locked.has(message.id))
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
    if (!this.locked.has(message.id))
      setTimeout(() => this.store.getMessage(message.id, message.constructor.name).fire(message));
    return message.result;
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
   * Registers an executor for a specified message type.
   *
   * @param {MessageType<E>} type - The message type for which the executor is being registered.
   * @param {(e: E) => T} exec - The executor function that will handle messages of the specified type.
   * @return {void} This method does not return any value.
   */
  public recordExecutor<E extends PostboyExecutor<T>, T>(type: MessageType<E>, exec: (e: E) => T): void {
    this.store.registerExecutor(checkId(type), exec as ((e: PostboyExecutor<T>) => T));
  }

  /**
   * Registers a handler for a specific executor type.
   *
   * @param executor The constructor of the executor class that extends `PostboyExecutor<R>`.
   * @param handler An instance of `PostboyExecutionHandler<R, E>` that defines the logic for handling the executor.
   * @return void
   */
  public recordHandler<E extends PostboyExecutor<R>, R>(
    executor: new (...args: any[]) => E,
    handler: PostboyExecutionHandler<R, E>,
  ): void {
    this.store.registerExecutor(checkId(executor), (e) => handler.handle(e as E));
  }
}
