import { Observable, Subject } from 'rxjs';

export class PostboySubscription<T> {
  constructor(
    private subscription: Subject<T>,
    private pipe: (s: Subject<T>) => Observable<T>,
  ) {}

  public sub(): Observable<T> {
    return this.pipe(this.subscription);
  }

  public fire(data: T): void {
    this.subscription.next(data);
  }

  public finish(): void {
    this.subscription.complete();
  }
}
