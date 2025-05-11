import {PostboyGenericMessage} from '../models/postboy-generic-message';
import {MessageHistoryItemMock} from './message-history-item-mock';

export class MessageHistoryMock {
  private _items = new Map<string,MessageHistoryItemMock<any>>();

  get<T extends PostboyGenericMessage>(id: string): MessageHistoryItemMock<T> {
    return this._items.get(id) ?? new MessageHistoryItemMock();
  }

  add(message: PostboyGenericMessage): void {
    if (!this._items.get(message.id)?.add(message))
      this._items.set(message.id, new MessageHistoryItemMock().add(message));
  }

  reset(): void {
    this._items.forEach((i) => i.clear());
  }
}
