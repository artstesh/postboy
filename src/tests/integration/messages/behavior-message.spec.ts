import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { SubscriptionBuilder } from '../../shared/builders/subscription.builder';
import { TestAssertions } from '../../shared/harness/assertions';
import { flushMicrotasks } from '../../shared/utils/async';

describe('Integration.Messages.Behavior', () => {
  it('should emit the initial value to late subscribers', async () => {
    const scenario = new ScenarioBuilder().useMessage().behaviorRegistry('initial');

    const world = scenario.getWorld();
    const message = scenario.getMessage();
    const received: unknown[] = [];

    SubscriptionBuilder.forType(world, message.type).collect(received).subscribe();
    await flushMicrotasks();

    TestAssertions.receivedCount(received, 1);
  });

  it('should replay the latest value and keep streaming new ones', async () => {
    const scenario = new ScenarioBuilder().useMessage().behaviorRegistry('initial');

    const world = scenario.getWorld();
    const actions = scenario.actions();
    const message = scenario.getMessage();
    const received: unknown[] = [];

    actions.fire(message);
    await flushMicrotasks();

    SubscriptionBuilder.forType(world, message.type).collect(received).subscribe();
    actions.fire(message);
    await flushMicrotasks();

    TestAssertions.receivedCount(received, 2);
  });

  it('should complete behavior subscriptions when the registry goes down', async () => {
    const scenario = new ScenarioBuilder().useMessage().behaviorRegistry('initial');

    const sub = SubscriptionBuilder.forType(scenario.getWorld(), scenario.getMessage().type).subscribe();

    scenario.getWorld().get('registry')?.down();

    TestAssertions.subscriptionClosed(sub);
  });
});
