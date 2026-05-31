import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { MiddlewareFixture } from '../../shared/fixtures/middleware.fixture';
import { TestAssertions } from '../../shared/harness/assertions';
import { waitFor, waitForValue } from '../../shared/utils/async';
import { TestExecutor } from '../../shared/models/test-executor';

describe('Integration.Executors.Lifecycle', () => {
  let scenario: ScenarioBuilder;
  let executor: TestExecutor<any>;

  beforeEach(() => {
    scenario= new ScenarioBuilder().useExecutor().handlerRegistry();
    executor = scenario.getMessage() as TestExecutor<any>;
  })

  afterEach(() => {
    scenario.getWorld().dispose();
  })

  it('should execute executor through the full lifecycle', async () => {
    const trace: string[] = [];

    scenario.useMiddleware()
      .active({
        onBefore: () => trace.push('before'),
        onAfter: () => trace.push('after'),
      });

    const result = scenario.actions().exec(executor);

    expect(result).toBeDefined();
    expect(trace).toEqual(['before', 'after']);
  });

  it('should allow executor lifecycle to be interrupted before completion', async () => {
    const trace: string[] = [];

    scenario.useMiddleware()
      .interrupting({
        onBefore: () => trace.push('before'),
      });

    TestAssertions.throws(() => scenario.actions().exec(executor));
    expect(trace).toEqual(['before']);
  });
});
