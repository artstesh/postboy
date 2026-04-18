import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { SubscriptionBuilder } from '../../shared/builders/subscription.builder';
import { MiddlewareFixture } from '../../shared/fixtures/middleware.fixture';
import { TestAssertions } from '../../shared/harness/assertions';
import { waitForValue } from '../../shared/utils/async';

describe('Integration.Middleware.Order', () => {
  it('should call middleware in registration order before publish', async () => {
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
      }),
    );

    world.trackMiddleware(
      MiddlewareFixture.active({
        onBefore: () => trace.push('second:before'),
      }),
    );

    world.trackMiddleware(
      MiddlewareFixture.active({
        onBefore: () => trace.push('third:before'),
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
    expect(trace).toEqual(['first:before', 'second:before', 'third:before']);
    TestAssertions.receivedOne(received, message);
  });

  it('should call middleware after publish in registration order', async () => {
    const scenario = new ScenarioBuilder()
      .message()
      .subjectRegistry();

    const world = scenario.getWorld();
    const actions = scenario.actions();
    const message = scenario.getMessage();

    const trace: string[] = [];

    world.trackMiddleware(
      MiddlewareFixture.active({
        onAfter: () => trace.push('first:after'),
      }),
    );

    world.trackMiddleware(
      MiddlewareFixture.active({
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
    expect(trace).toEqual(['first:after', 'second:after']);
  });

  it('should stop executing later middleware when one interrupts', () => {
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

  it('should keep before and after phases isolated per middleware', async () => {
    const scenario = new ScenarioBuilder()
      .message()
      .subjectRegistry();

    const world = scenario.getWorld();
    const actions = scenario.actions();
    const message = scenario.getMessage();

    const first = MiddlewareFixture.active();
    const second = MiddlewareFixture.active();

    world.trackMiddleware(first);
    world.trackMiddleware(second);

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
    expect(first._before).toBeDefined();
    expect(second._before).toBeDefined();
    expect(first._after).toBeDefined();
    expect(second._after).toBeDefined();
  });

  it('should preserve registration order across separate scenarios', async () => {
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
});
