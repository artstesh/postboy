import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { SubscriptionBuilder } from '../../shared/builders/subscription.builder';
import { MiddlewareFixture } from '../../shared/fixtures/middleware.fixture';
import { TestAssertions } from '../../shared/harness/assertions';
import { flushMicrotasks, waitFor, waitForValue } from '../../shared/utils/async';

describe('Integration.Middleware.Dispose', () => {
  it('should dispose middleware when world is disposed', async () => {
    const scenario = new ScenarioBuilder()
      .message()
      .subjectRegistry();

    const world = scenario.getWorld();
    const actions = scenario.actions();
    const message = scenario.getMessage();

    const middleware = MiddlewareFixture.active();
    world.trackMiddleware(middleware);

    const received: unknown[] = [];

    SubscriptionBuilder
      .forType(world, message.type)
      .collect(received)
      .subscribe();

    actions.fire(message);

    const value = await waitForValue(() => received[0], {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(value).toEqual(message);

    await world.dispose();

    TestAssertions.completed(true);
  });

  it('should not deliver messages after world dispose', async () => {
    const scenario = new ScenarioBuilder()
      .message()
      .subjectRegistry();

    const world = scenario.getWorld();
    const actions = scenario.actions();
    const message = scenario.getMessage();

    world.trackMiddleware(MiddlewareFixture.active());

    const received: unknown[] = [];

    SubscriptionBuilder
      .forType(world, message.type)
      .collect(received)
      .subscribe();

    await world.dispose();

    actions.fire(message);
    await flushMicrotasks();

    TestAssertions.notReceived(received);
  });

  it('should keep dispose idempotent for middleware chain', async () => {
    const scenario = new ScenarioBuilder()
      .message()
      .subjectRegistry();

    const world = scenario.getWorld();

    MiddlewareFixture.chain(
      MiddlewareFixture.active(),
      MiddlewareFixture.active(),
    ).forEach((middleware) => world.trackMiddleware(middleware));

    await world.dispose();
    await world.dispose();

    TestAssertions.completed(true);
  });

  it('should not leak disposed middleware into another scenario', async () => {
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

    leftWorld.trackMiddleware(MiddlewareFixture.active());
    rightWorld.trackMiddleware(MiddlewareFixture.active());

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

    const rightValue = await waitForValue(() => rightReceived[0], {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(rightValue).toEqual(rightMessage);
    TestAssertions.notReceived(leftReceived);
  });

  it('should allow disposing interrupting middleware without breaking cleanup', async () => {
    const scenario = new ScenarioBuilder()
      .message()
      .subjectRegistry();

    const world = scenario.getWorld();
    const actions = scenario.actions();
    const message = scenario.getMessage();

    world.trackMiddleware(MiddlewareFixture.interrupting());

    const received: unknown[] = [];

    SubscriptionBuilder
      .forType(world, message.type)
      .collect(received)
      .subscribe();

    TestAssertions.throws(() => actions.fire(message));

    await world.dispose();
    await waitFor(() => true, { timeoutMs: 10, intervalMs: 1 });

    TestAssertions.notReceived(received);
  });
});
