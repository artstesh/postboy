import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { SubscriptionBuilder } from '../../shared/builders/subscription.builder';
import { TestAssertions } from '../../shared/harness/assertions';
import { waitFor, waitForValue } from '../../shared/utils/async';
import { TestMiddleware } from '../../shared/models/test-middleware';
import {PipelineContext} from "../../../models/pipeline-context";

describe('Integration.Scenarios.MiddlewareContext', () => {
  it('should pass filled context to middleware before and after publish', async () => {
    const scenario = new ScenarioBuilder()
      .useMessage()
      .subjectRegistry();

    const world = scenario.getWorld();
    const actions = scenario.actions();
    const message = scenario.getMessage();

    const middleware = new TestMiddleware([message.id]);
    middleware._canHandle = true;

    world.trackMiddleware(middleware);

    const received: unknown[] = [];

    SubscriptionBuilder
      .forType(world, message.type)
      .collect(received)
      .subscribe();

    actions.fire(message);

    const value = await waitForValue(() => received[0]);

    expect(value).toEqual(message);

    await waitFor(() => !!middleware._before && !!middleware._after);

    expect(middleware._before).toBeDefined();
    expect(middleware._after).toBeDefined();

    expect(middleware._before?.message.id).toBe(message.id);
    expect(middleware._after?.message.id).toBe(message.id);

    TestAssertions.receivedOne(received, message);
  });

  it('should preserve tags in middleware context', async () => {
    const scenario = new ScenarioBuilder()
      .useMessage()
      .subjectRegistry();

    const world = scenario.getWorld();
    const actions = scenario.actions();
    const message = scenario.getMessage();

    message.setMetadata({
      tags: new Set(['alpha', 'beta']),
    });

    const middleware = new TestMiddleware([message.id]);
    middleware._canHandle = true;

    world.trackMiddleware(middleware);

    actions.fire(message);

    await waitFor(() => !!middleware._before);
    expect(middleware._before?.message?.metadata?.tags?.has('alpha')).toBe(true);
    expect(middleware._after?.message?.metadata?.tags?.has('beta')).toBe(true);
  });

  it('should keep middleware context isolated between separate scenarios', async () => {
    const left = new ScenarioBuilder()
      .useMessage()
      .subjectRegistry();

    const right = new ScenarioBuilder()
      .useCallback()
      .subjectRegistry();

    const leftWorld = left.getWorld();
    const rightWorld = right.getWorld();

    const leftMessage = left.getMessage();
    const rightMessage = right.getMessage();

    const leftMiddleware = new TestMiddleware([leftMessage.id]);
    const rightMiddleware = new TestMiddleware([rightMessage.id]);

    leftMiddleware._canHandle = true;
    rightMiddleware._canHandle = true;

    leftWorld.trackMiddleware(leftMiddleware);
    rightWorld.trackMiddleware(rightMiddleware);

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

    const leftValue = await waitForValue(() => leftReceived[0]);

    const rightValue = await waitForValue(() => rightReceived[0]);

    expect(leftValue).toEqual(leftMessage);
    expect(rightValue).toEqual(rightMessage);

    expect(leftMiddleware._before?.message.id).toBe(leftMessage.id);
    expect(rightMiddleware._before?.message.id).toBe(rightMessage.id);
  });
});
