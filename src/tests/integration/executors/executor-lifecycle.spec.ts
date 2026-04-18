import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { MiddlewareFixture } from '../../shared/fixtures/middleware.fixture';
import { TestAssertions } from '../../shared/harness/assertions';
import { waitFor, waitForValue } from '../../shared/utils/async';
import { TestExecutor } from '../../shared/models/test-executor';

describe('Integration.Executors.Lifecycle', () => {
  it('should execute executor through the full lifecycle', async () => {
    const scenario = new ScenarioBuilder();

    const world = scenario.getWorld();
    const postboy = world.getPostboy();

    const trace: string[] = [];
    const executor = new TestExecutor('payload');

    world.trackMiddleware(
      MiddlewareFixture.active({
        onBefore: () => trace.push('before'),
        onAfter: () => trace.push('after'),
      }),
    );

    const result = await postboy.exec(executor);

    await waitFor(() => trace.length === 2, {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(result).toBeDefined();
    expect(trace).toEqual(['before', 'after']);
  });

  it('should preserve executor lifecycle state during execution', async () => {
    const scenario = new ScenarioBuilder();

    const world = scenario.getWorld();
    const postboy = world.getPostboy();
    const executor = new TestExecutor('payload');

    world.trackMiddleware(MiddlewareFixture.active());

    await postboy.exec(executor);

    const completed = await waitForValue(() => executor._completed, {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(completed).toBe(true);
  });

  it('should not leak executor state between scenarios', async () => {
    const left = new ScenarioBuilder();
    const right = new ScenarioBuilder();

    const leftWorld = left.getWorld();
    const rightWorld = right.getWorld();

    const leftTrace: string[] = [];
    const rightTrace: string[] = [];

    leftWorld.trackMiddleware(
      MiddlewareFixture.active({
        onBefore: () => leftTrace.push('left:before'),
        onAfter: () => leftTrace.push('left:after'),
      }),
    );

    rightWorld.trackMiddleware(
      MiddlewareFixture.active({
        onBefore: () => rightTrace.push('right:before'),
        onAfter: () => rightTrace.push('right:after'),
      }),
    );

    const leftExecutor = new TestExecutor('left');
    const rightExecutor = new TestExecutor('right');

    await leftWorld.getPostboy().exec(leftExecutor);
    await rightWorld.getPostboy().exec(rightExecutor);

    expect(leftTrace).toEqual(['left:before', 'left:after']);
    expect(rightTrace).toEqual(['right:before', 'right:after']);
  });

  it('should allow executor lifecycle to be interrupted before completion', async () => {
    const scenario = new ScenarioBuilder();

    const world = scenario.getWorld();
    const postboy = world.getPostboy();
    const trace: string[] = [];

    world.trackMiddleware(
      MiddlewareFixture.interrupting({
        onBefore: () => trace.push('before'),
      }),
    );

    const executor = new TestExecutor('payload');

    TestAssertions.throws(() => postboy.exec(executor));
    expect(trace).toEqual(['before']);
  });

  it('should dispose world cleanly after executor lifecycle', async () => {
    const scenario = new ScenarioBuilder();

    const world = scenario.getWorld();
    const postboy = world.getPostboy();

    const middleware = MiddlewareFixture.active();
    world.trackMiddleware(middleware);

    const executor = new TestExecutor('payload');

    await postboy.exec(executor);
    await world.dispose();

    TestAssertions.completed(true);
    await waitFor(() => true, { timeoutMs: 10, intervalMs: 1 });
  });
});
