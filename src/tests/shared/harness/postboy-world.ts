import { TestWorld } from './test-world';
import {TestPostboy} from "../models/test-postboy";
import {TestReg} from "../models/test-registry";
import {PostboyMessage} from "../../../models/postboy.message";
import {PostboyCallbackMessage} from "../../../models/postboy-callback.message";
import {PostboyMiddleware} from "../../../services/postboy-middleware";

export type PostboyWorldState = {
  postboy?: TestPostboy;
  registry?: TestReg;
  message?: PostboyMessage;
  callbackMessage?: PostboyCallbackMessage<any>;
  middleware?: PostboyMiddleware[];
  subscriptions?: any[];
};

export class PostboyWorld extends TestWorld<PostboyWorldState> {
  createPostboy(postboy: TestPostboy = new TestPostboy()): TestPostboy {
    this.set('postboy', postboy);
    return postboy;
  }

  createRegistry(registry: any): any {
    this.set('registry', registry);
    return registry;
  }

  createMessage<TMessage extends PostboyMessage = PostboyMessage>(message: TMessage): TMessage {
    this.set('message', message);
    return message;
  }

  createCallbackMessage<R,TMessage extends PostboyCallbackMessage<R> = PostboyCallbackMessage<R>>(message: TMessage): TMessage {
    this.set('callbackMessage', message);
    return message;
  }

  addSubscription(sub: { unsubscribe: () => void }): this {
    return this.addCleanup(() => sub.unsubscribe());
  }

  addSubscriptions(subs: { unsubscribe: () => void }[]): this {
    subs.forEach((sub) => this.addSubscription(sub));
    return this;
  }

  trackMiddleware(middleware: any): this {
    const list = this.tryGet('middleware') ?? [];
    list.push(middleware);
    this.set('middleware', list);
    return this;
  }

  trackSubscription(sub: { unsubscribe: () => void }): this {
    const list = this.tryGet('subscriptions') ?? [];
    list.push(sub);
    this.set('subscriptions', list);
    return this.addCleanup(() => sub.unsubscribe());
  }

  getPostboy(): TestPostboy {
    return this.get('postboy') as TestPostboy;
  }
}
