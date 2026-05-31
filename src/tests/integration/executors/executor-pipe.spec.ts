import {ScenarioBuilder} from '../../shared/builders/scenario.builder';
import {TestAssertions} from '../../shared/harness/assertions';
import {TestExecutor} from '../../shared/models/test-executor';

describe('Integration.Executors.Pipe', () => {
  let scenario: ScenarioBuilder;
  let executor: TestExecutor<any>;

  beforeEach(() => {
    scenario= new ScenarioBuilder().useExecutor().handlerRegistry();
    executor = scenario.getMessage() as TestExecutor<any>;
  })

  afterEach(() => {
    scenario.getWorld().dispose();
  })

  it('should pass executor through middleware pipe and return transformed result', async () => {
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

  it('should stop executor execution when middleware interrupts', async () => {
    const trace: string[] = [];

    scenario.useMiddleware()
      .interrupting({
        onBefore: () => trace.push('before')
      });

    TestAssertions.throws(() => scenario.actions().exec(executor));
    expect(trace).toEqual(['before']);
  });
});
