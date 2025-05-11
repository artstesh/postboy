import { Observable, Subject } from 'rxjs';
import { PostboyGenericMessage } from './postboy-generic-message';

/**
 * An abstract class extending PostboyGenericMessage that provides mechanisms for managing
 * asynchronous data communication using RxJS observables. It is designed to work with
 * callback-based operations that emit a result of type T.
 *
 * @template T - The type of the data emitted by the observables in this class.
 *
 * @extends PostboyGenericMessage
 *
 * @property {Observable<T>} result - An observable that emits the result of the operation
 * and completes once the operation is finished.
 *
 * @method next - Emits the next value for the result observable.
 * @param {T} value - The value to be emitted by the result observable.
 *
 * @method finish - Emits the final value for the result observable and completes it.
 * @param {T} value - The final value for the observable emission.
 */
export abstract class PostboyCallbackMessage<T> extends PostboyGenericMessage {
  protected result$ = new Subject<T>();
  public result: Observable<T> = this.result$.asObservable();

  public next = (value: T): void => this.result$.next(value);

  public finish(value: T): void {
    this.result$.next(value);
    this.result$.complete();
  }
}
