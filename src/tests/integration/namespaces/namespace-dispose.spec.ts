import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { SubscriptionBuilder } from '../../shared/builders/subscription.builder';
import { TestAssertions } from '../../shared/harness/assertions';
import { flushMicrotasks, waitForValue } from '../../shared/utils/async';

describe('Integration.Namespaces.Dispose', () => {
  it('should close subscription when world is disposed', async () => {
    const scenario = new ScenarioBuilder()
      .useMessage()
      .subjectRegistry();

    const world = scenario.getWorld();
    const message = scenario.getMessage();
    const received: unknown[] = [];

    const subscription = SubscriptionBuilder
      .forType(world, message.type)
      .collect(received)
      .subscribe();

    scenario.actions().fire(message);

    const value = await waitForValue(() => received[0], {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(value).toEqual(message);
    TestAssertions.subscriptionOpen(subscription);

    await world.dispose();

    TestAssertions.subscriptionClosed(subscription);
  });

  it('should close replay subscription on dispose and not leak between scenarios', async () => {
    const scenario = new ScenarioBuilder()
      .useMessage()
      .replayRegistry();

    const world = scenario.getWorld();
    const message = scenario.getMessage();
    const received: unknown[] = [];

    scenario.actions().fire(message);

    const subscription = SubscriptionBuilder
      .forType(world, message.type)
      .collect(received)
      .subscribe();

    const value = await waitForValue(() => received[0], {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(value).toEqual(message);

    await world.dispose();

    TestAssertions.subscriptionClosed(subscription);
  });

  it('should dispose multiple subscriptions in the same namespace', async () => {
    const scenario = new ScenarioBuilder()
      .useMessage()
      .subjectRegistry();

    const world = scenario.getWorld();
    const message = scenario.getMessage();
    const first: unknown[] = [];
    const second: unknown[] = [];

    const sub1 = SubscriptionBuilder
      .forType(world, message.type)
      .collect(first)
      .subscribe();

    const sub2 = SubscriptionBuilder
      .forType(world, message.type)
      .collect(second)
      .subscribe();

    scenario.actions().fire(message);

    const firstValue = await waitForValue(() => first[0], {
      timeoutMs: 100,
      intervalMs: 5,
    });
    const secondValue = await waitForValue(() => second[0], {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(firstValue).toEqual(message);
    expect(secondValue).toEqual(message);

    await world.dispose();

    TestAssertions.subscriptionClosed(sub1);
    TestAssertions.subscriptionClosed(sub2);
  });

  it('should allow dispose to be called more than once safely', async () => {
    const scenario = new ScenarioBuilder()
      .useMessage()
      .subjectRegistry();

    const world = scenario.getWorld();
    const message = scenario.getMessage();
    const received: unknown[] = [];

    SubscriptionBuilder
      .forType(world, message.type)
      .collect(received)
      .subscribe();

    scenario.actions().fire(message);

    const value = await waitForValue(() => received[0], {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(value).toEqual(message);

    await world.dispose();
    await world.dispose();

    TestAssertions.receivedOne(received, message);
  });
});
