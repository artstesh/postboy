/**
 * Stress specs: correctness of the bus under heavy load.
 * Kept in a separate Jest project (`npm run test:stress`) with longer timeouts.
 */
import { TestPostboy } from '../shared/models/test-postboy';
import { TestReg } from '../shared/models/test-registry';
import { TestMessage } from '../shared/models/test-message';
import { TestMiddleware } from '../shared/models/test-middleware';
import { AddMiddleware } from '../../messages/add-middleware.executor';
import { AddNamespace } from '../../messages/add-namespace.executor';
import { EliminateNamespace } from '../../messages/eliminate-namespace.executor';

jest.setTimeout(60000);

const MESSAGES = 10000;

describe('Stress.Postboy', () => {
  it('should deliver all messages in order to a single subscriber', () => {
    const postboy = new TestPostboy();
    new TestReg(postboy).recordSubject(TestMessage);
    const received: string[] = [];
    postboy.sub(TestMessage).subscribe((m: TestMessage) => received.push(m.value));
    //
    for (let i = 0; i < MESSAGES; i++) {
      postboy.fire(new TestMessage(`#${i}`));
    }
    //
    expect(received).toHaveLength(MESSAGES);
    expect(received[0]).toBe('#0');
    expect(received[MESSAGES - 1]).toBe(`#${MESSAGES - 1}`);
    postboy.dispose();
  });

  it('should deliver all messages to many subscribers without loss', () => {
    const postboy = new TestPostboy();
    new TestReg(postboy).recordSubject(TestMessage);
    const subscribers = 20;
    const received: string[][] = Array.from({ length: subscribers }, () => []);
    for (let s = 0; s < subscribers; s++) {
      postboy.sub(TestMessage).subscribe((m: TestMessage) => received[s].push(m.value));
    }
    //
    for (let i = 0; i < MESSAGES / 10; i++) {
      postboy.fire(new TestMessage(`#${i}`));
    }
    //
    for (const bucket of received) {
      expect(bucket).toHaveLength(MESSAGES / 10);
    }
    postboy.dispose();
  });

  it('should stay correct with middleware in the pipeline', () => {
    const postboy = new TestPostboy();
    new TestReg(postboy).recordSubject(TestMessage);
    postboy.exec(new AddMiddleware(new TestMiddleware([TestMessage.ID])));
    const received: string[] = [];
    postboy.sub(TestMessage).subscribe((m: TestMessage) => received.push(m.value));
    //
    for (let i = 0; i < MESSAGES / 10; i++) {
      postboy.fire(new TestMessage(`#${i}`));
    }
    //
    expect(received).toHaveLength(MESSAGES / 10);
    expect(received.every((value, index) => value === `#${index}`)).toBe(true);
    postboy.dispose();
  });

  it('should not grow subscriptions after unsubscribe churn', () => {
    const postboy = new TestPostboy();
    new TestReg(postboy).recordSubject(TestMessage);
    const received: string[] = [];
    const persistent = postboy.sub(TestMessage).subscribe((m: TestMessage) => received.push(m.value));
    //
    for (let i = 0; i < 2000; i++) {
      const subscription = postboy.sub(TestMessage).subscribe((m: TestMessage) => received.push(m.value));
      subscription.unsubscribe();
    }
    postboy.fire(new TestMessage('after-churn'));
    //
    expect(received).toEqual(['after-churn']);
    persistent.unsubscribe();
    postboy.dispose();
  });

  it('should survive heavy namespace churn', () => {
    const postboy = new TestPostboy();
    const spaces = 500;
    //
    for (let i = 0; i < spaces; i++) {
      postboy.exec(new AddNamespace(`space-${i}`)).recordSubject(TestMessage);
    }
    for (let i = 0; i < spaces; i++) {
      postboy.exec(new EliminateNamespace(`space-${i}`));
    }
    //
    expect(() => postboy.dispose()).not.toThrow();
  });

  it('should not leak received values after service disposal', () => {
    const postboy = new TestPostboy();
    new TestReg(postboy).recordSubject(TestMessage);
    const received: string[] = [];
    const subscription = postboy.sub(TestMessage).subscribe((m: TestMessage) => received.push(m.value));
    postboy.fire(new TestMessage('before'));
    //
    postboy.dispose();
    //
    expect(() => postboy.fire(new TestMessage('after'))).toThrow();
    //
    expect(received).toEqual(['before']);
    expect(subscription.closed).toBe(true);
  });
});
