import {waitFor} from "../../shared/utils/async";
import {ScenarioBuilder} from "../../shared/builders/scenario.builder";
import {TestAssertions} from "../../shared/harness/assertions";
import {Forger} from "@artstesh/forger";

describe('Integration.Messages.Callback', () => {
  it('should complete callback message', async () => {
    const scenario = new ScenarioBuilder().callbackMessage().subjectRegistry();
    const expected = Forger.create<string>()!;
    let result = '';
    //
    scenario.actions().fireCallback(scenario.getMessage(), res => result = res);
    scenario.getMessage().finish(expected);
    //
    await waitFor(() => !!result, { timeoutMs: 15, intervalMs: 1 });
    TestAssertions.should().string(result).equals(expected);
  });
});
