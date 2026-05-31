import {
  TestScheduler,
  RunHelpers,
} from 'rxjs/testing';
import {
  Observable,
  Subscription,
} from 'rxjs';

export type MarbleRunCallback<T = void> = (helpers: RunHelpers) => T;

export function createTestScheduler(): TestScheduler {
  return new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });
}

export function runMarbles<T>(callback: MarbleRunCallback<T>): T {
  const scheduler = createTestScheduler();
  return scheduler.run(callback);
}

export function collectObservable<T>(
  source$: Observable<T>,
  received: T[] = [],
): {
  received: T[];
  subscription: Subscription;
} {
  const subscription = source$.subscribe((value) => {
    received.push(value);
  });

  return { received, subscription };
}

export function nextTick(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

export function toArray<T>(source$: Observable<T>): Promise<T[]> {
  return new Promise<T[]>((resolve, reject) => {
    const received: T[] = [];

    source$.subscribe({
      next: (value) => received.push(value),
      error: (error) => reject(error),
      complete: () => resolve(received),
    });
  });
}

export function unsubscribeAll(subscriptions: Array<Subscription | undefined | null>): void {
  subscriptions.forEach((subscription) => {
    subscription?.unsubscribe();
  });
}

export function isClosed(subscription: Subscription | null | undefined): boolean {
  return !!subscription?.closed;
}
