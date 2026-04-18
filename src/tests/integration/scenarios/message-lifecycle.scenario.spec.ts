import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { SubscriptionBuilder } from '../../shared/builders/subscription.builder';
import { TestAssertions } from '../../shared/harness/assertions';
import { flushMicrotasks, waitForValue } from '../../shared/utils/async';

describe('Integration.Scenarios.MessageLifecycle', () => {
  it('should register, fire and deliver message through the full lifecycle', async () => {
    const scenario = new ScenarioBuilder()
      .message()
      .subjectRegistry();

    const actions = scenario.actions();
    const world = scenario.getWorld();
    const message = scenario.getMessage();
    const received: unknown[] = [];

    SubscriptionBuilder
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
  });

  it('should keep message available for multiple subscribers during lifecycle', async () => {
    const scenario = new ScenarioBuilder()
      .message()
      .subjectRegistry();

    const actions = scenario.actions();
    const world = scenario.getWorld();
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

  it('should allow once subscription to complete after first delivery', async () => {
    const scenario = new ScenarioBuilder()
      .message()
      .subjectRegistry();

    const actions = scenario.actions();
    const world = scenario.getWorld();
    const message = scenario.getMessage();
    const received: unknown[] = [];

    const subscription = SubscriptionBuilder
      .forType(world, message.type)
      .asOnce()
      .collect(received)
      .subscribe();

    actions.fire(message);

    const value = await waitForValue(() => received[0], {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(value).toEqual(message);
    TestAssertions.subscriptionClosed(subscription);
  });

  it('should not deliver message after world disposal', async () => {
    const scenario = new ScenarioBuilder()
      .message()
      .subjectRegistry();

    const actions = scenario.actions();
    const world = scenario.getWorld();
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

  it('should preserve replay semantics across lifecycle steps', async () => {
    const scenario = new ScenarioBuilder()
      .message()
      .replayRegistry();

    const actions = scenario.actions();
    const world = scenario.getWorld();
    const message = scenario.getMessage();
    const received: unknown[] = [];

    actions.fire(message);

    SubscriptionBuilder
      .forType(world, message.type)
      .collect(received)
      .subscribe();

    const value = await waitForValue(() => received[0], {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(value).toEqual(message);
    TestAssertions.receivedOne(received, message);
  });
});
