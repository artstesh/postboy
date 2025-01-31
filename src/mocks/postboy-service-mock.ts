import { PostboyService } from '../postboy.service';
import { Observable } from 'rxjs';
import { PostboyExecutor } from '../models/postboy-executor';
import { checkId, PostboyGenericMessage } from '../models/postboy-generic-message';
import { PostboyCallbackMessage } from '../models/postboy-callback.message';

export class PostboyServiceMock extends PostboyService {
  private executions: string[] = [];
  private subscriptions: string[] = [];
  private fires: string[] = [];

  reset(): void {
    this.executions = [];
    this.subscriptions = [];
    this.fires = [];
  }

  fired(id: string, times: number = 0): boolean {
    const count = this.count(this.fires, id);
    return !!count && (!times || count === times);
  }

  executed(id: string, times: number = 0): boolean {
    const count = this.count(this.executions, id);
    return !!count && (!times || count === times);
  }

  subscribed(id: string, times: number = 0): boolean {
    const count = this.count(this.subscriptions, id);
    return !!count && (!times || count === times);
  }

  private count = (collection: string[], el: string) => collection.filter((e) => e === el).length;

  exec<E extends PostboyExecutor<T>, T>(executor: E): T {
    this.executions.push(executor.id);
    return super.exec(executor);
  }

  subscribe<T>(id: string): Observable<T> {
    this.subscriptions.push(id);
    return super.subscribe(id);
  }

  public sub<T extends PostboyGenericMessage>(type: new (...args: any[]) => T): Observable<T> {
    this.subscriptions.push(checkId(type));
    return super.subscribe(checkId(type));
  }

  fire<T extends PostboyGenericMessage>(message: T) {
    this.fires.push(message.id);
    super.fire(message);
  }

  fireCallback<T>(message: PostboyCallbackMessage<T>, action?: (e: T) => void): Observable<T> {
    this.fires.push(message.id);
    return super.fireCallback(message, action);
  }
}
