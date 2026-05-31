import {ScenarioBuilder} from '../../shared/builders/scenario.builder';
import {SubscriptionBuilder} from '../../shared/builders/subscription.builder';
import {TestAssertions} from '../../shared/harness/assertions';
import {flushMicrotasks, waitForValue} from '../../shared/utils/async';
import {RegistryBuilder} from "../../shared/builders/registry.builder";

describe('Integration.Scenarios.RegistryLifecycle', () => {
  let scenario: ScenarioBuilder;
  let registry: RegistryBuilder;

  beforeEach(() => {
    scenario = new ScenarioBuilder();
    registry = new RegistryBuilder(scenario.getWorld().getPostboy());
  })

  it('should dispose cleanly', async () => {
    const scenario = new ScenarioBuilder().useMessage().subjectRegistry();
    //
    const sub = SubscriptionBuilder.forType(scenario.getWorld(), scenario.getMessage().type).subscribe();
    //
    scenario.getWorld().get('registry')?.down();
    //
    TestAssertions.subscriptionClosed(sub);
  });

  it('should preserve replay registry state until disposal', async () => {
    const scenario = new ScenarioBuilder()
      .useMessage()
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

    const value = await waitForValue(() => received[0]);

    expect(value).toEqual(message);
    TestAssertions.receivedOne(received, message);

    await world.dispose();

    TestAssertions.subscriptionClosed(subscription);
  });

  it('should keep multiple registry subscribers isolated within the same lifecycle', async () => {
    const scenario = new ScenarioBuilder()
      .useMessage()
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

  it('should not leak registry state across separate scenarios', async () => {
    const left = new ScenarioBuilder()
      .useMessage()
      .subjectRegistry();

    const right = new ScenarioBuilder()
      .useMessage()
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

    const leftValue = await waitForValue(() => leftReceived[0]);

    const rightValue = await waitForValue(() => rightReceived[0]);

    expect(leftValue).toEqual(leftMessage);
    expect(rightValue).toEqual(rightMessage);
  });
});
