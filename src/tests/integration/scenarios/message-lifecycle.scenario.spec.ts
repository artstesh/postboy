import {ScenarioBuilder} from '../../shared/builders/scenario.builder';
import {SubscriptionBuilder} from '../../shared/builders/subscription.builder';
import {TestAssertions} from '../../shared/harness/assertions';
import {waitFor, waitForValue} from '../../shared/utils/async';
import {TestMessage} from "../../shared/models/test-message";

describe('Integration.Scenarios.GenericMessageLifecycle', () => {
  it('should register, fire and deliver message through the full lifecycle', async () => {
    const scenario = new ScenarioBuilder().useMessage().subjectRegistry();
    const message = scenario.getMessage();
    const received: TestMessage[] = [];
    SubscriptionBuilder.forType(scenario.getWorld(), message.type).collect(received).subscribe();
    //
    scenario.actions().fire(message);
    const value = await waitForValue(() => received[0]);
    //
    TestAssertions.should.string(value.value).equals(message.value);
    TestAssertions.should.array(received).length(1);
  });

  it('should keep message available for multiple subscribers during lifecycle', async () => {
    const scenario = new ScenarioBuilder().useMessage().subjectRegistry();
    const message = scenario.getMessage();
    const received: TestMessage[] = [];
    SubscriptionBuilder.forType(scenario.getWorld(), message.type).collect(received).subscribe();
    SubscriptionBuilder.forType(scenario.getWorld(), message.type).collect(received).subscribe();
    //
    scenario.actions().fire(message);
    await waitFor(() => received.length > 1);
    //
    TestAssertions.should.array(received).equal([message, message]);
  });

  it('should allow once subscription to complete after first delivery', async () => {
    const scenario = new ScenarioBuilder().useMessage().subjectRegistry();
    const msg = scenario.getMessage();
    const received: TestMessage[] = [];
    const sub = SubscriptionBuilder.forType(scenario.getWorld(), msg.type).asOnce().collect(received).subscribe();
    //
    scenario.actions().fire(msg);
    await waitForValue(() => received[0]);
    //
    TestAssertions.subscriptionClosed(sub);
  });

  it('should preserve replay semantics across lifecycle steps', async () => {
    const scenario = new ScenarioBuilder().useMessage().replayRegistry();
    const world = scenario.getWorld();
    const message = scenario.getMessage();
    const received: unknown[] = [];
    //
    scenario.actions().fire(message);
    SubscriptionBuilder.forType(world, message.type).collect(received).subscribe();
    await waitForValue(() => received[0]);
    //
    TestAssertions.should.array(received).equal([message]);
  });
});
