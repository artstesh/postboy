import {ScenarioBuilder} from '../../shared/builders/scenario.builder';
import {SubscriptionBuilder} from '../../shared/builders/subscription.builder';
import {MiddlewareFixture} from '../../shared/fixtures/middleware.fixture';
import {TestAssertions} from '../../shared/harness/assertions';
import {waitForValue} from '../../shared/utils/async';
import {TestMessage} from "../../shared/models/test-message";

describe('Integration.Middleware.Order', () => {
  let scenario: ScenarioBuilder;
  let message: TestMessage;

  beforeEach(() => {
    scenario = new ScenarioBuilder().useMessage().subjectRegistry();
    message = scenario.getMessage();
  })

  afterEach(() => {
    scenario.getWorld().dispose();
  })

  it('should call middleware in registration order before publish', async () => {
    const world = scenario.getWorld();

    const trace: string[] = [];

    scenario.useMiddleware()
      .active({
        onBefore: () => trace.push('first:before'),
      })
      .active({
        onBefore: () => trace.push('second:before'),
      })
      .active({
        onBefore: () => trace.push('third:before'),
      });

    const received: unknown[] = [];

    SubscriptionBuilder
      .forType(world, message.type)
      .collect(received)
      .subscribe();

    scenario.actions().fire(message);

    const value = await waitForValue(() => received[0], {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(value).toEqual(message);
    expect(trace).toEqual(['first:before', 'second:before', 'third:before']);
  });

  it('should call middleware after publish in registration order', async () => {
    const scenario = new ScenarioBuilder()
      .useMessage()
      .subjectRegistry();

    const world = scenario.getWorld();
    const actions = scenario.actions();
    const message = scenario.getMessage();

    const trace: string[] = [];

    scenario.useMiddleware()
      .active({
        onAfter: () => trace.push('first:after'),
      })
      .active({
        onAfter: () => trace.push('second:after'),
      });

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
    const world = scenario.getWorld();
    const trace: string[] = [];

    scenario.useMiddleware()
      .interrupting({
        onBefore: () => trace.push('first:before'),
      })
      .active({
        onBefore: () => trace.push('second:before'),
      });

    const received: unknown[] = [];

    SubscriptionBuilder
      .forType(world, message.type)
      .collect(received)
      .subscribe();

    TestAssertions.throws(() => scenario.actions().fire(message));

    expect(trace).toEqual(['first:before']);
    TestAssertions.notReceived(received);
  });
});
