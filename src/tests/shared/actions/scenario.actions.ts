import {TestMessage} from "../models/test-message";
import {TestCallbackMessage} from "../models/test-callback-message";
import { Subscription } from 'rxjs';
import { PostboyWorld } from '../harness/postboy-world';
import { SubscriptionBuilder } from '../builders/subscription.builder';
import {PostboyMessage} from "../../../models/postboy.message";
import {PostboyCallbackMessage} from "../../../models/postboy-callback.message";
import {MessageType} from "../../../postboy-abstract.registrator";
import {PostboyExecutor} from "../../../models/postboy-executor";

export class ScenarioActions {
  constructor(private readonly world: PostboyWorld, private message?: PostboyMessage) {}

  fire(message?: PostboyMessage): void {
    if (!message && !this.message) throw new Error('ScenarioActions: message is not created yet');
    this.world.getPostboy().fire(message ?? this.message!);
  }

  exec(ex?: PostboyExecutor<any>): any {
    if (!this.message && !ex) throw new Error('ScenarioActions: message is not created yet');
    return this.world.getPostboy().exec(ex ?? this.message as PostboyExecutor<any>);
  }

  fireCallback(message?: PostboyCallbackMessage<any>,action?: (e: any) => void): void {
    if (!this.message && !message) throw new Error('ScenarioActions: message is not created yet');
    this.world.getPostboy().fireCallback(message ?? this.message as PostboyCallbackMessage<any>).subscribe(action ?? (() => {}));
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
