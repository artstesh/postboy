import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { SubscriptionBuilder } from '../../shared/builders/subscription.builder';
import { TestAssertions } from '../../shared/harness/assertions';
import { MiddlewareFixture } from '../../shared/fixtures/middleware.fixture';

describe('Integration.Scenarios.PostboyDisposal', () => {
  it('should close all subscriptions and dispose middleware when the service is disposed', () => {
    const scenario = new ScenarioBuilder().useMessage().subjectRegistry();

    const world = scenario.getWorld();
    const message = scenario.getMessage();
    const middleware = MiddlewareFixture.active([message.id]);
    world.trackMiddleware(middleware);

    const sub = SubscriptionBuilder.forType(world, message.type).subscribe();

    world.getPostboy().dispose();

    TestAssertions.subscriptionClosed(sub);
    expect(middleware._disposed).toBe(true);
  });

  it('should tolerate being disposed more than once', () => {
    const scenario = new ScenarioBuilder().useMessage().subjectRegistry();

    const postboy = scenario.getWorld().getPostboy();

    expect(() => {
      postboy.dispose();
      postboy.dispose();
    }).not.toThrow();
  });
});
