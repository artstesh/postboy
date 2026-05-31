import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { SubscriptionBuilder } from '../../shared/builders/subscription.builder';
import { TestAssertions } from '../../shared/harness/assertions';
import { waitForValue } from '../../shared/utils/async';

describe('Integration.Scenarios.ContextPropagation', () => {

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
