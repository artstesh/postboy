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

    const value = await waitForValue(() => received[0], {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(value).toEqual(message);

    await waitFor(() => !!middleware._before && !!middleware._after, {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(middleware._before).toBeDefined();
    expect(middleware._after).toBeDefined();

    expect(middleware._before?.message.id).toBe(message.id);
    expect(middleware._after?.message.id).toBe(message.id);

    expect(middleware._before?.messageContext?.correlationId).toBe(message.id);
    expect(middleware._before?.messageContext?.currentMessageId).toBe(message.id);
    expect(middleware._before?.messageContext?.depth).toBe(0);

    expect(middleware._after?.messageContext?.correlationId).toBe(message.id);
    expect(middleware._after?.messageContext?.currentMessageId).toBe(message.id);
    expect(middleware._after?.messageContext?.depth).toBe(0);

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
    expect(middleware._before?.messageContext?.tags?.has('alpha')).toBe(true);
    expect(middleware._before?.messageContext?.tags?.has('beta')).toBe(true);
    expect(middleware._after?.messageContext?.tags?.has('alpha')).toBe(true);
    expect(middleware._after?.messageContext?.tags?.has('beta')).toBe(true);
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

    expect(leftMiddleware._before?.messageContext?.correlationId).toBe(leftMessage.id);
    expect(rightMiddleware._before?.messageContext?.correlationId).toBe(rightMessage.id);
    expect(leftMiddleware._before?.messageContext?.correlationId).not
      .toBe(rightMiddleware._before?.messageContext?.correlationId);
  });

  it('should keep startedAt stable across middleware phases', async () => {
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

    await waitForValue(() => received[0], {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(middleware._before?.messageContext?.startedAt).toBeInstanceOf(Date);
    expect(middleware._after?.messageContext?.startedAt).toBe(middleware._before?.messageContext?.startedAt);
  });

  it('should create nested context for a child fire inside the same world', async () => {
    const parentScenario = new ScenarioBuilder()
      .useMessage()
      .subjectRegistry();

    const world = parentScenario.getWorld();
    const parentActions = parentScenario.actions();
    const parentMessage = parentScenario.getMessage();

    const childScenario = new ScenarioBuilder(world)
      .useCallback()
      .subjectRegistry();

    const childActions = childScenario.actions();
    const childMessage = childScenario.getMessage();

    const parentMiddleware = new TestMiddleware([parentMessage.id]);
    const childMiddleware = new TestMiddleware([childMessage.id]);

    parentMiddleware._canHandle = true;
    childMiddleware._canHandle = true;

    parentMiddleware.before = ((context: PipelineContext) => {
      childActions.fire(childMessage);
      return parentMiddleware._decision;
    }) as any;

    world.trackMiddleware(parentMiddleware);
    world.trackMiddleware(childMiddleware);

    const received: unknown[] = [];

    SubscriptionBuilder
      .forType(world, childMessage.type)
      .collect(received)
      .subscribe();

    parentActions.fire(parentMessage);

    const value = await waitForValue(() => received[0]);
    let messageContext = childMiddleware._before?.messageContext;
    expect(value).toEqual(childMessage);
    expect(messageContext?.parentMessageId).toBe(parentMessage.id);
    expect(messageContext?.correlationId).toBe(parentMessage.id);
    expect(messageContext?.currentMessageId).toBe(childMessage.id);
  });
});
