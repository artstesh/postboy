import {waitFor} from "../../shared/utils/async";
import {ScenarioBuilder} from "../../shared/builders/scenario.builder";
import {TestAssertions} from "../../shared/harness/assertions";
import {Forger} from "@artstesh/forger";
import {MessageFixture} from "../../shared/fixtures/message.fixture";
import {CallbackMessageFixture} from "../../shared/fixtures/callback-message.fixture";

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

  it('should throw when fire not registered message', () => {
    TestAssertions.throws(() => {
      const scenario = new ScenarioBuilder().callbackMessage();
      TestAssertions.throws(() => scenario.actions().fireCallback(scenario.getMessage()));
    });
  });

  it('should throw when sub not registered message', () => {
    const scenario = new ScenarioBuilder().callbackMessage();
    TestAssertions.throws(() => {
      new ScenarioBuilder().actions().subscribe(scenario.getMessage());
    });
  });
});
