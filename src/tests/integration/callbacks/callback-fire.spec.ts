import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { TestAssertions } from '../../shared/harness/assertions';
import { waitFor, waitForValue } from '../../shared/utils/async';
import { toArray } from '../../shared/utils/observables';

describe('Integration.Callbacks.Fire', () => {
  it('should fire callback message and emit result value', async () => {
    const scenario = new ScenarioBuilder()
      .useCallback()
      .subjectRegistry();

    const actions = scenario.actions();
    const message = scenario.getMessage();

    const received: string[] = [];
    message.result.subscribe((value: string) => received.push(value));

    actions.fireCallback(message);
    message.finish('ok');

    const value = await waitForValue(() => received[0], {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(value).toBe('ok');
    TestAssertions.receivedOne(received, 'ok');
  });

  it('should complete callback message after finish', async () => {
    const scenario = new ScenarioBuilder()
      .useCallback()
      .subjectRegistry();

    const actions = scenario.actions();
    const message = scenario.getMessage();

    let completed = false;
    message.result.subscribe({
      complete: () => {
        completed = true;
      },
    });

    actions.fireCallback(message);
    message.finish('done');

    await waitFor(() => completed, {
      timeoutMs: 100,
      intervalMs: 5,
    });

    TestAssertions.completed(completed);
  });

  it('should support observable collection for callback result', async () => {
    const scenario = new ScenarioBuilder()
      .useCallback()
      .subjectRegistry();

    const actions = scenario.actions();
    const message = scenario.getMessage();

    const valuesPromise = toArray(message.result);

    actions.fireCallback(message);
    message.finish('payload');

    await expect(valuesPromise).resolves.toEqual(['payload']);
  });

  it('should throw when callback message is not registered', () => {
    const scenario = new ScenarioBuilder().useCallback();
    const message = scenario.getMessage();

    TestAssertions.throws(() => {
      scenario.actions().fireCallback(message);
    });
  });

  it('should not complete before finish is called', async () => {
    const scenario = new ScenarioBuilder()
      .useCallback()
      .subjectRegistry();

    const actions = scenario.actions();
    const message = scenario.getMessage();

    let completed = false;
    message.result.subscribe({
      complete: () => {
        completed = true;
      },
    });

    actions.fireCallback(message);

    await waitFor(() => !completed, {
      timeoutMs: 50,
      intervalMs: 5,
    });

    expect(completed).toBe(false);
  });
});
