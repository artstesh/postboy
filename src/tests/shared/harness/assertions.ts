import { Subscription } from 'rxjs';
import {should, VerifierFactory} from '@artstesh/it-should';

export class TestAssertions {

  static should(): VerifierFactory {
    return should();
  }

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

/*
import { TestAssertions } from '../../shared/harness/assertions';

it('should deliver one message', () => {
  const received: unknown[] = [{ type: 'message-type', payload: 123 }];

  TestAssertions.receivedOne(received, { type: 'message-type', payload: 123 });
});

---

import { TestAssertions } from '../../shared/harness/assertions';

it('should close subscription', () => {
  const sub = { closed: true } as any;

  TestAssertions.subscriptionClosed(sub);
});

---

import { TestAssertions } from '../../shared/harness/assertions';

it('should not throw', () => {
  TestAssertions.notThrows(() => {
    const x = 1 + 1;
    void x;
  });
});
 */
