import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { SubscriptionBuilder } from '../../shared/builders/subscription.builder';
import { TestAssertions } from '../../shared/harness/assertions';
import { MiddlewareFixture } from '../../shared/fixtures/middleware.fixture';
import { flushMicrotasks } from '../../shared/utils/async';
import { RemoveMiddleware } from '../../../messages/remove-middleware.executor';

describe('Integration.Middleware.Removal', () => {
  it('should stop observing messages after the middleware is removed at runtime', async () => {
    const scenario = new ScenarioBuilder().useMessage().subjectRegistry();

    const world = scenario.getWorld();
    const actions = scenario.actions();
    const message = scenario.getMessage();

    let beforeCount = 0;
    const middleware = MiddlewareFixture.active([message.id], {
      onBefore: () => beforeCount++,
    });
    world.trackMiddleware(middleware);

    const received: unknown[] = [];
    SubscriptionBuilder.forType(world, message.type).collect(received).subscribe();

    actions.fire(message);
    await flushMicrotasks();

    world.getPostboy().exec(new RemoveMiddleware(middleware));

    actions.fire(message);
    await flushMicrotasks();

    TestAssertions.receivedCount(received, 2);
    expect(beforeCount).toBe(1);
    expect(middleware._disposed).toBe(true);
  });

  it('should keep other middleware working after one is removed', async () => {
    const scenario = new ScenarioBuilder().useMessage().subjectRegistry();

    const world = scenario.getWorld();
    const actions = scenario.actions();
    const message = scenario.getMessage();

    let keptCount = 0;
    const removed = MiddlewareFixture.active([message.id]);
    const kept = MiddlewareFixture.active([message.id], { onBefore: () => keptCount++ });
    world.trackMiddleware(removed);
    world.trackMiddleware(kept);

    world.getPostboy().exec(new RemoveMiddleware(removed));

    actions.fire(message);
    await flushMicrotasks();

    expect(keptCount).toBe(1);
  });
});
