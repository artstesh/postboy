import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { SubscriptionBuilder } from '../../shared/builders/subscription.builder';
import { flushMicrotasks } from '../../shared/utils/async';
import { TestAssertions } from '../../shared/harness/assertions';
import { share, tap } from 'rxjs';

describe('Integration.Messages.Pipe', () => {
  it('should run piped side effect once for multiple subscribers when pipe shares the source', async () => {
    let count = 0;
    const scenario = new ScenarioBuilder().useMessage().withPipeRegistry((s) =>
      s.pipe(
        tap(() => count++),
        share(),
      ),
    );

    const world = scenario.getWorld();
    const message = scenario.getMessage();
    const received: unknown[] = [];

    SubscriptionBuilder.forType(world, message.type).collect(received).subscribe();
    SubscriptionBuilder.forType(world, message.type).collect(received).subscribe();
    scenario.actions().fire(message);
    await flushMicrotasks();

    TestAssertions.receivedCount(received, 2);
    TestAssertions.should.number(count).equals(1);
  });
});
