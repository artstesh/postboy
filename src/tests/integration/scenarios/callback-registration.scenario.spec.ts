import {ScenarioBuilder} from "../../shared/builders/scenario.builder";
import {MessageFixture} from "../../shared/fixtures/message.fixture";
import {Subject} from "rxjs";
import {SubscriptionBuilder} from "../../shared/builders/subscription.builder";
import {TestMessage} from "../../shared/models/test-message";
import {waitFor} from "../../shared/utils/async";
import {TestAssertions} from "../../shared/harness/assertions";
import {AddNamespace, ConnectMessage} from "../../../messages";
import {Forger} from "@artstesh/forger";
import {TestCallbackMessage} from "../../shared/models/test-callback-message";

describe('#Integration.Scenarios.CallbackRegistration', () => {
  let scenario: ScenarioBuilder;

  beforeEach(() => {
    scenario = new ScenarioBuilder();
  });

  afterEach(() => {
    scenario.getWorld().dispose();
  });

  it('registration of message with Postboy success', async () => {
    const message = MessageFixture.callbackMessage();
    scenario.getWorld().getPostboy().exec(new ConnectMessage(message.type, new Subject()));
    const list: TestCallbackMessage[] = [];
    SubscriptionBuilder.forType(scenario.getWorld(), message.type).asSub().collect(list).subscribe();
    //
    scenario.actions().fireCallback(message);
    await waitFor(() => list.length > 0, {timeoutMs: 100, intervalMs: 5});
    //
    TestAssertions.should.array(list).equal([message]);
  });

  it('registration of message with namespace success', async () => {
    const message = MessageFixture.callbackMessage();
    scenario.getWorld().getPostboy().exec(new AddNamespace(Forger.create<string>()!))
      .recordSubject(message.type);
    const list: TestCallbackMessage[] = [];
    SubscriptionBuilder.forType(scenario.getWorld(), message.type).asSub().collect(list).subscribe();
    //
    scenario.actions().fireCallback(message);
    await waitFor(() => list.length > 0, {timeoutMs: 20, intervalMs: 2});
    //
    TestAssertions.should.array(list).equal([message]);
  });

  it('registration of message with registrator success', async () => {
    scenario.useCallback().subjectRegistry();
    const message = scenario.getMessage();
    const list: TestCallbackMessage[] = [];
    SubscriptionBuilder.forType(scenario.getWorld(), message.type).asSub().collect(list).subscribe();
    //
    scenario.actions().fireCallback(message);
    await waitFor(() => list.length > 0, {timeoutMs: 20, intervalMs: 2});
    //
    TestAssertions.should.array(list).equal([message]);
  });
});
