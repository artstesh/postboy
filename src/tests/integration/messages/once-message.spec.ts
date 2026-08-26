import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { SubscriptionBuilder } from '../../shared/builders/subscription.builder';
import { TestAssertions } from '../../shared/harness/assertions';
import { flushMicrotasks } from '../../shared/utils/async';

describe('Integration.Messages.Once', () => {
  it('should receive only the first fired message', async () => {
    const scenario = new ScenarioBuilder().useMessage().subjectRegistry();

    const actions = scenario.actions();
    const message = scenario.getMessage();
    const received: unknown[] = [];

    SubscriptionBuilder.forType(scenario.getWorld(), message.type).asOnce().collect(received).subscribe();

    actions.fire(message);
    actions.fire(message);
    await flushMicrotasks();

    TestAssertions.receivedCount(received, 1);
  });

  it('should auto-complete after the first message', async () => {
    const scenario = new ScenarioBuilder().useMessage().subjectRegistry();

    const actions = scenario.actions();
    const message = scenario.getMessage();

    const sub = SubscriptionBuilder.forType(scenario.getWorld(), message.type).asOnce().subscribe();

    actions.fire(message);
    await flushMicrotasks();

    TestAssertions.subscriptionClosed(sub);
  });
});
