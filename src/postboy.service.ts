import {first, Observable, Subject, tap} from 'rxjs';
import {checkId, PostboyGenericMessage} from './models/postboy-generic-message';
import {PostboySubscription} from './models/postboy-subscription';
import {PostboyExecutor} from './models/postboy-executor';
import {PostboyCallbackMessage} from './models/postboy-callback.message';
import {MessageType, PostboyAbstractRegistrator} from './postboy-abstract.registrator';
import {PostboyExecutionHandler} from './models/postboy-execution.handler';
import {PostboyDependencyResolver} from './services/postboy-dependency.resolver';
import {PostboyMiddlewareService} from './services/postboy-middleware.service';
import {PostboyMessageStore} from './services/postboy-message.store';
import {PostboyNamespaceStore} from './services/postboy-namespace.store';
import {PostboyContextService} from './services/postboy-context.service';
import {PostboySettings} from './models/postboy.settings';
import {AddNamespace} from "./messages/add-namespace.executor";
import {EliminateNamespace} from "./messages/eliminate-namespace.executor";
import {AddMiddleware} from "./messages/add-middleware.executor";
import {RemoveMiddleware} from "./messages/remove-middleware.executor";
import {LockMessage} from "./messages/lock-message.executor";
import {UnlockMessage} from "./messages/unlock-message.executor";
import {DisconnectMessage} from "./messages/disconnect-message.executor";
import {ConnectMessage} from "./messages/connect.message.executor";
import {ConnectExecutor} from "./messages/connect-executor.executor";
import {ConnectHandler} from "./messages/connect-handler.executor";
import {MiddlewareStage} from "./models/middleware-stage.enum";
import {CancelError} from "./models/cancel-error";
import {PostboyMiddleware} from "./services/postboy-middleware";

export class PostboyService {
  protected locked = new Set<string>();
  private middleware: PostboyMiddlewareService;
  private store: PostboyMessageStore;
  private namespaceStore: PostboyNamespaceStore;
  private dependencyResolver: PostboyDependencyResolver;
  private context: PostboyContextService;
  private settings: PostboySettings;

  constructor(settings?: Partial<PostboySettings>, resolver?: PostboyDependencyResolver) {
    this.settings = new PostboySettings(settings);
    this.dependencyResolver = resolver || new PostboyDependencyResolver();
    this.middleware = this.dependencyResolver.getMiddlewareService();
    this.store = this.dependencyResolver.getMessageStore();
    this.namespaceStore = this.dependencyResolver.getNamespaceStore();
    this.context = this.dependencyResolver.getPostboyContextService(this.settings.metadata);
    this.registerInfrastructureMessages();
  }

  private registerInfrastructureMessages() {
    this.store.registerExecutor(DisconnectMessage.ID, (e) => this.store.unregister((e as DisconnectMessage).messageId));
    this.store.registerExecutor(UnlockMessage.ID, (e) => this.locked.delete(checkId((e as UnlockMessage<any>).type)));
    this.store.registerExecutor(LockMessage.ID, (e) => this.locked.add(checkId((e as LockMessage<any>).type)));
    this.store.registerExecutor(AddMiddleware.ID, (e) => this.middleware.addMiddleware((e as AddMiddleware).middleware));
    this.store.registerExecutor(RemoveMiddleware.ID, (e) => this.middleware.removeMiddleware((e as RemoveMiddleware).middleware));
    this.store.registerExecutor(AddNamespace.ID, (e) => this.namespaceStore.addSpace((e as AddNamespace).space, this));
    this.store.registerExecutor(EliminateNamespace.ID, (e) => this.namespaceStore.eliminateSpace((e as EliminateNamespace).space));
    this.store.registerExecutor(ConnectMessage.ID, e => {
      const {type, sub, pipe} = e as ConnectMessage<any>;
      this.store.registerMessage(checkId(type), new PostboySubscription<any>(sub, pipe));
    });
    this.store.registerExecutor(ConnectExecutor.ID, e => {
      const {type, exec} = e as ConnectExecutor<any, any>;
      this.store.registerExecutor(checkId(type), exec);
    });
    this.store.registerExecutor(ConnectHandler.ID, e => {
      const {executor, handler} = e as ConnectHandler<any, any>;
      this.store.registerExecutor(checkId(executor), (e) => handler.handle(e));
    });
  }

