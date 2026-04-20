import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { TestAssertions } from '../../shared/harness/assertions';
import { waitFor } from '../../shared/utils/async';

describe('Integration.Scenarios.ContextIsolation', () => {
  it('should keep message context isolated between separate scenarios', async () => {
    const left = new ScenarioBuilder()
      .useMessage()
      .subjectRegistry();

    const right = new ScenarioBuilder()
      .useMessage()
      .subjectRegistry();

    const leftMessage = left.getMessage();
    const rightMessage = right.getMessage();

    left.actions().fire(leftMessage);
    right.actions().fire(rightMessage);

    await waitFor(() => {
      return (
        leftMessage.metadata?.correlationId === leftMessage.id &&
        rightMessage.metadata?.correlationId === rightMessage.id
      );
    }, {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(leftMessage.metadata?.correlationId).toBe(leftMessage.id);
    expect(rightMessage.metadata?.correlationId).toBe(rightMessage.id);
    expect(leftMessage.metadata?.causationId).toBeUndefined();
    expect(rightMessage.metadata?.causationId).toBeUndefined();
  });

  it('should not share tags between independent scenarios', async () => {
    const left = new ScenarioBuilder()
      .useMessage()
      .subjectRegistry();

    const right = new ScenarioBuilder()
      .useMessage()
      .subjectRegistry();

    const leftMessage = left.getMessage();
    const rightMessage = right.getMessage();

    leftMessage.setMetadata({
      tags: new Set(['left-tag']),
    });

    rightMessage.setMetadata({
      tags: new Set(['right-tag']),
    });

    left.actions().fire(leftMessage);
    right.actions().fire(rightMessage);

    await waitFor(() => {
      return (
        leftMessage.metadata?.tags?.has('left-tag') === true &&
        rightMessage.metadata?.tags?.has('right-tag') === true
      );
    }, {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(leftMessage.metadata?.tags?.has('left-tag')).toBe(true);
    expect(leftMessage.metadata?.tags?.has('right-tag')).toBe(false);
    expect(rightMessage.metadata?.tags?.has('right-tag')).toBe(true);
    expect(rightMessage.metadata?.tags?.has('left-tag')).toBe(false);
  });

  it('should keep callback context isolated between separate scenarios', async () => {
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

    TestAssertions.completed(leftCompleted);
    TestAssertions.completed(rightCompleted);
    expect(leftMessage.metadata?.correlationId).toBe(leftMessage.id);
    expect(rightMessage.metadata?.correlationId).toBe(rightMessage.id);
  });
});
