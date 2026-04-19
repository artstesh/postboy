import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { TestAssertions } from '../../shared/harness/assertions';
import { waitFor } from '../../shared/utils/async';

describe('Integration.Callbacks.Complete', () => {
  it('should complete callback message', async () => {
    const scenario = new ScenarioBuilder()
      .useCallback()
      .subjectRegistry();

    const actions = scenario.actions();
    const message = scenario.getMessage();

    let completed = false;
    let result = '';

    message.result.subscribe({
      next: (value: string) => {
        result = value;
      },
      complete: () => {
        completed = true;
      },
    });

    actions.fireCallback(message);
    message.finish('ok');

    await waitFor(() => completed && result === 'ok', {
      timeoutMs: 100,
      intervalMs: 5,
    });

    TestAssertions.completed(completed);
    expect(result).toBe('ok');
  });

  it('should complete callback result only once', async () => {
    const scenario = new ScenarioBuilder()
      .useCallback()
      .subjectRegistry();

    const actions = scenario.actions();
    const message = scenario.getMessage();

    let completedCount = 0;

    message.result.subscribe({
      complete: () => {
        completedCount++;
      },
    });

    actions.fireCallback(message);
    message.finish('ok');

    await waitFor(() => completedCount === 1, {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(completedCount).toBe(1);
  });

  it('should allow callback completion through the full lifecycle', async () => {
    const scenario = new ScenarioBuilder()
      .useCallback()
      .subjectRegistry();

    const actions = scenario.actions();
    const message = scenario.getMessage();

    const received: string[] = [];
    let completed = false;

    message.result.subscribe({
      next: (value: string) => received.push(value),
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

    TestAssertions.receivedOne(received, 'done');
    TestAssertions.completed(completed);
  });
});
