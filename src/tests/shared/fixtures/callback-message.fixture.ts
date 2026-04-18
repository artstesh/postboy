import {TestCallbackMessage} from "../models/test-callback-message";

export class CallbackMessageFixture {
  static create(): TestCallbackMessage {
    return new TestCallbackMessage();
  }
}


/*
import { PostboyFixture } from '../../shared/fixtures/postboy.fixture';
import { CallbackMessageFixture } from '../../shared/fixtures/callback-message.fixture';
import { SubscriptionBuilder } from '../../shared/builders/subscription.builder';
import { RegistryBuilder } from '../../shared/builders/registry.builder';
import { PostboyWorld } from '../../shared/harness/postboy-world';

it('should complete callback message', () => {
  const world = PostboyFixture.world(new PostboyWorld());
  const postboy = world.getPostboy();

  const message = CallbackMessageFixture.create();

  const registry = new RegistryBuilder(postboy)
    .subject(message.type)
    .build();

  world.createRegistry(registry);
  world.createCallbackMessage(message);

  const completed: string[] = [];

  SubscriptionBuilder
    .forType(world, message.type)
    .withHandler(() => completed.push('next'))
    .subscribe();

  postboy.fireCallback(message);
  message.finish('ok');

  expect(completed).toEqual(['next']);
});

---

const world = PostboyFixture.world();
const postboy = world.getPostboy();

const message = CallbackMessageFixture.create();
world.createCallbackMessage(message);

new RegistryBuilder(postboy).subject(message.type).build();

SubscriptionBuilder
  .forType(world, message.type)
  .asOnce()
  .subscribe();

postboy.fireCallback(message);
message.finish('ok');
 */
