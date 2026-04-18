import {BehaviorSubject, ReplaySubject, Subject} from 'rxjs';
import {TestReg} from "../models/test-registry";
import {TestPostboy} from "../models/test-postboy";
import {TestMessage} from "../models/test-message";
import {TestCallbackMessage} from "../models/test-callback-message";
import {MessageType} from "../../../postboy-abstract.registrator";
import {PostboyMessage} from "../../../models/postboy.message";

export class RegistryFixture {
  static create(postboy: TestPostboy = new TestPostboy()): TestReg {
    return new TestReg(postboy);
  }

  static subject<T extends PostboyMessage = PostboyMessage>(type: MessageType<T>, postboy: TestPostboy = new TestPostboy()): TestReg {
    const reg = new TestReg(postboy);
    reg.recordSubject(type);
    return reg;
  }

  static replay<T extends PostboyMessage = PostboyMessage>(type: MessageType<T>, postboy: TestPostboy = new TestPostboy()): TestReg {
    const reg = new TestReg(postboy);
    reg.recordReplay(type);
    return reg;
  }

  static behavior<T extends PostboyMessage = PostboyMessage>(type: MessageType<T>, initialValue: T, postboy: TestPostboy = new TestPostboy()): TestReg {
    const reg = new TestReg(postboy);
    reg.recordBehavior(type, initialValue as any);
    return reg;
  }

  static withPipe<T extends PostboyMessage = PostboyMessage>(
    type: MessageType<T>,
    source: Subject<T> = new Subject<T>(),
    pipeFactory: (source$: Subject<T>) => any,
    postboy: TestPostboy = new TestPostboy(),
  ): TestReg {
    const reg = new TestReg(postboy);
    reg.recordWithPipe(type, source, pipeFactory);
    return reg;
  }

  static messageRegistry(postboy: TestPostboy = new TestPostboy()) {
    const reg = new TestReg(postboy);
    reg.recordSubject(TestMessage);
    return reg;
  }

  static callbackRegistry(postboy: TestPostboy = new TestPostboy()) {
    const reg = new TestReg(postboy);
    reg.recordSubject(TestCallbackMessage);
    return reg;
  }

  static replaySubject<T>(bufferSize = 1): ReplaySubject<T> {
    return new ReplaySubject<T>(bufferSize);
  }

  static behaviorSubject<T>(initialValue: T): BehaviorSubject<T> {
    return new BehaviorSubject<T>(initialValue);
  }

  static subjectStream<T>(): Subject<T> {
    return new Subject<T>();
  }
}

/*
const message = MessageFixture.message();
const registry = RegistryFixture.subject(message.type, postboy);
---
const message = MessageFixture.callbackMessage();
const registry = RegistryFixture.callbackRegistry(postboy);
---
const registry = RegistryFixture.withPipe(
  message.type,
  new Subject(),
  (s) => s.pipe(*operators*),
  postboy,
);
 */
