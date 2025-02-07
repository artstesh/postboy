import { PostboyGenericMessage } from '../models/postboy-generic-message';

export class MessageHistoryItemMock<T extends PostboyGenericMessage> {
  private list: T[] = [];

  add(message: T) {
    this.list.push(message);
    return this;
  }

  clear() {
    this.list = [];
  }

  get length(): number {
    return this.list.length;
  }

  get last(): T {
    return this.list[this.list.length - 1];
  }

  get all(): T[] {
    return [...this.list];
  }
}
