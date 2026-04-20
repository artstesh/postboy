import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { SubscriptionBuilder } from '../../shared/builders/subscription.builder';
import { TestAssertions } from '../../shared/harness/assertions';
import { waitForValue } from '../../shared/utils/async';

describe('Integration.Scenarios.ContextPropagation', () => {
  it('should fill message metadata during fire flow', async () => {
    const scenario = new ScenarioBuilder()
      .useMessage()
      .subjectRegistry();

    const world = scenario.getWorld();
    const actions = scenario.actions();
    const message = scenario.getMessage();
    const received: unknown[] = [];

    SubscriptionBuilder
      .forType(world, message.type)
      .collect(received)
      .subscribe();

    actions.fire(message);

    const value = await waitForValue(() => received[0], {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(value).toEqual(message);

    expect(message.metadata?.correlationId).toBe(message.id);
    expect(message.metadata?.causationId).toBeUndefined();
  });

  it('should preserve metadata through callback flow', async () => {
    const scenario = new ScenarioBuilder()
      .useCallback()
      .subjectRegistry();

    const actions = scenario.actions();
    const message = scenario.getMessage();

    actions.fireCallback(message);
    message.finish('ok');

    expect(message.metadata?.correlationId).toBe(message.id);
    expect(message.metadata?.causationId).toBeUndefined();
  });

  it('should not leak context between separate scenarios', async () => {
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

    expect(leftMessage.metadata?.correlationId).toBe(leftMessage.id);
    expect(rightMessage.metadata?.correlationId).toBe(rightMessage.id);
  });

  it('should keep tags and metadata intact during scenario flow', async () => {
    const scenario = new ScenarioBuilder()
      .useMessage()
      .subjectRegistry();

    const message = scenario.getMessage();
    message.setMetadata({
      tags: new Set(['alpha', 'beta']),
    });

    scenario.actions().fire(message);

    expect(message.metadata?.tags?.has('alpha')).toBe(true);
    expect(message.metadata?.tags?.has('beta')).toBe(true);
  });
});
