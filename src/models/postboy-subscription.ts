import { Observable, Subject } from 'rxjs';

/**
 * A class that manages a reactive subscription using a provided Subject and transformation pipe.
 * Offers methods to interact with the subscription, such as emitting data, completing the subscription,
 * and accessing the transformed observable.
 *
 * @template T The type of data managed by the subscription.
 */
export class PostboySubscription<T> {
  private readonly _subscription: Observable<T>;

  /**
   * Constructs an instance of the class with a given subscription and a transformation pipe.
   *
   * @param {Subject<T>} subscription - The source Subject that will be transformed.
   * @param {(s: Subject<T>) => Observable<T>} pipe - A function that applies a transformation to the subscription.
   */
  constructor(
    private subscription: Subject<T>,
    pipe: (s: Subject<T>) => Observable<T>,
  ) {
    this._subscription = pipe(subscription);
  }

  /**
   * Returns an observable subscription.
   *
   * @return {Observable<T>} An observable instance of type T.
   */
  public sub(): Observable<T> {
    return this._subscription;
  }

  /**
   * Triggers an event by emitting the provided data to all subscribers.
   *
   * @param {T} data - The data to emit to the subscribers.
   * @return {void} - Does not return any value.
   */
  public fire(data: T): void {
    this.subscription.next(data);
  }

  /**
   * Completes the subscription, signaling that no further values will be sent.
   * This is typically used to finalize or clean up resources.
   * @return {void} This method does not return any value.
   */
  public finish(): void {
    this.subscription.complete();
  }
}
