import { Observable, Subject } from 'rxjs';

/**
 * The internal pairing of a registered subject with the observable handed out to
 * subscribers — the pipe, when given, is applied exactly once, here.
 *
 * Created by the registration paths (`ConnectMessage` and the deprecated `record*`
 * methods); consumer code never constructs it directly.
 *
 * @template T - The message type the stream carries.
 */
export class PostboySubscription<T> {
  private readonly _subscription: Observable<T>;

  /**
   * @param subscription - The subject `fire` pushes messages into.
   * @param pipe - Optional wrapper producing the observable subscribers receive; defaults to the plain subject.
   */
  constructor(
    private subscription: Subject<T>,
    pipe?: (s: Subject<T>) => Observable<T>,
  ) {
    this._subscription = !!pipe ? pipe(subscription) : subscription.asObservable();
  }

  /** The observable handed out on every `PostboyService.sub` call — one shared stream for all subscribers. */
  public sub(): Observable<T> {
    return this._subscription;
  }

  /** Pushes a message into the underlying subject, notifying all subscribers synchronously. */
  public fire(data: T): void {
    this.subscription.next(data);
  }

  /** Completes the underlying subject, ending every subscriber's stream. */
  public finish(): void {
    this.subscription.complete();
  }
}
