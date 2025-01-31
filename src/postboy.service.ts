import { Observable, Subject } from 'rxjs';
import { checkId, PostboyGenericMessage } from './models/postboy-generic-message';
import { LockerStore } from './locker.store';
import { PostboyLocker } from './models/postboy.locker';
import { PostboySubscription } from './models/postboy-subscription';
import { Dictionary } from './models/dictionary';
import { PostboyExecutor } from './models/postboy-executor';
import { PostboyCallbackMessage } from './models/postboy-callback.message';

export class PostboyService {
  private applications = new Dictionary<PostboySubscription<any>>();
  private locker = new LockerStore();
  private executors = new Dictionary<(e: PostboyExecutor<any>) => any>();

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

  public fire(message: PostboyGenericMessage): void {
    if (!this.applications.take(message.id)?.sub)
      throw new Error(`There is no registered event ${message.constructor.name}`);
    if (this.locker.check(message.id)) this.applications.take(message.id)?.sub.next(message);
  }

  public fireCallback<T>(message: PostboyCallbackMessage<T>, action?: (e: T) => void): Observable<T> {
    if (!this.applications.take(message.id)?.sub)
      throw new Error(`There is no registered event ${message.constructor.name}`);
    message.result.subscribe(action);
    if (this.locker.check(message.id)) this.applications.take(message.id)?.sub.next(message);
    return message.result;
  }

  // future
  public sub<T extends PostboyGenericMessage>(type: new (...args: any[]) => T): Observable<T> {
    const application = this.applications.take(checkId(type));
    if (!application) throw new Error(`There is no registered event ${type.constructor.name}`);
    return application.pipe(application.sub);
  }

  public record<T extends PostboyGenericMessage>(type: new (...args: any[]) => T, sub: Subject<T>): void {
    this.applications.put(checkId(type), new PostboySubscription<T>(sub, (s) => s.asObservable()));
  }

  public recordWithPipe<T extends PostboyGenericMessage>(
    type: new (...args: any[]) => T,
    sub: Subject<T>,
    pipe: (s: Subject<T>) => Observable<T>,
  ): void {
    this.applications.put(checkId(type), new PostboySubscription<T>(sub, pipe));
  }

  public recordExecutor<E extends PostboyExecutor<T>, T>(type: new (...args: any[]) => E, exec: (e: E) => T): void {
    this.executors.put(checkId(type), exec as any);
  }

  public exec<T>(executor: PostboyExecutor<T>): T {
    if (!this.executors.has(executor.id)) throw new Error(`There is no registered executor ${executor.id}`);
    return this.executors.take(executor.id)!(executor);
  }
}
