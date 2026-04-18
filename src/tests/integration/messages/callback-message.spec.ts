import {should} from "@artstesh/it-should";
import {flushMicrotasks} from "../../shared/utils/async";
import {CallbackMessageFixture} from "../../shared/fixtures/callback-message.fixture";
import {PostboyFixture} from "../../shared/fixtures/postboy.fixture";
import {ScenarioBuilder} from "../../shared/builders/scenario.builder";

describe('Integration.Messages.Callback', () => {
  it('should complete callback message', async () => {
    const scenario = new ScenarioBuilder().callbackMessage().subjectRegistry();
    const world = PostboyFixture.world();
    const postboy = world.getPostboy();
    const message = CallbackMessageFixture.create();

    let completed = false;

    message.result.subscribe({
      complete: () => {
        completed = true;
      },
    });

    postboy.fireCallback(message);
    message.finish('ok');

    await flushMicrotasks();

    expect(completed).toBe(true);
  });
});
