import { Observable, Subject } from 'rxjs';
import { PostboyGenericMessage } from './postboy-generic-message';

/**
 * Base class for async request/response messages: the requester fires it via
 * `PostboyService.fireCallback`, a responder — subscribed to the message type — produces
 * the result through {@link next} or {@link finish}, and the requester observes the
 * values on {@link result}.
 *
 * Use a callback message when the result arrives asynchronously; for synchronous
 * results use a {@link PostboyExecutor} instead.
 *
 * @example
 * ```ts
 * class FetchDataMessage extends PostboyCallbackMessage<string> {
 *   static readonly ID = 'app.fetch-data';
 * }
 *
 * // responder: produces the result
 * postboy.sub(FetchDataMessage).subscribe((m) => m.finish('payload'));
 * // requester: consumes it
 * postboy.fireCallback(new FetchDataMessage()).subscribe((payload) => console.log(payload));
 * ```
 */
export abstract class PostboyCallbackMessage<T> extends PostboyGenericMessage {
  /** The subject backing {@link result}; protected so only subclass/responder code can emit. */
  protected result$ = new Subject<T>();

  /** The observable of result values; completed by {@link finish}, {@link complete}, or a `DisconnectMessage`. */
  public result: Observable<T> = this.result$.asObservable();

  /**
   * Emits an intermediate result value to every {@link result} subscriber without
   * completing the stream — for operations that produce several values.
   *
   * @param value - The value to emit.
   */
  public next = (value: T): void => this.result$.next(value);

  /**
   * Emits the final result value and completes {@link result}.
   *
   * @param value - The last value to emit.
   */
  public finish(value: T): void {
    this.result$.next(value);
    this.result$.complete();
  }

  /** Completes {@link result} without emitting another value. */
  public complete(): void {
    this.result$.complete();
  }
}
