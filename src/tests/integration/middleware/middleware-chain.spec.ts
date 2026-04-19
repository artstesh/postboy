import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { SubscriptionBuilder } from '../../shared/builders/subscription.builder';
import { MiddlewareFixture } from '../../shared/fixtures/middleware.fixture';
import { TestAssertions } from '../../shared/harness/assertions';
import { waitFor, waitForValue } from '../../shared/utils/async';
import {TestExecutor} from "../../shared/models/test-executor";
import {TestMessage} from "../../shared/models/test-message";

describe('Integration.Middleware.Chain', () => {
  let scenario: ScenarioBuilder;
  let message: TestMessage;

  beforeEach(() => {
    scenario= new ScenarioBuilder().useMessage().subjectRegistry();
    message = scenario.getMessage();
  })

  afterEach(() => {
    scenario.getWorld().dispose();
  })

  it('should pass message through all active middleware and deliver to subscriber', async () => {
    const world = scenario.getWorld();
    const actions = scenario.actions();
    const message = scenario.getMessage();

    const trace: string[] = [];

    scenario.useMiddleware()
      .active({
        onBefore: () => trace.push('first:before'),
        onAfter: () => trace.push('first:after'),
      })
      .active({
        onBefore: () => trace.push('second:before'),
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
    expect(trace).toEqual([
      'first:before',
      'second:before',
      'first:after',
      'second:after',
    ]);
    TestAssertions.receivedOne(received, message);
  });

  it('should stop pipeline when middleware interrupts before publish', () => {

    const world = scenario.getWorld();
    const actions = scenario.actions();
    const message = scenario.getMessage();

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

    TestAssertions.throws(() => actions.fire(message));
    expect(trace).toEqual(['first:before']);
    TestAssertions.notReceived(received);
  });
});
