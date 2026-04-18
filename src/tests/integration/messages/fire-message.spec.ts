import {Subject, tap} from 'rxjs';
import {RegistryBuilder} from '../../shared/builders/registry.builder';
import {ScenarioBuilder} from '../../shared/builders/scenario.builder';
import {TestAssertions} from '../../shared/harness/assertions';
import {PostboyMessage} from "../../../models/postboy.message";
import {SubscriptionBuilder} from "../../shared/builders/subscription.builder";
import {TestMessage} from "../../shared/models/test-message";

describe('Integration.Messages.FireMessage', () => {
  it('should deliver fired message to subscriber', () => {
    const scenario = new ScenarioBuilder()
      .message()
      .subjectRegistry();

    const message = scenario.getMessage();
    const received: TestMessage[] = [];
    const subscription = SubscriptionBuilder.forType(scenario.getWorld(), message.type)
      .collect(received)
      .subscribe();
    //
    scenario.actions().fire(message);
    //
    subscription.unsubscribe();
    TestAssertions.receivedOne(received, message);
  });

  it('should support pipe-based processing before delivery', () => {
    const trace: string[] = [];
    const scenario = new ScenarioBuilder()
      .message().withPipeRegistry((s) =>
        s.pipe(tap(() => trace.push('pipe'))));

    const message = scenario.getMessage();

    scenario.actions().subscribe(message.type, () => trace.push('subscriber'));
    scenario.actions().fire(message);

    TestAssertions.should().array(trace).equal(['pipe', 'subscriber']);
  });

  it('should throw when fire not registered message', () => {
    const scenario = new ScenarioBuilder().message();
    TestAssertions.throws(() => {
      new ScenarioBuilder().actions().fire(scenario.getMessage());
    });
  });

  it('should throw when sub not registered message', () => {
    const scenario = new ScenarioBuilder().message();
    TestAssertions.throws(() => {
      new ScenarioBuilder().actions().subscribe(scenario.getMessage());
    });
  });
});
