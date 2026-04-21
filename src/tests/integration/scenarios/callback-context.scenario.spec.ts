import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { TestAssertions } from '../../shared/harness/assertions';
import { waitFor } from '../../shared/utils/async';
import {Forger} from "@artstesh/forger";

describe('Integration.Scenarios.CallbackContext', () => {

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

    await waitFor(() => completed);

    expect(message.metadata?.tags?.has('alpha')).toBe(true);
    expect(message.metadata?.tags?.has('beta')).toBe(true);
    TestAssertions.completed(completed);
  });
});
