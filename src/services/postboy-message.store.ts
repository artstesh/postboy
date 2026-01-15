import { PostboySubscription } from '../models/postboy-subscription';
import { PostboyExecutor } from '../models/postboy-executor';

/**
 * The PostboyMessageStore is a utility class for managing message subscriptions and executors.
 * It provides functionality to register, retrieve, and unregister subscription-based messages and executors.
 */
export class PostboyMessageStore {
  protected applications = new Map<string, PostboySubscription<any>>();
  protected executors = new Map<string, (e: PostboyExecutor<any>) => any>();

  public registerMessage(id: string, sub: PostboySubscription<any>): void {
    // tslint:disable-next-line:no-console
    if (this.applications.has(id)) console.warn(`Message with id ${id} already registered. Overriding...`);
    this.applications.set(id, sub);
  }

  public registerExecutor(id: string, executor: (e: PostboyExecutor<any>) => any): void {
    // tslint:disable-next-line:no-console
    if (this.executors.has(id)) console.warn(`Executor with id ${id} already registered. Overriding...`);
    this.executors.set(id, executor);
  }

  public getMessage(id: string, name: string): PostboySubscription<any> {
    const msg = this.applications.get(id);
    if (!msg) throw new Error(`There is no registered event ${name}`);
    return msg;
  }

  public getExecutor<T>(id: string): (e: PostboyExecutor<T>) => T {
    const executorFunction = this.executors.get(id);
    if (!executorFunction) throw new Error(`There is no registered executor with id ${id}`);
    return executorFunction;
  }

  public unregister(id: string): void {
    this.applications.get(id)?.finish();
    this.applications.delete(id);
    this.executors.delete(id);
  }
}
