import {TestMessage} from "../models/test-message";
import {TestCallbackMessage} from "../models/test-callback-message";
import { Subscription } from 'rxjs';
import { PostboyWorld } from '../harness/postboy-world';
import { SubscriptionBuilder } from '../builders/subscription.builder';
import {PostboyMessage} from "../../../models/postboy.message";
import {PostboyCallbackMessage} from "../../../models/postboy-callback.message";
import {MessageType} from "../../../postboy-abstract.registrator";

export class ScenarioActions {
  constructor(private readonly world: PostboyWorld) {}

  fire(message: PostboyMessage): void {
    this.world.getPostboy().fire(message);
  }

  fireCallback(message: PostboyCallbackMessage<any>): void {
    this.world.getPostboy().fireCallback(message);
  }

  subscribe(type: MessageType<any>, handler: (...args: any[]) => void = () => {}): Subscription {
    return SubscriptionBuilder
      .forType(this.world, type)
      .withHandler(handler)
      .subscribe();
  }

  once(type: MessageType<any>, handler: (...args: any[]) => void = () => {}): Subscription {
    return SubscriptionBuilder
      .forType(this.world, type)
      .asOnce()
      .withHandler(handler)
      .subscribe();
  }
}
