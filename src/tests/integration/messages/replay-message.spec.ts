import { take } from 'rxjs';
import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { SubscriptionBuilder } from '../../shared/builders/subscription.builder';
import { TestAssertions } from '../../shared/harness/assertions';
import { flushMicrotasks, waitForValue } from '../../shared/utils/async';
import { collectObservable, runMarbles, toArray } from '../../shared/utils/observables';

describe('Integration.Messages.Replay', () => {
  it('should replay the latest value to a late subscriber', async () => {
    const scenario = new ScenarioBuilder()
      .message()
      .replayRegistry();

    const world = scenario.getWorld();
    const message = scenario.getMessage();
    const received: unknown[] = [];

    scenario.actions().fire(message);
    scenario.actions().fire(message);

    SubscriptionBuilder
      .forType(world, message.type)
      .collect(received)
      .subscribe();

    await flushMicrotasks();

    TestAssertions.receivedOne(received, message);
  });

  it('should emit already fired value through observable collection', async () => {
    const scenario = new ScenarioBuilder()
      .message()
      .replayRegistry();

    const world = scenario.getWorld();
    const message = scenario.getMessage();

    scenario.actions().fire(message);

    const valuesPromise = toArray(world.getPostboy().sub(message.type).pipe(take(1)));

    await expect(valuesPromise).resolves.toEqual([message]);
  });

  it('should allow waiting for replayed value asynchronously', async () => {
    const scenario = new ScenarioBuilder()
      .message()
      .replayRegistry();

    const world = scenario.getWorld();
    const message = scenario.getMessage();
    const received: unknown[] = [];

    scenario.actions().fire(message);

    SubscriptionBuilder
      .forType(world, message.type)
      .collect(received)
      .subscribe();

    const value = await waitForValue(() => received[0], { timeoutMs: 100, intervalMs: 5 });

    expect(value).toEqual(message);
  });

  it('should keep replay behavior stable for multiple subscribers', async () => {
    const scenario = new ScenarioBuilder()
      .message()
      .replayRegistry();

    const world = scenario.getWorld();
    const message = scenario.getMessage();

    scenario.actions().fire(message);

    const first: unknown[] = [];
    const second: unknown[] = [];

    SubscriptionBuilder
      .forType(world, message.type)
      .collect(first)
      .subscribe();

    SubscriptionBuilder
      .forType(world, message.type)
      .collect(second)
      .subscribe();

    await flushMicrotasks();

    TestAssertions.receivedOne(first, message);
    TestAssertions.receivedOne(second, message);
  });

  it('should support observable inspection with collectObservable', () => {
    runMarbles(({ cold, expectObservable }) => {
      const source$ = cold('a-b-c|');

      expectObservable(source$).toBe('a-b-c|');
    });
  });

  it('should not emit additional values after replayed emission is consumed', async () => {
    const scenario = new ScenarioBuilder()
      .message()
      .replayRegistry();

    const world = scenario.getWorld();
    const message = scenario.getMessage();
    const received: unknown[] = [];

    const subscription = SubscriptionBuilder
      .forType(world, message.type)
      .collect(received)
      .subscribe();

    scenario.actions().fire(message);

    await flushMicrotasks();

    TestAssertions.receivedOne(received, message);

    subscription.unsubscribe();
    TestAssertions.subscriptionClosed(subscription);
  });
});
