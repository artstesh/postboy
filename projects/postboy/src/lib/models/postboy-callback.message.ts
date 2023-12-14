import {Observable, Subject} from "rxjs";
import {PostboyGenericMessage} from "./postboy-generic-message";

export abstract class PostboyCallbackMessage<T> extends PostboyGenericMessage{
  protected result$ = new Subject<T>();
  public result: Observable<T> = this.result$.asObservable();

  public finish(value: T): void {
    this.result$.next(value);
    this.result$.complete();
  }
}
