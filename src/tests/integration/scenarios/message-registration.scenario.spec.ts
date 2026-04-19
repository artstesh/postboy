import {ScenarioBuilder} from "../../shared/builders/scenario.builder";
import {ConnectMessage} from "../../../messages/connect.message.executor";
import {MessageFixture} from "../../shared/fixtures/message.fixture";
import {Subject} from "rxjs";
import {SubscriptionBuilder} from "../../shared/builders/subscription.builder";
import {TestMessage} from "../../shared/models/test-message";
import {waitFor, waitForValue} from "../../shared/utils/async";
import {TestAssertions} from "../../shared/harness/assertions";
import {AddNamespace} from "../../../messages";
import {Forger} from "@artstesh/forger";

describe('Integration.Scenarios.MessageRegistration', () => {
  let scenario: ScenarioBuilder;

  beforeEach(() => {
    scenario = new ScenarioBuilder();
  });

  afterEach(() => {
    scenario.getWorld().dispose();
  });

  it('registration of message with Postboy success', async () => {
    const message = MessageFixture.message();
    scenario.getWorld().getPostboy().exec(new ConnectMessage(message.type, new Subject()));
    const list: TestMessage[] = [];
    SubscriptionBuilder.forType(scenario.getWorld(), message.type).asSub().collect(list).subscribe();
    //
    scenario.actions().fire(message);
    await waitFor(() => list.length > 0, {timeoutMs: 100, intervalMs: 5});
    //
    TestAssertions.should.array(list).equal([message]);
  });

  it('registration of message with namespace success', async () => {
    const message = MessageFixture.message();
    scenario.getWorld().getPostboy().exec(new AddNamespace(Forger.create<string>()!))
      .recordSubject(message.type);
    const list: TestMessage[] = [];
    SubscriptionBuilder.forType(scenario.getWorld(), message.type).asSub().collect(list).subscribe();
    //
    scenario.actions().fire(message);
    await waitFor(() => list.length > 0, {timeoutMs: 20, intervalMs: 2});
    //
    TestAssertions.should.array(list).equal([message]);
  });

  it('registration of message with registrator success', async () => {
    scenario.useMessage().subjectRegistry();
    const message = scenario.getMessage();
    const list: TestMessage[] = [];
    SubscriptionBuilder.forType(scenario.getWorld(), message.type).asSub().collect(list).subscribe();
    //
    scenario.actions().fire(message);
    await waitFor(() => list.length > 0, {timeoutMs: 20, intervalMs: 2});
    //
    TestAssertions.should.array(list).equal([message]);
  });
});
