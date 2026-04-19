import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { SubscriptionBuilder } from '../../shared/builders/subscription.builder';
import { MiddlewareFixture } from '../../shared/fixtures/middleware.fixture';
import { TestAssertions } from '../../shared/harness/assertions';
import { flushMicrotasks, waitFor, waitForValue } from '../../shared/utils/async';
import {TestMessage} from "../../shared/models/test-message";

describe('Integration.Middleware.Dispose', () => {
  let scenario: ScenarioBuilder;
  let message: TestMessage;

  beforeEach(() => {
    scenario= new ScenarioBuilder()      .useMessage()      .subjectRegistry();
    message = scenario.getMessage();
  })

  afterEach(() => {
    scenario.getWorld().dispose();
  })
  it('should dispose middleware when world is disposed', async () => {
    const world = scenario.getWorld();
    const received: unknown[] = [];

    scenario.useMiddleware().active();


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
  });
});
