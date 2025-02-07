import { PostboyGenericMessage } from '../models/postboy-generic-message';
import { MessageHistoryItemMock } from './message-history-item-mock';
import { Dictionary } from '@artstesh/collections';

export class MessageHistoryMock {
  private _items = new Dictionary<MessageHistoryItemMock<any>>();

  get<T extends PostboyGenericMessage>(id: string): MessageHistoryItemMock<T> {
    return this._items.take(id) ?? new MessageHistoryItemMock();
  }

  add(message: PostboyGenericMessage): void {
    if (!this._items.take(message.id)?.add(message))
      this._items.put(message.id, new MessageHistoryItemMock().add(message));
  }

  reset(): void {
    this._items.forEach((i) => i.clear());
  }
}
