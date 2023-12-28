import { Observable, Subject } from 'rxjs';

export class PostboySubscription<T> {
  constructor(
    public sub: Subject<T>,
    public pipe: (s: Subject<T>) => Observable<T>,
  ) {}
}