  /**
   * Fires a registered event and passes the message to its subscribers.
   *
   * @param {PostboyGenericMessage} message - The message object containing the event data.
   * @return {void} This method does not return a value.
   * @throws {Error} Throws an error if no registered event is found for the provided message ID.
   */
  public fire(message: PostboyGenericMessage): void {
    const context = this.context.createChild(message);
    return this.context.run(context, () => {
      this.middleware.beforePublish(message, context);
      if (!this.locked.has(message.id)) {
        this.store.getMessage(message.id, message.constructor.name).fire(message);
      }
      this.middleware.afterPublish(message, context);
    });
  }

  /**
   * Triggers a callback function associated with a given message.
   *
   * @param {PostboyCallbackMessage<T>} message - The message object used to trigger the callback.
   * It contains details about the event and result subscription.
   * @param {(e: T) => void} [action] - Optional callback function to execute when the result of the message is emitted.
   * @return {void} This method does not return any value.
   */
  public fireCallback<T>(
    message: PostboyCallbackMessage<T>,
    action?: (e: T) => void,
  ): Observable<T> {
    const context = this.context.createChild(message);

    return this.context.run(context, () => {
      this.middleware.beforeCallback(message, context);
      const msg = this.store.getMessage(message.id, message.constructor.name);
      if (action) message.result.subscribe(action);
      this.store.callbackFired(message);
      if (!this.locked.has(message.id)) {
        queueMicrotask(() => msg.fire(message));
      }
      return message.result.pipe(tap(() => this.middleware.afterCallback(message, context)));
    });
  }

  /**
   * Executes the provided executor function and returns its result.
   *
   * @param {PostboyExecutor<T>} executor The executor to be executed, which includes its identifier and logic.
   * @return {T} The resulting output from the executed executor function.
   * @throws {Error} If the specified executor is not registered.
   */
  public exec<T>(executor: PostboyExecutor<T>): T {
    const context = this.context.createChild(executor);
    return this.context.run(context,  () => {
      this.middleware.beforeExecute(executor, context);
      const result = this.store.getExecutor<T>(executor.id)(executor);
      this.middleware.afterExecute(executor, result, context);
      return result;
    });
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
   * Subscribes to a specific message type and automatically unsubscribes after receiving the first message.
   *
   * @param type The type of message to subscribe to.
   * @return An observable that emits the first message of the specified type and then completes.
   */
  public once<T extends PostboyGenericMessage>(type: MessageType<T>): Observable<T> {
    return this.sub(type).pipe(first());
  }

  /**
   * Registers a given message type and its associated subject subscription with the system.
   *
   * @deprecated The method should be replaced with firing {@link ConnectMessage} message.
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
   * @deprecated The method should be replaced with firing {@link ConnectMessage} message.
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
   * @deprecated The method should be replaced with firing {@link ConnectExecutor} message.
   * @param {MessageType<E>} type - The message type for which the executor is being registered.
   * @param {(e: E) => T} exec - The executor function that will handle messages of the specified type.
   * @return {void} This method does not return any value.
   */
  public recordExecutor<E extends PostboyExecutor<T>, T>(type: MessageType<E>, exec: (e: E) => T): void {
    this.store.registerExecutor(checkId(type), exec as (e: PostboyExecutor<T>) => T);
  }

  /**
   * Registers a handler for a specific executor type.
   *
   * @deprecated The method should be replaced with firing {@link ConnectHandler} message.
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

  /**
   * Disposes of resources and cleans up any internal components or stores associated with the instance.
   * This method ensures that all resources are properly released to avoid memory leaks.
   *
   * @return {void} This method does not return a value.
   */
  public dispose(): void {
    this.namespaceStore?.dispose();
    this.store.dispose();
    this.middleware.dispose();
    this.context.dispose();
  }
}
