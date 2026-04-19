import {ScenarioBuilder} from '../../shared/builders/scenario.builder';
import {MiddlewareFixture} from '../../shared/fixtures/middleware.fixture';
import {TestAssertions} from '../../shared/harness/assertions';
import {waitFor, waitForValue} from '../../shared/utils/async';
import {TestExecutor} from '../../shared/models/test-executor';

describe('Integration.Executors.ErrorHandling', () => {
  it('should route executor errors to middleware onError', async () => {
    const scenario = new ScenarioBuilder().useExecutor().handlerRegistry();
    scenario.getWorld().get('handler')?.throwOnHandle(true);
    const trace: string[] = [];

    scenario.useMiddleware()
      .active({
        onBefore: () => trace.push('before'),
        onError: () => trace.push('error'),
      });

    TestAssertions.throws(() => scenario.actions().exec());
    await waitFor(() => trace.includes('error'), {timeoutMs: 15, intervalMs: 1,});
    TestAssertions.should.array(trace).equal(['before', 'error']);
  });

  it('should not call onError when executor completes successfully', async () => {
    const scenario = new ScenarioBuilder().useExecutor().handlerRegistry();
    const trace: string[] = [];

    scenario.useMiddleware()
      .active({
        onBefore: () => trace.push('before'),
        onAfter: () => trace.push('after'),
        onError: () => trace.push('error'),
      });
    const result = scenario.actions().exec();

    await waitFor(() => trace.length === 2, {
      timeoutMs: 15,
      intervalMs: 1,
    });

    expect(result).toBeDefined();
    TestAssertions.should.array(trace).equal(['before', 'after']);
  });

  it('should allow middleware throwing during before to be handled as error', async () => {
    const scenario = new ScenarioBuilder().useExecutor().handlerRegistry();
    scenario.getWorld().get('handler')?.throwOnHandle(true);
    const trace: string[] = [];
    scenario.useMiddleware()
      .active({
        onBefore: () => trace.push('before'),
        onAfter: () => trace.push('after'),
        onError: () => trace.push('error'),
      });

    TestAssertions.throws(() => scenario.actions().exec());
    await waitFor(() => trace.includes('error'), {
      timeoutMs: 15,
      intervalMs: 1,
    });
    TestAssertions.should.array(trace).equal(['before', 'error']);
  });
});
