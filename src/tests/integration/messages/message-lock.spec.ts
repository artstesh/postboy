import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { SubscriptionBuilder } from '../../shared/builders/subscription.builder';
import { TestAssertions } from '../../shared/harness/assertions';
import { flushMicrotasks } from '../../shared/utils/async';
import { LockMessage } from '../../../messages/lock-message.executor';
import { UnlockMessage } from '../../../messages/unlock-message.executor';
import { TestMessage } from '../../shared/models/test-message';

describe('Integration.Messages.Lock', () => {
  it('should not deliver locked messages', async () => {
    const scenario = new ScenarioBuilder().useMessage().subjectRegistry();

    const world = scenario.getWorld();
    const actions = scenario.actions();
    const message = scenario.getMessage();
    const received: unknown[] = [];

    SubscriptionBuilder.forType(world, message.type).collect(received).subscribe();

    world.getPostboy().exec(new LockMessage(TestMessage));
    actions.fire(message);
    await flushMicrotasks();

    TestAssertions.notReceived(received);
  });

  it('should deliver messages again after unlock', async () => {
    const scenario = new ScenarioBuilder().useMessage().subjectRegistry();

    const world = scenario.getWorld();
    const postboy = world.getPostboy();
    const actions = scenario.actions();
    const message = scenario.getMessage();
    const received: unknown[] = [];

    SubscriptionBuilder.forType(world, message.type).collect(received).subscribe();

    postboy.exec(new LockMessage(TestMessage));
    postboy.exec(new UnlockMessage(TestMessage));
    actions.fire(message);
    await flushMicrotasks();

    TestAssertions.receivedOne(received, message);
  });

  it('should lock only the targeted message type', async () => {
    const lockedScenario = new ScenarioBuilder().useMessage().subjectRegistry();
    const activeScenario = new ScenarioBuilder().useMessage().subjectRegistry();

    lockedScenario.getWorld().getPostboy().exec(new LockMessage(TestMessage));

    const received: unknown[] = [];
    const activeMessage = activeScenario.getMessage();
    SubscriptionBuilder.forType(activeScenario.getWorld(), activeMessage.type).collect(received).subscribe();

    activeScenario.actions().fire(activeMessage);
    await flushMicrotasks();

    TestAssertions.receivedOne(received, activeMessage);
  });
});
