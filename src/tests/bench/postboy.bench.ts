/**
 * Performance benchmarks for the message bus. Not part of the Jest suite.
 *
 * Run with: npm run bench
 */
import { Bench } from 'tinybench';
import { TestPostboy } from '../shared/models/test-postboy';
import { TestReg } from '../shared/models/test-registry';
import { TestMessage } from '../shared/models/test-message';
import { TestCallbackMessage } from '../shared/models/test-callback-message';
import { TestMiddleware } from '../shared/models/test-middleware';
import { AddMiddleware } from '../../messages/add-middleware.executor';
import { AddNamespace } from '../../messages/add-namespace.executor';
import { EliminateNamespace } from '../../messages/eliminate-namespace.executor';
import { PostboySubscription } from '../../models/postboy-subscription';
import { Subject } from 'rxjs';

const setup = () => {
  const postboy = new TestPostboy();
  new TestReg(postboy).recordSubject(TestMessage);
  new TestReg(postboy).recordSubject(TestCallbackMessage);
  return postboy;
};

const bench = new Bench({ time: 200, warmupIterations: 100 });

bench
  .add('fire: throughput with one subscriber', () => {
    const postboy = setup();
    const subscription = postboy.sub(TestMessage).subscribe(() => {});
    //
    for (let i = 0; i < 1000; i++) {
      postboy.fire(new TestMessage(`payload-${i}`));
    }
    //
    subscription.unsubscribe();
    postboy.dispose();
  })
  .add('fire: throughput with five subscribers', () => {
    const postboy = setup();
    const subscriptions = Array.from({ length: 5 }, () => postboy.sub(TestMessage).subscribe(() => {}));
    //
    for (let i = 0; i < 1000; i++) {
      postboy.fire(new TestMessage(`payload-${i}`));
    }
    //
    subscriptions.forEach((s) => s.unsubscribe());
    postboy.dispose();
  })
  .add('fire: with active middleware', () => {
    const postboy = setup();
    postboy.exec(new AddMiddleware(new TestMiddleware([TestMessage.ID])));
    const subscription = postboy.sub(TestMessage).subscribe(() => {});
    //
    for (let i = 0; i < 1000; i++) {
      postboy.fire(new TestMessage(`payload-${i}`));
    }
    //
    subscription.unsubscribe();
    postboy.dispose();
  })
  .add('callback: fire and finish round-trip', async () => {
    const postboy = setup();
    const subscription = postboy.fireCallback(new TestCallbackMessage('request')).subscribe(() => {});
    //
    subscription.unsubscribe();
    postboy.dispose();
  })
  .add('subscribe/unsubscribe: churn', () => {
    const postboy = setup();
    //
    for (let i = 0; i < 500; i++) {
      postboy
        .sub(TestMessage)
        .subscribe(() => {})
        .unsubscribe();
    }
    //
    postboy.dispose();
  })
  .add('namespace: add/eliminate churn', () => {
    const postboy = new TestPostboy();
    //
    for (let i = 0; i < 200; i++) {
      postboy.exec(new AddNamespace(`space-${i}`));
    }
    for (let i = 0; i < 200; i++) {
      postboy.exec(new EliminateNamespace(`space-${i}`));
    }
    //
    postboy.dispose();
  })
  .add('subscription: raw rxjs subject baseline', () => {
    const subject = new Subject<TestMessage>();
    const subscription = new PostboySubscription(subject, (s) => s.asObservable());
    const sub = subscription.sub().subscribe(() => {});
    //
    for (let i = 0; i < 1000; i++) {
      subscription.fire(new TestMessage(`payload-${i}`));
    }
    //
    sub.unsubscribe();
  });

const run = async () => {
  await bench.run();

  console.table(
    bench.tasks.map((task) => {
      const result = task.result as any;
      return {
        name: task.name,
        state: result?.state,
        'ops/sec': result?.throughput?.mean?.toFixed(0),
        'avg (ms)': result?.latency?.mean?.toFixed(4),
        p75: result?.latency?.p75?.toFixed(4),
      };
    }),
  );
};

void run();
