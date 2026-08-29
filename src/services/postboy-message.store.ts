import { PostboySubscription } from '../models/postboy-subscription';
import { PostboyExecutor } from '../models/postboy-executor';
import { PostboyCallbackMessage } from '../models/postboy-callback.message';

/**
 * The registry behind the bus: message subscriptions and executor handlers keyed by
 * their static `ID`, plus completion callbacks for fired callback messages. Consumer
 * code reaches it only through `PostboyService` and the infrastructure messages.
 */
export class PostboyMessageStore {
  protected messages = new Map<string, PostboySubscription<any>>();
  protected executors = new Map<string, (e: PostboyExecutor<any>) => any>();
  protected callbacks = new Map<string, (() => void)[]>();

  /**
   * Registers a message subscription under the id, logging a warning and overriding
   * when the id is already taken.
   */
  public registerMessage(id: string, sub: PostboySubscription<any>): void {
    // tslint:disable-next-line:no-console
    if (this.messages.has(id)) console.warn(`Message with id ${id} already registered. Overriding...`);
    this.messages.set(id, sub);
  }

  /**
   * Registers an executor handler under the id, logging a warning and overriding
   * when the id is already taken.
   */
  public registerExecutor(id: string, executor: (e: PostboyExecutor<any>) => any): void {
    // tslint:disable-next-line:no-console
    if (this.executors.has(id)) console.warn(`Executor with id ${id} already registered. Overriding...`);
    this.executors.set(id, executor);
  }

  /** Records a callback completing the message's result when its type is unregistered or the bus disposed. */
  callbackFired(message: PostboyCallbackMessage<any>): void {
    const existingCallbacks = this.callbacks.get(message.id);
    existingCallbacks
      ? existingCallbacks.push(() => message.complete())
      : this.callbacks.set(message.id, [() => message.complete()]);
  }

  /**
   * @param id - The static `ID` the subscription was registered under.
   * @param name - Used only in the error message.
   * @throws Error When no message is registered under the id.
   */
  public getMessage(id: string, name: string): PostboySubscription<any> {
    const msg = this.messages.get(id);
    if (!msg) throw new Error(`There is no registered event ${name}`);
    return msg;
  }

  /**
   * @param id - The static `ID` the handler was registered under.
   * @throws Error When no executor is registered under the id.
   */
  public getExecutor<T>(id: string): (e: PostboyExecutor<T>) => T {
    const executorFunction = this.executors.get(id);
    if (!executorFunction) throw new Error(`There is no registered executor with id ${id}`);
    return executorFunction;
  }

  /**
   * Removes an id completely: completes its subscription stream, runs the recorded
   * completion callbacks (completing fired callback results), and deletes the message,
   * executor, and callback entries.
   */
  public unregister(id: string): void {
    this.messages.get(id)?.finish();
    this.messages.delete(id);
    this.callbacks.get(id)?.forEach((c) => c());
    this.callbacks.delete(id);
    this.executors.delete(id);
  }

  /**
   * Tears the store down: unregisters every message, runs the remaining callbacks, and
   * clears all maps — including the infrastructure handlers, so the bus must be
   * re-created to work again.
   */
  public dispose(): void {
    this.messages.forEach((m, id) => this.unregister(id));
    this.callbacks.forEach((fs) => fs.forEach((f) => f()));
    this.messages.clear();
    this.executors.clear();
    this.callbacks.clear();
  }
}
