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

/*
1. runMarbles``` ts
import { runMarbles } from '../../shared/utils/observables';

it('should emit values in order', () => {
  runMarbles(({ cold, expectObservable }) => {
    const source$ = cold('a-b-c|');

    expectObservable(source$).toBe('a-b-c|');
  });
});
```

2. collectObservable``` ts
import { of } from 'rxjs';
import { collectObservable } from '../../shared/utils/observables';

it('should collect emitted values', () => {
  const { received, subscription } = collectObservable(of(1, 2, 3));

  expect(received).toEqual([1, 2, 3]);
  subscription.unsubscribe();
});
```

3. toArray``` ts
import { of } from 'rxjs';
import { toArray } from '../../shared/utils/observables';

it('should convert observable to array', async () => {
  await expect(toArray(of('a', 'b', 'c'))).resolves.toEqual(['a', 'b', 'c']);
});
```

4. unsubscribeAll``` ts
import { Subscription } from 'rxjs';
import { unsubscribeAll } from '../../shared/utils/observables';

it('should unsubscribe all subscriptions', () => {
  const sub1 = new Subscription();
  const sub2 = new Subscription();

  unsubscribeAll([sub1, sub2]);

  expect(sub1.closed).toBe(true);
  expect(sub2.closed).toBe(true);
});
```

5. isClosed``` ts
import { Subscription } from 'rxjs';
import { isClosed } from '../../shared/utils/observables';

it('should detect closed subscription', () => {
  const sub = new Subscription();

  expect(isClosed(sub)).toBe(false);

  sub.unsubscribe();

  expect(isClosed(sub)).toBe(true);
});
```

 */
