import { Forger } from '@artstesh/forger';

export class Ids {
  static create(prefix?: string): string {
    const raw = Forger.create<string>() ?? `${Date.now()}-${Math.random()}`;
    return prefix ? `${prefix}-${raw}` : raw;
  }

  static message(): string {
    return this.create('msg');
  }

  static callbackMessage(): string {
    return this.create('cb');
  }

  static middleware(): string {
    return this.create('mw');
  }

  static registry(): string {
    return this.create('reg');
  }

  static subscription(): string {
    return this.create('sub');
  }

  static namespace(): string {
    return this.create('ns');
  }
}
