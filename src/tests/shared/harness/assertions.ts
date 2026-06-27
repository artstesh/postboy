import { Subscription } from 'rxjs';
import { should, VerifierFactory } from '@artstesh/it-should';

export class TestAssertions {
  static should = should();

  static subscriptionOpen(sub: Subscription): void {
    expect(sub.closed).toBe(false);
  }

  static subscriptionClosed(sub: Subscription): void {
    expect(sub.closed).toBe(true);
  }

  static receivedCount<T>(received: T[], count: number): void {
    expect(received).toHaveLength(count);
  }

  static receivedExactly<T>(received: T[], expected: T[]): void {
    expect(received).toEqual(expected);
  }

  static receivedOne<T>(received: T[], value: T): void {
    expect(received).toEqual([value]);
  }

  static notReceived<T>(received: T[]): void {
    expect(received).toHaveLength(0);
  }

  static completed(flag: boolean): void {
    expect(flag).toBe(true);
  }

  static notCompleted(flag: boolean): void {
    expect(flag).toBe(false);
  }

  static throws(fn: () => void, message?: string | RegExp): void {
    if (message) {
      expect(fn).toThrow(message);
      return;
    }

    expect(fn).toThrow();
  }

  static notThrows(fn: () => void): void {
    expect(fn).not.toThrow();
  }

  static emittedTimes<T>(received: T[], count: number): void {
    expect(received.length).toBe(count);
  }

  static emittedValue<T>(received: T[], index: number, value: T): void {
    expect(received[index]).toEqual(value);
  }

  static disposed(subscriptions: Subscription[]): void {
    subscriptions.forEach((sub) => expect(sub.closed).toBe(true));
  }
}
