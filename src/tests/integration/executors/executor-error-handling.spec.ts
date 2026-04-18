import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { MiddlewareFixture } from '../../shared/fixtures/middleware.fixture';
import { TestAssertions } from '../../shared/harness/assertions';
import { waitFor, waitForValue } from '../../shared/utils/async';
import { TestExecutor } from '../../shared/models/test-executor';

describe('Integration.Executors.ErrorHandling', () => {
  it('should route executor errors to middleware onError', async () => {
    const scenario = new ScenarioBuilder();

    const world = scenario.getWorld();
    const postboy = world.getPostboy();
    const trace: string[] = [];

    world.trackMiddleware(
      MiddlewareFixture.active({
        onBefore: () => trace.push('before'),
        onError: () => trace.push('error'),
      }),
    );

    const executor = new TestExecutor('payload');
    executor._throw = true;

    TestAssertions.throws(() => postboy.exec(executor));

    await waitFor(() => trace.includes('error'), {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(trace).toEqual(['before', 'error']);
  });

  it('should keep executor error handling isolated between scenarios', async () => {
    const left = new ScenarioBuilder();
    const right = new ScenarioBuilder();

    const leftWorld = left.getWorld();
    const rightWorld = right.getWorld();

    const leftTrace: string[] = [];
    const rightTrace: string[] = [];

    leftWorld.trackMiddleware(
      MiddlewareFixture.active({
        onBefore: () => leftTrace.push('left:before'),
        onError: () => leftTrace.push('left:error'),
      }),
    );

    rightWorld.trackMiddleware(
      MiddlewareFixture.active({
        onBefore: () => rightTrace.push('right:before'),
        onError: () => rightTrace.push('right:error'),
      }),
    );

    const leftExecutor = new TestExecutor('left');
    leftExecutor._throw = true;

    const rightExecutor = new TestExecutor('right');
    rightExecutor._throw = true;

    TestAssertions.throws(() => leftWorld.getPostboy().exec(leftExecutor));
    TestAssertions.throws(() => rightWorld.getPostboy().exec(rightExecutor));

    await waitForValue(() => leftTrace.length, {
      timeoutMs: 100,
      intervalMs: 5,
    });

    await waitForValue(() => rightTrace.length, {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(leftTrace).toEqual(['left:before', 'left:error']);
    expect(rightTrace).toEqual(['right:before', 'right:error']);
  });

  it('should not call onError when executor completes successfully', async () => {
    const scenario = new ScenarioBuilder();

    const world = scenario.getWorld();
    const postboy = world.getPostboy();
    const trace: string[] = [];

    world.trackMiddleware(
      MiddlewareFixture.active({
        onBefore: () => trace.push('before'),
        onAfter: () => trace.push('after'),
        onError: () => trace.push('error'),
      }),
    );

    const executor = new TestExecutor('payload');

    const result = await postboy.exec(executor);

    await waitFor(() => trace.length === 2, {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(result).toBeDefined();
    expect(trace).toEqual(['before', 'after']);
  });

  it('should allow middleware throwing during before to be handled as error', async () => {
    const scenario = new ScenarioBuilder();

    const world = scenario.getWorld();
    const postboy = world.getPostboy();
    const trace: string[] = [];

    world.trackMiddleware(
      MiddlewareFixture.throwing({
        onBefore: () => trace.push('before'),
        onError: () => trace.push('error'),
      }),
    );

    const executor = new TestExecutor('payload');

    TestAssertions.throws(() => postboy.exec(executor));

    await waitFor(() => trace.includes('error'), {
      timeoutMs: 100,
      intervalMs: 5,
    });

    expect(trace).toEqual(['before', 'error']);
  });

  it('should dispose world cleanly after executor error scenario', async () => {
    const scenario = new ScenarioBuilder();

    const world = scenario.getWorld();
    const postboy = world.getPostboy();

    const middleware = MiddlewareFixture.active();
    world.trackMiddleware(middleware);

    const executor = new TestExecutor('payload');
    executor._throw = true;

    TestAssertions.throws(() => postboy.exec(executor));

    await world.dispose();

    TestAssertions.completed(true);
  });
});
