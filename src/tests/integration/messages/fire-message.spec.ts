import { Subject, tap } from 'rxjs';
import { RegistryBuilder } from '../../shared/builders/registry.builder';
import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { TestAssertions } from '../../shared/harness/assertions';
import {PostboyMessage} from "../../../models/postboy.message";
import {MessageFixture} from "../../shared/fixtures/message.fixture";
import {SubscriptionBuilder} from "../../shared/builders/subscription.builder";
import {collectObservable} from "../../shared/utils/observables";
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
    const scenario = new ScenarioBuilder()
      .message();

    const world = scenario.getWorld();
    const message = scenario.getMessage();
    const trace: string[] = [];
    const source$ = new Subject<PostboyMessage>();

    world.createRegistry(
      new RegistryBuilder(world.getPostboy())
        .withPipe(message.type, source$, (s) =>
          s.pipe(
            tap(() => trace.push('pipe')),
          ),
        )
        .build(),
    );

    scenario.actions().subscribe(message.type, () => trace.push('subscriber'));
    scenario.actions().fire(message);

    TestAssertions.should().array(trace).equal(['pipe', 'subscriber']);
  });

  it('should throw when message is not registered', () => {
    TestAssertions.throws(() => {
      new ScenarioBuilder().actions().fire(MessageFixture.message());
    });
  });
});
