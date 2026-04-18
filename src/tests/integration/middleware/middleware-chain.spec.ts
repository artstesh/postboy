import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { SubscriptionBuilder } from '../../shared/builders/subscription.builder';
import { MiddlewareFixture } from '../../shared/fixtures/middleware.fixture';
import { TestAssertions } from '../../shared/harness/assertions';
import { waitFor, waitForValue } from '../../shared/utils/async';

describe('Integration.Middleware.Chain', () => {
  it('should pass message through all active middleware and deliver to subscriber', async () => {
    const scenario = new ScenarioBuilder()
      .message()
      .subjectRegistry();

    const world = scenario.getWorld();
    const actions = scenario.actions();
    const message = scenario.getMessage();

    const trace: string[] = [];

    world.trackMiddleware(
      MiddlewareFixture.active({
        onBefore: () => trace.push('first:before'),
        onAfter: () => trace.push('first:after'),
      }),
    );

    world.trackMiddleware(
      MiddlewareFixture.active({
        onBefore: () => trace.push('second:before'),
        onAfter: () => trace.push('second:after'),
      }),
    );

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
    expect(trace).toEqual([
      'first:before',
      'second:before',
      'first:after',
      'second:after',
    ]);
    TestAssertions.receivedOne(received, message);
  });

  it('should stop pipeline when middleware interrupts before publish', () => {
    const scenario = new ScenarioBuilder()
      .message()
      .subjectRegistry();

    const world = scenario.getWorld();
    const actions = scenario.actions();
    const message = scenario.getMessage();

    const trace: string[] = [];

    world.trackMiddleware(
      MiddlewareFixture.interrupting({
        onBefore: () => trace.push('first:before'),
      }),
    );

    world.trackMiddleware(
      MiddlewareFixture.active({
        onBefore: () => trace.push('second:before'),
      }),
    );

    const received: unknown[] = [];

    SubscriptionBuilder
      .forType(world, message.type)
      .collect(received)
      .subscribe();

    TestAssertions.throws(() => actions.fire(message));
    expect(trace).toEqual(['first:before']);
    TestAssertions.notReceived(received);
  });

  it('should keep middleware state isolated between scenarios', async () => {
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

    const leftTrace: string[] = [];
    const rightTrace: string[] = [];

    leftWorld.trackMiddleware(
      MiddlewareFixture.active({
        onBefore: () => leftTrace.push('left:before'),
      }),
    );

    rightWorld.trackMiddleware(
      MiddlewareFixture.active({
        onBefore: () => rightTrace.push('right:before'),
      }),
    );

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
    expect(leftTrace).toEqual(['left:before']);
    expect(rightTrace).toEqual(['right:before']);
  });

  it('should allow middleware chain helper to compose multiple middlewares', () => {
    const chain = MiddlewareFixture.chain(
      MiddlewareFixture.active(),
      MiddlewareFixture.active(),
      MiddlewareFixture.active(),
    );

    expect(chain).toHaveLength(3);
  });
});
