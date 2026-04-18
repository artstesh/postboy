import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { SubscriptionBuilder } from '../../shared/builders/subscription.builder';
import { TestAssertions } from '../../shared/harness/assertions';
import { flushMicrotasks, waitForValue } from '../../shared/utils/async';

describe('Integration.Namespaces.Isolation', () => {
  it('should isolate message delivery between two independent worlds', async () => {
    const left = new ScenarioBuilder()
      .message()
      .subjectRegistry();

    const right = new ScenarioBuilder()
      .message()
      .subjectRegistry();

    const leftWorld = left.getWorld();
    const rightWorld = right.getWorld();

    const leftMessage = left.getMessage();
    const rightMessage = right.getMessage();

    const leftReceived: unknown[] = [];
    const rightReceived: unknown[] = [];

    SubscriptionBuilder
      .forType(leftWorld, leftMessage.type)
      .collect(leftReceived)
      .subscribe();

    SubscriptionBuilder
      .forType(rightWorld, rightMessage.type)
      .collect(rightReceived)
      .subscribe();

    left.actions().fire(leftMessage);
    right.actions().fire(rightMessage);

    const leftValue = await waitForValue(() => leftReceived[0], {
      timeoutMs: 100,
      intervalMs: 5,
    });

    const rightValue = await waitForValue(() => rightReceived[0], {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(leftValue).toEqual(leftMessage);
    expect(rightValue).toEqual(rightMessage);

    TestAssertions.receivedOne(leftReceived, leftMessage);
    TestAssertions.receivedOne(rightReceived, rightMessage);
  });

  it('should not leak subscriptions from one world into another', async () => {
    const left = new ScenarioBuilder()
      .message()
      .subjectRegistry();

    const right = new ScenarioBuilder()
      .message()
      .subjectRegistry();

    const leftWorld = left.getWorld();
    const rightWorld = right.getWorld();

    const leftMessage = left.getMessage();
    const rightMessage = right.getMessage();

    const leftReceived: unknown[] = [];
    const rightReceived: unknown[] = [];

    SubscriptionBuilder
      .forType(leftWorld, leftMessage.type)
      .collect(leftReceived)
      .subscribe();

    SubscriptionBuilder
      .forType(rightWorld, rightMessage.type)
      .collect(rightReceived)
      .subscribe();

    left.actions().fire(leftMessage);
    await flushMicrotasks();

    TestAssertions.receivedOne(leftReceived, leftMessage);
    TestAssertions.notReceived(rightReceived);

    right.actions().fire(rightMessage);
    await flushMicrotasks();

    TestAssertions.receivedOne(rightReceived, rightMessage);
  });

  it('should keep replay state isolated between independent worlds', async () => {
    const left = new ScenarioBuilder()
      .message()
      .replayRegistry();

    const right = new ScenarioBuilder()
      .message()
      .replayRegistry();

    const leftWorld = left.getWorld();
    const rightWorld = right.getWorld();

    const leftMessage = left.getMessage();
    const rightMessage = right.getMessage();

    left.actions().fire(leftMessage);
    right.actions().fire(rightMessage);

    const leftReceived: unknown[] = [];
    const rightReceived: unknown[] = [];

    SubscriptionBuilder
      .forType(leftWorld, leftMessage.type)
      .collect(leftReceived)
      .subscribe();

    SubscriptionBuilder
      .forType(rightWorld, rightMessage.type)
      .collect(rightReceived)
      .subscribe();

    const leftValue = await waitForValue(() => leftReceived[0], {
      timeoutMs: 100,
      intervalMs: 5,
    });

    const rightValue = await waitForValue(() => rightReceived[0], {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(leftValue).toEqual(leftMessage);
    expect(rightValue).toEqual(rightMessage);
  });

  it('should dispose one world without affecting another', async () => {
    const left = new ScenarioBuilder()
      .message()
      .subjectRegistry();

    const right = new ScenarioBuilder()
      .message()
      .subjectRegistry();

    const leftWorld = left.getWorld();
    const rightWorld = right.getWorld();

    const leftMessage = left.getMessage();
    const rightMessage = right.getMessage();

    const leftReceived: unknown[] = [];
    const rightReceived: unknown[] = [];

    SubscriptionBuilder
      .forType(leftWorld, leftMessage.type)
      .collect(leftReceived)
      .subscribe();

    SubscriptionBuilder
      .forType(rightWorld, rightMessage.type)
      .collect(rightReceived)
      .subscribe();

    await leftWorld.dispose();

    right.actions().fire(rightMessage);
    await flushMicrotasks();

    TestAssertions.notReceived(leftReceived);
    TestAssertions.receivedOne(rightReceived, rightMessage);
  });
});
