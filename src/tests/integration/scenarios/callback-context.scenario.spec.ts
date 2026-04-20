import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { TestAssertions } from '../../shared/harness/assertions';
import { waitFor } from '../../shared/utils/async';

describe('Integration.Scenarios.CallbackContext', () => {
  it('should keep callback metadata intact during fire and finish flow', async () => {
    const scenario = new ScenarioBuilder()
      .useCallback()
      .subjectRegistry();

    const actions = scenario.actions();
    const message = scenario.getMessage();

    let received: string | undefined;
    let completed = false;

    message.result.subscribe({
      next: (value: string) => {
        received = value;
      },
      complete: () => {
        completed = true;
      },
    });

    actions.fireCallback(message);
    message.finish('ok');

    await waitFor(() => completed && received === 'ok', {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(received).toBe('ok');
    TestAssertions.completed(completed);
    expect(message.metadata?.correlationId).toBe(message.id);
    expect(message.metadata?.causationId).toBeUndefined();
  });

  it('should preserve callback metadata through registered subscription flow', async () => {
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
    message.finish('payload');

    await waitFor(() => completed, {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(result).toBe('payload');
    expect(message.metadata?.correlationId).toBe(message.id);
    TestAssertions.completed(completed);
  });

  it('should not leak callback context between separate scenarios', async () => {
    const left = new ScenarioBuilder()
      .useCallback()
      .subjectRegistry();

    const right = new ScenarioBuilder()
      .useCallback()
      .subjectRegistry();

    const leftMessage = left.getMessage();
    const rightMessage = right.getMessage();

    let leftCompleted = false;
    let rightCompleted = false;

    leftMessage.result.subscribe({
      complete: () => {
        leftCompleted = true;
      },
    });

    rightMessage.result.subscribe({
      complete: () => {
        rightCompleted = true;
      },
    });

    left.actions().fireCallback(leftMessage);
    right.actions().fireCallback(rightMessage);

    leftMessage.finish('left');
    rightMessage.finish('right');

    await waitFor(() => leftCompleted && rightCompleted, {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(leftMessage.metadata?.correlationId).toBe(leftMessage.id);
    expect(rightMessage.metadata?.correlationId).toBe(rightMessage.id);
    TestAssertions.completed(leftCompleted);
    TestAssertions.completed(rightCompleted);
  });

  it('should keep callback tags intact during flow', async () => {
    const scenario = new ScenarioBuilder()
      .useCallback()
      .subjectRegistry();

    const actions = scenario.actions();
    const message = scenario.getMessage();

    message.setMetadata({
      tags: new Set(['alpha', 'beta']),
    });

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

    expect(message.metadata?.tags?.has('alpha')).toBe(true);
    expect(message.metadata?.tags?.has('beta')).toBe(true);
    TestAssertions.completed(completed);
  });
});
