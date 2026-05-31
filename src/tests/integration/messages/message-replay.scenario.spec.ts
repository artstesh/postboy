import {ScenarioBuilder} from "../../shared/builders/scenario.builder";
import {SubscriptionBuilder} from "../../shared/builders/subscription.builder";
import {flushMicrotasks} from "../../shared/utils/async";
import {TestAssertions} from "../../shared/harness/assertions";
import {toArray} from "../../shared/utils/observables";
import {take} from "rxjs";

describe('#Integration.Scenarios.MessageReplay', () => {
  let scenario: ScenarioBuilder;

  beforeEach(() => {
    scenario = new ScenarioBuilder().useMessage().replayRegistry();
  });

  afterEach(() => {
    scenario.getWorld().dispose();
  });

  it('should replay the latest value to a late subscriber', async () => {
    const message = scenario.getMessage();
    const received: unknown[] = [];

    scenario.actions().fire(message);
    scenario.actions().fire(message);

    SubscriptionBuilder
      .forType(scenario.getWorld(), message.type)
      .collect(received)
      .subscribe();

    await flushMicrotasks();

    TestAssertions.receivedOne(received, message);
  });

  it('should emit already fired value through observable collection', async () => {
    const message = scenario.getMessage();

    scenario.actions().fire(message);

    const valuesPromise = toArray(scenario.getWorld().getPostboy().sub(message.type).pipe(take(1)));

    await expect(valuesPromise).resolves.toEqual([message]);
  });

  it('should keep replay behavior stable for multiple subscribers', async () => {
    const message = scenario.getMessage();

    scenario.actions().fire(message);

    const first: unknown[] = [];
    const second: unknown[] = [];

    SubscriptionBuilder
      .forType(scenario.getWorld(), message.type)
      .collect(first)
      .subscribe();

    SubscriptionBuilder
      .forType(scenario.getWorld(), message.type)
      .collect(second)
      .subscribe();

    await flushMicrotasks();

    TestAssertions.receivedOne(first, message);
    TestAssertions.receivedOne(second, message);
  });
});
