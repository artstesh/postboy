import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { SubscriptionBuilder } from '../../shared/builders/subscription.builder';
import { TestAssertions } from '../../shared/harness/assertions';
import { flushMicrotasks, waitFor } from '../../shared/utils/async';
import {Forger} from "@artstesh/forger";

describe('Integration.Callbacks.Dispose', () => {
  it('should close callback result subscription on finish', async () => {
    const scenario = new ScenarioBuilder()
      .useCallback()
      .subjectRegistry();

    const actions = scenario.actions();
    const message = scenario.getMessage();

    let completed = false;

    const subscription = message.result.subscribe({
      complete: () => {
        completed = true;
      },
    });

    actions.fireCallback(message);
    message.finish(Forger.create<string>());

    await waitFor(() => completed);

    TestAssertions.should.true(completed);
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

    await waitFor(() => completed);

    await world.dispose();
    await world.dispose();

    TestAssertions.completed(completed);
  });
});
