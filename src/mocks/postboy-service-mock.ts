import { PostboyService } from '../postboy.service';
import { Observable } from 'rxjs';
import { PostboyExecutor } from '../models/postboy-executor';
import { checkId, PostboyGenericMessage } from '../models/postboy-generic-message';
import { PostboyCallbackMessage } from '../models/postboy-callback.message';
import { MessageHistoryMock } from './message-history-mock';
import { MessageHistoryItemMock } from './message-history-item-mock';
import { MessageType } from '../postboy-abstract.registrator';

export class PostboyServiceMock extends PostboyService {
  private subscriptions: string[] = [];
  private _history = new MessageHistoryMock();

  reset(): void {
    this.subscriptions = [];
    this._history.reset();
  }

  fired(id: string, times: number = 0): boolean {
    return this._history.get(id)?.length === times;
  }

  subscribed(id: string, times: number = 0): boolean {
    const count = this.count(this.subscriptions, id);
    return !!count && (!times || count === times);
  }

  private count = (collection: string[], el: string) => collection.filter((e) => e === el).length;

  exec<E extends PostboyExecutor<T>, T>(executor: E): T {
    this._history.add(executor);
    return super.exec(executor);
  }

  subscribe<T>(id: string): Observable<T> {
    this.subscriptions.push(id);
    return super.subscribe(id);
  }

  public sub<T extends PostboyGenericMessage>(type: MessageType<T>): Observable<T> {
    this.subscriptions.push(checkId(type));
    return super.subscribe(checkId(type));
  }

  fire<T extends PostboyGenericMessage>(message: T) {
    this._history.add(message);
    super.fire(message);
  }

  fireCallback<T>(message: PostboyCallbackMessage<T>, action?: (e: T) => void): Observable<T> {
    this._history.add(message);
    return super.fireCallback(message, action);
  }

  history<T extends PostboyGenericMessage>(type: MessageType<T>): MessageHistoryItemMock<T> {
    return this._history.get(checkId(type));
  }
}
