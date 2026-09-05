import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { TestAssertions } from '../../shared/harness/assertions';
import { waitFor, waitForValue } from '../../shared/utils/async';
import { toArray } from '../../shared/utils/observables';
import { MessageFixture } from '../../shared/fixtures/message.fixture';
import { TestCallbackMessage } from '../../shared/models/test-callback-message';

describe('Integration.Callbacks.Fire', () => {
  it('should fire callback message and emit result value', async () => {
    const scenario = new ScenarioBuilder().useCallback().subjectRegistry();

    const actions = scenario.actions();
    const message = scenario.getMessage();

    const received: string[] = [];
    message.result.subscribe((value: string) => received.push(value));

    actions.fireCallback(message);
    message.finish('ok');

    const value = await waitForValue(() => received[0]);

    expect(value).toBe('ok');
    TestAssertions.receivedOne(received, 'ok');
  });

  it('should complete callback message after finish', async () => {
    const scenario = new ScenarioBuilder().useCallback().subjectRegistry();

    const actions = scenario.actions();
    const message = scenario.getMessage();

    let completed = false;
    message.result.subscribe({
      complete: () => {
        completed = true;
      },
    });

    actions.fireCallback(message);
    message.finish('done');

    await waitFor(() => completed);

    TestAssertions.completed(completed);
  });

  it('should support observable collection for callback result', async () => {
    const scenario = new ScenarioBuilder().useCallback().subjectRegistry();

    const actions = scenario.actions();
    const message = scenario.getMessage();

    const valuesPromise = toArray(message.result);

    actions.fireCallback(message);
    message.finish('payload');

    await expect(valuesPromise).resolves.toEqual(['payload']);
  });

  it('should throw when callback message is not registered', () => {
    TestAssertions.throws(() =>
      new ScenarioBuilder().getWorld().getPostboy().fireCallback(MessageFixture.callbackMessage()),
    );
  });

  it('should not complete before finish is called', async () => {
    const scenario = new ScenarioBuilder().useCallback().subjectRegistry();

    const actions = scenario.actions();
    const message = scenario.getMessage();

    let completed = false;
    message.result.subscribe({
      complete: () => {
        completed = true;
      },
    });

    actions.fireCallback(message);

    await waitFor(() => !completed);

    expect(completed).toBe(false);
  });

  it('should invoke action exactly once per emitted value', () => {
    const scenario = new ScenarioBuilder().useCallback().subjectRegistry();
    const postboy = scenario.getWorld().getPostboy();
    const message = scenario.getMessage();

    const action = jest.fn();
    postboy.fireCallback(message, action);

    message.next('first');
    message.next('second');
    message.finish('done');

    expect(action).toHaveBeenCalledTimes(3);
    expect(action.mock.calls.map((call) => call[0])).toEqual(['first', 'second', 'done']);
  });

  it('should invoke action once even when the returned observable is also subscribed', () => {
    const scenario = new ScenarioBuilder().useCallback().subjectRegistry();
    const postboy = scenario.getWorld().getPostboy();
    const message = scenario.getMessage();
    const received: string[] = [];

    const action = jest.fn();
    const observable = postboy.fireCallback(message, action);
    observable.subscribe((value: string) => received.push(value));
    message.finish('done');

    expect(action).toHaveBeenCalledTimes(1);
    TestAssertions.receivedOne(received, 'done');
  });

  it('should not re-dispatch when the returned observable is subscribed again', () => {
    const scenario = new ScenarioBuilder().useCallback().subjectRegistry();
    const postboy = scenario.getWorld().getPostboy();
    const message: TestCallbackMessage = scenario.getMessage();
    const requests: string[] = [];

    postboy.sub(message.type).subscribe((m) => {
      m.finish('ok');
      requests.push('responded');
    });

    const observable = postboy.fireCallback(message);
    const received: string[] = [];
    observable.subscribe((value: string) => received.push(value));
    observable.subscribe();

    expect(requests).toHaveLength(1);
    TestAssertions.receivedOne(received, 'ok');
  });

  it('should dispatch only once when action is combined with a subscription to the returned observable', () => {
    const scenario = new ScenarioBuilder().useCallback().subjectRegistry();
    const postboy = scenario.getWorld().getPostboy();
    const message: TestCallbackMessage = scenario.getMessage();
    const requests: string[] = [];

    postboy.sub(message.type).subscribe((m) => {
      m.finish('done');
      requests.push('responded');
    });

    const observable = postboy.fireCallback(message, () => undefined);
    observable.subscribe();

    expect(requests).toHaveLength(1);
  });
});
