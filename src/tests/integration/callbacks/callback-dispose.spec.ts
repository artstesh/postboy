import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { SubscriptionBuilder } from '../../shared/builders/subscription.builder';
import { TestAssertions } from '../../shared/harness/assertions';
import { flushMicrotasks, waitFor } from '../../shared/utils/async';

describe('Integration.Callbacks.Dispose', () => {
  it('should close callback result subscription on world dispose', async () => {
    const scenario = new ScenarioBuilder()
      .useCallback()
      .subjectRegistry();

    const world = scenario.getWorld();
    const actions = scenario.actions();
    const message = scenario.getMessage();

    let completed = false;

    const subscription = message.result.subscribe({
      complete: () => {
        completed = true;
      },
    });

    actions.fireCallback(message);

    await world.dispose();

    await waitFor(() => completed, {
      timeoutMs: 100,
      intervalMs: 5,
    });

    TestAssertions.completed(completed);
    TestAssertions.subscriptionClosed(subscription);
  });

  it('should not emit callback result after world disposal', async () => {
    const scenario = new ScenarioBuilder()
      .useCallback()
      .subjectRegistry();

    const world = scenario.getWorld();
    const actions = scenario.actions();
    const message = scenario.getMessage();
    const received: string[] = [];

    message.result.subscribe((value: string) => received.push(value));

    await world.dispose();

    actions.fireCallback(message);
    message.finish('ok');

    await flushMicrotasks();

    TestAssertions.notReceived(received);
  });

  it('should dispose callback subscribers together with the namespace', async () => {
    const scenario = new ScenarioBuilder()
      .useCallback()
      .subjectRegistry();

    const world = scenario.getWorld();
    const actions = scenario.actions();
    const message = scenario.getMessage();
    const received: string[] = [];

    const subscription = SubscriptionBuilder
      .forType(world, message.type)
      .collect(received)
      .subscribe();

    actions.fireCallback(message);
    message.finish('done');

    await waitFor(() => received[0] === 'done', {
      timeoutMs: 100,
      intervalMs: 5,
    });

    await world.dispose();

    TestAssertions.subscriptionClosed(subscription);
  });

  it('should keep callback disposal idempotent', async () => {
    const scenario = new ScenarioBuilder()
      .useCallback()
      .subjectRegistry();

    const world = scenario.getWorld();
    const message = scenario.getMessage();

    let completed = false;
    message.result.subscribe({
      complete: () => {
        completed = true;
      },
    });

    scenario.actions().fireCallback(message);
    message.finish('done');

    await waitFor(() => completed, {
      timeoutMs: 100,
      intervalMs: 5,
    });

    await world.dispose();
    await world.dispose();

    TestAssertions.completed(completed);
  });
});
