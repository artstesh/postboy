import { Observable, Subject } from 'rxjs';
import { checkId, PostboyGenericMessage } from './models/postboy-generic-message';
import { LockerStore } from './locker.store';
import { PostboyLocker } from './models/postboy.locker';
import { PostboySubscription } from './models/postboy-subscription';
import { PostboyExecutor } from './models/postboy-executor';
import { PostboyCallbackMessage } from './models/postboy-callback.message';
import { Dictionary } from '@artstesh/collections';
import { MessageType } from './postboy-abstract.registrator';

export class PostboyService {
  private applications = new Dictionary<PostboySubscription<any>>();
  private locker = new LockerStore();
  private executors = new Dictionary<(e: PostboyExecutor<any>) => any>();

  /**
   * Adds a locker to the current list of lockers.
   *
   * @param {PostboyLocker} locker - The locker object to be added.
   * @return {void} This method does not return a value.
   */
  public addLocker(locker: PostboyLocker): void {
    this.locker.addLocker(locker);
  }

  /**
   * @deprecated The method should be replaced with recordExecutor<T>
   */
  public registerExecutor<E extends PostboyExecutor<T>, T>(id: string, exec: (e: E) => T): void {
    this.executors.put(id, exec as any);
  }

  /**
   * @deprecated The method should be replaced with exec<T>
   */
  public execute<E extends PostboyExecutor<T>, T>(executor: E): T {
    if (!this.executors.has(executor.id))
      throw new Error(`There is no registered executor ${executor.constructor.name}`);
    return this.executors.take(executor.id)!(executor);
  }

  /**
   * @deprecated The method should be replaced with record<T>
   */
  public register<T>(id: string, sub: Subject<T>): void {
    this.applications.put(id, new PostboySubscription<T>(sub, (s) => s.asObservable()));
  }

  /**
   * @deprecated The method should be replaced with recordWithPipe<T>
   */
  public registerWithPipe<T>(id: string, sub: Subject<T>, pipe: (s: Subject<T>) => Observable<T>): void {
    this.applications.put(id, new PostboySubscription<T>(sub, pipe));
  }

  public unregister(id: string): void {
    this.applications.take(id)?.sub?.complete();
    this.applications.rmv(id);
  }

  /**
   * @deprecated The method should be replaced with sub<T>
   */
  public subscribe<T>(id: string): Observable<T> {
    const application = this.applications.take(id);
    if (!application) throw new Error(`There is no event with id ${id}`);
    return application.pipe(application.sub);
  }

  /**
   * Fires a registered event and passes the message to its subscribers.
   *
   * @param {PostboyGenericMessage} message - The message object containing the event data.
   * @return {void} This method does not return a value.
   * @throws {Error} Throws an error if no registered event is found for the provided message ID.
   */
  public fire(message: PostboyGenericMessage): void {
    if (!this.applications.take(message.id)?.sub)
      throw new Error(`There is no registered event ${message.constructor.name}`);
    if (this.locker.check(message.id)) this.applications.take(message.id)?.sub.next(message);
  }

  /**
   * Fires a callback for a given message, optionally taking an action to apply to the message's result.
   *
   * @param {PostboyCallbackMessage<T>} message The message object that contains the callback information.
   * @param {(e: T) => void} [action] An optional action function to execute with the emitted result of the message.
   * @return {Observable<T>} An observable representing the result of the message's callback.
   */
  public fireCallback<T>(message: PostboyCallbackMessage<T>, action?: (e: T) => void): Observable<T> {
    if (!this.applications.take(message.id)?.sub)
      throw new Error(`There is no registered event ${message.constructor.name}`);
    message.result.subscribe(action);
    if (this.locker.check(message.id)) this.applications.take(message.id)?.sub.next(message);
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
    const application = this.applications.take(checkId(type));
    if (!application) throw new Error(`There is no registered event ${type.constructor.name}`);
    return application.pipe(application.sub);
  }

  /**
   * Registers a given message type and its associated subject subscription with the system.
   *
   * @param type The constructor function of the message type that extends the PostboyGenericMessage.
   * @param sub The Subject instance for the provided message type, used for managing subscriptions.
   * @return {void} No return value.
   */
  public record<T extends PostboyGenericMessage>(type: MessageType<T>, sub: Subject<T>): void {
    this.applications.put(checkId(type), new PostboySubscription<T>(sub, (s) => s.asObservable()));
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
    this.applications.put(checkId(type), new PostboySubscription<T>(sub, pipe));
  }

  /**
   * Records an executor instance and its corresponding execution function.
   *
   * @param {new (...args: any[]) => E} type - The constructor type of the executor.
   * @param {(e: E) => T} exec - The function to execute with the provided executor instance.
   * @return {void} No return value.
   */
  public recordExecutor<E extends PostboyExecutor<T>, T>(type: new (...args: any[]) => E, exec: (e: E) => T): void {
    this.executors.put(checkId(type), exec as any);
  }

  /**
   * Executes the provided executor function and returns its result.
   *
   * @param {PostboyExecutor<T>} executor The executor to be executed, which includes its identifier and logic.
   * @return {T} The resulting output from the executed executor function.
   * @throws {Error} If the specified executor is not registered.
   */
  public exec<T>(executor: PostboyExecutor<T>): T {
    if (!this.executors.has(executor.id)) throw new Error(`There is no registered executor ${executor.id}`);
    return this.executors.take(executor.id)!(executor);
  }
}
