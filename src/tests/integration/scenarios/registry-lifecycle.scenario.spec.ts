import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { SubscriptionBuilder } from '../../shared/builders/subscription.builder';
import { TestAssertions } from '../../shared/harness/assertions';
import { flushMicrotasks, waitForValue } from '../../shared/utils/async';

describe('Integration.Scenarios.RegistryLifecycle', () => {
  it('should register registry, deliver messages and dispose cleanly', async () => {
    const scenario = new ScenarioBuilder()
      .message()
      .subjectRegistry();

    const world = scenario.getWorld();
    const actions = scenario.actions();
    const message = scenario.getMessage();
    const received: unknown[] = [];

    const subscription = SubscriptionBuilder
      .forType(world, message.type)
      .collect(received)
      .subscribe();

    actions.fire(message);

    const value = await waitForValue(() => received[0], {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(value).toEqual(message);
    TestAssertions.receivedOne(received, message);

    await world.dispose();

    TestAssertions.subscriptionClosed(subscription);
  });

  it('should preserve replay registry state until disposal', async () => {
    const scenario = new ScenarioBuilder()
      .message()
      .replayRegistry();

    const world = scenario.getWorld();
    const actions = scenario.actions();
    const message = scenario.getMessage();
    const received: unknown[] = [];

    actions.fire(message);

    const subscription = SubscriptionBuilder
      .forType(world, message.type)
      .collect(received)
      .subscribe();

    const value = await waitForValue(() => received[0], {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(value).toEqual(message);
    TestAssertions.receivedOne(received, message);

    await world.dispose();

    TestAssertions.subscriptionClosed(subscription);
  });

  it('should keep multiple registry subscribers isolated within the same lifecycle', async () => {
    const scenario = new ScenarioBuilder()
      .message()
      .subjectRegistry();

    const world = scenario.getWorld();
    const actions = scenario.actions();
    const message = scenario.getMessage();

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

    actions.fire(message);
    await flushMicrotasks();

    TestAssertions.receivedOne(first, message);
    TestAssertions.receivedOne(second, message);
  });

  it('should stop delivery after registry is disposed', async () => {
    const scenario = new ScenarioBuilder()
      .message()
      .subjectRegistry();

    const world = scenario.getWorld();
    const actions = scenario.actions();
    const message = scenario.getMessage();
    const received: unknown[] = [];

    SubscriptionBuilder
      .forType(world, message.type)
      .collect(received)
      .subscribe();

    await world.dispose();

    actions.fire(message);
    await flushMicrotasks();

    TestAssertions.notReceived(received);
  });

  it('should not leak registry state across separate scenarios', async () => {
    const left = new ScenarioBuilder()
      .message()
      .subjectRegistry();

    const right = new ScenarioBuilder()
      .message()
      .subjectRegistry();

    const leftWorld = left.getWorld();
    const rightWorld = right.getWorld();

    const leftMessage = left.getMessage();
    const rightMessage = right.getMessage();

    const leftReceived: unknown[] = [];
    const rightReceived: unknown[] = [];

    SubscriptionBuilder
      .forType(leftWorld, leftMessage.type)
      .collect(leftReceived)
      .subscribe();

    SubscriptionBuilder
      .forType(rightWorld, rightMessage.type)
      .collect(rightReceived)
      .subscribe();

    left.actions().fire(leftMessage);
    right.actions().fire(rightMessage);

    const leftValue = await waitForValue(() => leftReceived[0], {
      timeoutMs: 100,
      intervalMs: 5,
    });

    const rightValue = await waitForValue(() => rightReceived[0], {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(leftValue).toEqual(leftMessage);
    expect(rightValue).toEqual(rightMessage);
  });
});
