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

  public registerExecutor<E extends PostboyExecutor<T>,T>(id: string, exec: (e: E) => T): void {
    this.executors.put(id, exec as any);
  }

  public execute<E extends PostboyExecutor<T>,T>(executor: E): T {
    if (!this.executors.has(executor.id)) throw new Error(`There is no executor with id ${executor.id}`);
    return this.executors.take(executor.id)!(executor);
  }

  public register<T>(id: string, sub: Subject<T>): void {
    this.applications.put(id, new PostboySubscription<T>(sub, (s) => s.asObservable()));
  }

  public registerWithPipe<T>(id: string, sub: Subject<T>, pipe: (s: Subject<T>) => Observable<T>): void {
    this.applications.put(id, new PostboySubscription<T>(sub, pipe));
  }

  public unregister<T>(id: string): void {
    this.applications.take(id)?.sub?.complete();
    this.applications.rmv(id);
  }

  public subscribe<T>(id: string): Observable<T> {
    const application = this.applications.take(id);
    if (!application) throw new Error(`There is no event with id ${id}`);
    return application.pipe(application.sub);
  }

  public fire<T extends PostboyGenericMessage>(message: T): void {
    if (!this.applications.take(message.id)?.sub) throw new Error(`There is no event with id ${message.id}`);
    if (this.locker.check(message.id)) this.applications.take(message.id)?.sub.next(message);
  }
}
