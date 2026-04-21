import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { TestAssertions } from '../../shared/harness/assertions';
import { waitFor } from '../../shared/utils/async';

describe('Integration.Scenarios.ContextIsolation', () => {

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
    });

    expect(leftMessage.metadata?.tags?.has('left-tag')).toBe(true);
    expect(leftMessage.metadata?.tags?.has('right-tag')).toBe(false);
    expect(rightMessage.metadata?.tags?.has('right-tag')).toBe(true);
    expect(rightMessage.metadata?.tags?.has('left-tag')).toBe(false);
  });
});
