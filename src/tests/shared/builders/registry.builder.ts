import { Subject } from 'rxjs';
import { RegistryFixture } from '../fixtures/registry.fixture';
import {TestPostboy} from "../models/test-postboy";
import {TestReg} from "../models/test-registry";
import {PostboyMessage} from "../../../models/postboy.message";
import {MessageType} from "../../../postboy-abstract.registrator";

export class RegistryBuilder {
  private readonly postboy: TestPostboy;
  private readonly registry: TestReg;

  constructor(postboy: TestPostboy = new TestPostboy()) {
    this.postboy = postboy;
    this.registry = RegistryFixture.create(this.postboy);
  }

  subject<T extends PostboyMessage = PostboyMessage>(type: MessageType<T>): this {
    this.registry.recordSubject(type);
    return this;
  }

  replay<T extends PostboyMessage = PostboyMessage>(type: MessageType<T>): this {
    this.registry.recordReplay(type);
    return this;
  }

  behavior<T extends PostboyMessage = PostboyMessage>(type: MessageType<T>, initialValue: any): this {
    this.registry.recordBehavior(type, initialValue);
    return this;
  }

  withPipe<T extends PostboyMessage = PostboyMessage>(type: MessageType<T>, source: Subject<T>, pipeFactory: (source$: Subject<T>) => any): this {
    this.registry.recordWithPipe(type, source, pipeFactory);
    return this;
  }

  build(): TestReg {
    return this.registry;
  }

  getPostboy(): TestPostboy {
    return this.postboy;
  }
}
