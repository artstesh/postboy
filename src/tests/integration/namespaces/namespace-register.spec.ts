import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { SubscriptionBuilder } from '../../shared/builders/subscription.builder';
import { TestAssertions } from '../../shared/harness/assertions';
import { flushMicrotasks, waitForValue } from '../../shared/utils/async';

describe('Integration.Namespaces.Register', () => {
  it('should register namespace and deliver messages', async () => {
    const scenario = new ScenarioBuilder()
      .useMessage()
      .subjectRegistry();

    const actions = scenario.actions();
    const message = scenario.getMessage();
    const received: unknown[] = [];

    SubscriptionBuilder
      .forType(scenario.getWorld(), message.type)
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

  it('should allow replay registry to deliver last value to late subscriber', async () => {
    const scenario = new ScenarioBuilder()
      .useMessage()
      .replayRegistry();

    const actions = scenario.actions();
    const message = scenario.getMessage();
    const received: unknown[] = [];

    actions.fire(message);

    SubscriptionBuilder
      .forType(scenario.getWorld(), message.type)
      .collect(received)
      .subscribe();

    const value = await waitForValue(() => received[0], {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(value).toEqual(message);
  });

  it('should support multiple subscriptions for the same registered namespace', async () => {
    const scenario = new ScenarioBuilder()
      .useMessage()
      .subjectRegistry();

    const actions = scenario.actions();
    const message = scenario.getMessage();

    const first: unknown[] = [];
    const second: unknown[] = [];

    SubscriptionBuilder
      .forType(scenario.getWorld(), message.type)
      .collect(first)
      .subscribe();

    SubscriptionBuilder
      .forType(scenario.getWorld(), message.type)
      .collect(second)
      .subscribe();

    actions.fire(message);
    await flushMicrotasks();

    TestAssertions.receivedOne(first, message);
    TestAssertions.receivedOne(second, message);
  });

  it('should keep registration active until dispose', async () => {
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

    actions.fire(message);

    const value = await waitForValue(() => received[0], {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(value).toEqual(message);

    await world.dispose();

    TestAssertions.subscriptionClosed(subscription);
  });

  it('should not emit without registration', () => {
    const scenario = new ScenarioBuilder().useMessage();
    const actions = scenario.actions();
    const message = scenario.getMessage();

    TestAssertions.throws(() => {
      actions.fire(message);
    });
  });
});
