import { Observable, Subject } from 'rxjs';
import { PostboyGenericMessage } from './models/postboy-generic-message';
import { LockerStore } from './locker.store';
import { PostboyLocker } from './models/postboy.locker';
import { PostboySubscription } from './models/postboy-subscription';
import { Dictionary } from './models/dictionary';
import { PostboyExecutor } from './models/postboy-executor';

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

  public execute<T>(executor: PostboyExecutor<T>): T {
    let id = executor.id??executor.constructor.name;
    if (!this.executors.has(id)) throw new Error(`There is no executor with id ${id}`);
    return this.executors.take(id)!(executor);
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

  public fire<T extends PostboyGenericMessage>(message: T): void {
    let id = message.id??message.constructor.name;
    if (!this.applications.take(id)?.sub) throw new Error(`There is no event with id ${id}`);
    if (this.locker.check(id)) this.applications.take(id)?.sub.next(message);
  }

  // future

  public sub<T extends PostboyGenericMessage>(type: new (...args: any[]) => T): Observable<T> {
    const application = this.applications.take(type.name);
    if (!application) throw new Error(`There is no event with id ${type.name}`);
    return application.pipe(application.sub);
  }

  public record<T>(type: { new (...args: any[]): T}, sub: Subject<T>): void {
    this.applications.put(type.name, new PostboySubscription<T>(sub, (s) => s.asObservable()));
  }

  public recordWithPipe<T>(type: { new (...args: any[]): T}, sub: Subject<T>, pipe: (s: Subject<T>) => Observable<T>): void {
    this.applications.put(type.name, new PostboySubscription<T>(sub, pipe));
  }

  public recordExecutor<T>(type: { new (...args: any[]): PostboyExecutor<T>}, exec: (e: PostboyExecutor<T>) => T): void {
    this.executors.put(type.name, exec);
  }
}
