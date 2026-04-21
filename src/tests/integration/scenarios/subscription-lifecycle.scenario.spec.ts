import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { SubscriptionBuilder } from '../../shared/builders/subscription.builder';
import { TestAssertions } from '../../shared/harness/assertions';
import { flushMicrotasks, waitForValue } from '../../shared/utils/async';

describe('Integration.Scenarios.SubscriptionLifecycle', () => {
  it('should create subscription, receive value and close on dispose', async () => {
    const scenario = new ScenarioBuilder()
      .useMessage()
      .subjectRegistry();

    const world = scenario.getWorld();
    const actions = scenario.actions();
    const message = scenario.getMessage();
    const received: unknown[] = [];

    const subscription = SubscriptionBuilder
      .forType(world, message.type)
      .collect(received)
      .subscribe();

    TestAssertions.subscriptionOpen(subscription);

    actions.fire(message);

    const value = await waitForValue(() => received[0]);

    expect(value).toEqual(message);
    TestAssertions.receivedOne(received, message);

    await world.dispose();

    TestAssertions.subscriptionClosed(subscription);
  });

  it('should support once subscription lifecycle', async () => {
    const scenario = new ScenarioBuilder()
      .useMessage()
      .subjectRegistry();

    const world = scenario.getWorld();
    const actions = scenario.actions();
    const message = scenario.getMessage();
    const received: unknown[] = [];

    const subscription = SubscriptionBuilder
      .forType(world, message.type)
      .asOnce()
      .collect(received)
      .subscribe();

    TestAssertions.subscriptionOpen(subscription);

    actions.fire(message);

    const value = await waitForValue(() => received[0]);

    expect(value).toEqual(message);

    await flushMicrotasks();

    TestAssertions.receivedOne(received, message);
    TestAssertions.subscriptionClosed(subscription);
  });

  it('should keep subscription open until explicit unsubscribe', async () => {
    const scenario = new ScenarioBuilder()
      .useMessage()
      .subjectRegistry();

    const world = scenario.getWorld();
    const actions = scenario.actions();
    const message = scenario.getMessage();
    const received: unknown[] = [];

    const subscription = SubscriptionBuilder
      .forType(world, message.type)
      .collect(received)
      .subscribe();

    TestAssertions.subscriptionOpen(subscription);

    actions.fire(message);

    const value = await waitForValue(() => received[0]);

    expect(value).toEqual(message);

    subscription.unsubscribe();

    TestAssertions.subscriptionClosed(subscription);
  });

  it('should not receive values after unsubscribe', async () => {
    const scenario = new ScenarioBuilder()
      .useMessage()
      .subjectRegistry();

    const world = scenario.getWorld();
    const actions = scenario.actions();
    const message = scenario.getMessage();
    const received: unknown[] = [];

    const subscription = SubscriptionBuilder
      .forType(world, message.type)
      .collect(received)
      .subscribe();

    subscription.unsubscribe();

    actions.fire(message);
    await flushMicrotasks();

    TestAssertions.subscriptionClosed(subscription);
    TestAssertions.notReceived(received);
  });

  it('should close all subscriptions on world dispose', async () => {
    const scenario = new ScenarioBuilder()
      .useMessage()
      .subjectRegistry();

    const world = scenario.getWorld();
    const actions = scenario.actions();
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

    actions.fire(message);

    const firstValue = await waitForValue(() => first[0]);

    const secondValue = await waitForValue(() => second[0]);

    expect(firstValue).toEqual(message);
    expect(secondValue).toEqual(message);

    await world.dispose();

    TestAssertions.subscriptionClosed(sub1);
    TestAssertions.subscriptionClosed(sub2);
  });
});
