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
  const timeoutMs = options.timeoutMs ?? 10;
  const intervalMs = options.intervalMs ?? 2;
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
