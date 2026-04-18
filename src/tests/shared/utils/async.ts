export function flushMicrotasks(): Promise<void> {
  return Promise.resolve();
}

export function nextTick(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

export function delay(ms = 0): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function waitFor(
  predicate: () => boolean,
  options: {
    timeoutMs?: number;
    intervalMs?: number;
  } = {},
): Promise<void> {
  const timeoutMs = options.timeoutMs ?? 1000;
  const intervalMs = options.intervalMs ?? 10;
  const startedAt = Date.now();

  while (!predicate()) {
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error(`waitFor: timeout after ${timeoutMs}ms`);
    }

    await delay(intervalMs);
  }
}

export async function waitForValue<T>(
  getter: () => T | undefined,
  options: {
    timeoutMs?: number;
    intervalMs?: number;
  } = {},
): Promise<T> {
  let value: T | undefined;

  await waitFor(() => {
    value = getter();
    return value !== undefined;
  }, options);

  return value as T;
}

export async function expectRejected<T = unknown>(
  promise: Promise<T>,
): Promise<unknown> {
  try {
    await promise;
    throw new Error('Expected promise to be rejected');
  } catch (error) {
    return error;
  }
}

/*
1. flushMicrotasks``` ts
import { flushMicrotasks } from '../../shared/utils/async';

it('should wait for microtasks', async () => {
  let done = false;

  Promise.resolve().then(() => {
    done = true;
  });

  await flushMicrotasks();

  expect(done).toBe(true);
});
```

2. nextTick``` ts
import { nextTick } from '../../shared/utils/async';

it('should wait next tick', async () => {
  let done = false;

  setTimeout(() => {
    done = true;
  }, 0);

  await nextTick();

  expect(done).toBe(true);
});
```

3. delay``` ts
import { delay } from '../../shared/utils/async';

it('should delay execution', async () => {
  const started = Date.now();

  await delay(10);

  expect(Date.now() - started).toBeGreaterThanOrEqual(10);
});
```

4. waitFor``` ts
import { waitFor } from '../../shared/utils/async';

it('should wait until condition becomes true', async () => {
  let ready = false;

  setTimeout(() => {
    ready = true;
  }, 20);

  await waitFor(() => ready, { timeoutMs: 100, intervalMs: 5 });

  expect(ready).toBe(true);
});
```

5. waitForValue``` ts
import { waitForValue } from '../../shared/utils/async';

it('should wait for value', async () => {
  let value: string | undefined;

  setTimeout(() => {
    value = 'ok';
  }, 20);

  await expect(waitForValue(() => value)).resolves.toBe('ok');
});
```

6. expectRejected``` ts
import { expectRejected } from '../../shared/utils/async';

it('should capture rejected promise', async () => {
  const error = new Error('boom');
  const promise = Promise.reject(error);

  await expect(expectRejected(promise)).resolves.toBe(error);
});
```

 */
