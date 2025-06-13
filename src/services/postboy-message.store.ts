import {PostboySubscription} from '../models/postboy-subscription';
import {PostboyExecutor} from '../models/postboy-executor';
import {PostboyCallbackMessage} from "../models/postboy-callback.message";

/**
 * The PostboyMessageStore is a utility class for managing message subscriptions and executors.
 * It provides functionality to register, retrieve, and unregister subscription-based messages and executors.
 */
export class PostboyMessageStore {
  protected messages = new Map<string, PostboySubscription<any>>();
  protected executors = new Map<string, (e: PostboyExecutor<any>) => any>();
  protected callbacks = new Map<string, (() => void)[]>();

  public registerMessage(id: string, sub: PostboySubscription<any>): void {
    this.messages.set(id, sub);
  }

  public registerExecutor(id: string, executor: (e: PostboyExecutor<any>) => any): void {
    this.executors.set(id, executor);
  }

  callbackFired(message: PostboyCallbackMessage<any>): void {
    this.callbacks.get(message.id)?.push(() => message.complete()) ||
    this.callbacks.set(message.id, [() => message.complete()]);
  }

  public getMessage(id: string, name: string): PostboySubscription<any> {
    const msg = this.messages.get(id);
    if (!msg) throw new Error(`There is no registered event ${name}`);
    return msg;
  }

  public getExecutor<T>(id: string): (e: PostboyExecutor<T>) => T {
    const executorFunction = this.executors.get(id);
    if (!executorFunction) throw new Error(`There is no registered executor with id ${id}`);
    return executorFunction;
  }

  public unregister(id: string): void {
    this.messages.get(id)?.finish();
    this.messages.delete(id);
    this.callbacks.get(id)?.forEach(c => c());
    this.callbacks.delete(id);
    this.executors.delete(id);
  }
}
