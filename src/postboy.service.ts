import { Observable, Subject } from 'rxjs';
import { PostboyGenericMessage } from './models/postboy-generic-message';
import { LockerStore } from './locker.store';
import { PostboyLocker } from './models/postboy.locker';
import { PostboySubscription } from './models/postboy-subscription';

export class PostboyService {
  private applications: { [id: string]: PostboySubscription<any> } = {};
  private locker = new LockerStore();

  public addLocker(locker: PostboyLocker): void {
    this.locker.addLocker(locker);
  }

  public register<T>(id: string, sub: Subject<T>): void {
    this.applications[id] = new PostboySubscription<T>(sub, (s) => s.asObservable());
  }

  public registerWithPipe<T>(id: string, sub: Subject<T>, pipe: (s: Subject<T>) => Observable<T>): void {
    this.applications[id] = new PostboySubscription<T>(sub, pipe);
  }

  public unregister<T>(id: string): void {
    if (!this.applications[id]?.sub) return;
    this.applications[id].sub.complete();
    delete this.applications[id];
  }

  public subscribe<T>(id: string): Observable<T> {
    const application = this.applications[id];
    if (!application) throw new Error(`There is no event with id ${id}`);
    return application.pipe(application.sub);
  }

  public fire<T extends PostboyGenericMessage>(message: T): void {
    if (!this.applications[message.id]?.sub) throw new Error(`There is no event with id ${message.id}`);
    if (this.locker.check(message.id)) this.applications[message.id]?.sub.next(message);
  }
}
