import { Subscription } from 'rxjs';
import { PostboyWorld } from '../harness/postboy-world';
import {PostboyMessage} from "../../../models/postboy.message";
import {MessageType} from "../../../postboy-abstract.registrator";

type SubscriptionMode = 'sub' | 'once';

export class SubscriptionBuilder<TValue extends PostboyMessage = PostboyMessage> {
  private readonly world: PostboyWorld;
  private readonly type: MessageType<TValue>;
  private mode: SubscriptionMode = 'sub';
  private handler: (value: TValue) => void = () => {};
  private subscription: Subscription | null = null;

  constructor(world: PostboyWorld, type: MessageType<TValue>) {
    this.world = world;
    this.type = type;
  }

  static forType<T extends PostboyMessage = PostboyMessage>(world: PostboyWorld, type: MessageType<T>): SubscriptionBuilder<T> {
    return new SubscriptionBuilder(world, type);
  }

  asSub(): this {
    this.mode = 'sub';
    return this;
  }

  asOnce(): this {
    this.mode = 'once';
    return this;
  }

  withHandler(handler: (value: TValue) => void): this {
    this.handler = handler;
    return this;
  }

  collect<TCollected = TValue>(bucket: TCollected[]): this {
    this.handler = ((value: TValue) => {
      bucket.push(value as unknown as TCollected);
    }) as any;
    return this;
  }

  subscribe(): Subscription {
    const postboy = this.world.getPostboy();
    const source$ = this.mode === 'once' ? postboy.once(this.type) : postboy.sub(this.type);

    this.subscription = source$.subscribe(this.handler as any);
    this.world.trackSubscription(this.subscription);

    return this.subscription;
  }

  unsubscribe(): this {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    return this;
  }

  getSubscription(): Subscription {
    if (!this.subscription) {
      throw new Error('SubscriptionBuilder: subscription is not created yet');
    }

    return this.subscription;
  }

  expectOpen(): this {
    expect(this.getSubscription().closed).toBe(false);
    return this;
  }

  expectClosed(): this {
    expect(this.getSubscription().closed).toBe(true);
    return this;
  }
}

/*
const received: unknown[] = [];

const sub = SubscriptionBuilder
  .forType(world, message.type)
  .asSub()
  .collect(received)
  .subscribe();

world.getPostboy().fire(message);

expect(received).toHaveLength(1);

  ---

const received: unknown[] = [];

SubscriptionBuilder
  .forType(world, message.type)
  .asOnce()
  .collect(received)
  .subscribe();

world.getPostboy().fire(message);

expect(received).toHaveLength(1);

---

const sub = SubscriptionBuilder
  .forType(world, message.type)
  .withHandler(() => {})
  .subscribe();

SubscriptionBuilder
  .forType(world, message.type)
  .withHandler(() => {})
  .subscribe();

expect(sub.closed).toBe(false);

  ---

  Было``` ts
const sub = world.getPostboy().sub(message.type).subscribe((value) => {
  received.push(value);
});
world.trackSubscription(sub);
```

Станет``` ts
const sub = SubscriptionBuilder
  .forType(world, message.type)
  .withHandler((value) => received.push(value))
  .subscribe();
```

 */
