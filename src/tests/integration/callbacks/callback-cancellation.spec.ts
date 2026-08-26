import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { SubscriptionBuilder } from '../../shared/builders/subscription.builder';
import { TestAssertions } from '../../shared/harness/assertions';
import { flushMicrotasks, waitFor } from '../../shared/utils/async';

describe('Integration.Callbacks.Cancellation', () => {
  it('should not deliver the callback when middleware interrupts before it fires', () => {
    const scenario = new ScenarioBuilder().useCallback().subjectRegistry();

    const actions = scenario.actions();
    const message = scenario.getMessage();

    scenario.useMiddleware().interrupting();

    TestAssertions.throws(() => actions.fireCallback(message));
  });

  it('should surface middleware errors to the caller of fireCallback', () => {
    const scenario = new ScenarioBuilder().useCallback().subjectRegistry();

    const actions = scenario.actions();
    const message = scenario.getMessage();

    scenario.useMiddleware().throwing();

    TestAssertions.throws(() => actions.fireCallback(message));
  });

  it('should stop delivering after the result subscription is unsubscribed', async () => {
    const scenario = new ScenarioBuilder().useCallback().subjectRegistry();

    const actions = scenario.actions();
    const message = scenario.getMessage();
    const received: unknown[] = [];

    const subscription = message.result.subscribe((value: unknown) => received.push(value));

    actions.fireCallback(message);
    message.finish('first');
    await waitFor(() => received.length > 0);

    subscription.unsubscribe();
    message.finish('second');
    await flushMicrotasks();

    TestAssertions.receivedCount(received, 1);
  });
});
