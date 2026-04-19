import {PostboyWorld} from '../harness/postboy-world';
import {RegistryBuilder} from './registry.builder';
import {TestMessage} from "../models/test-message";
import {TestCallbackMessage} from "../models/test-callback-message";
import {ScenarioActions} from "../actions/scenario.actions";
import {PostboyMessage} from "../../../models/postboy.message";
import {MessageFixture} from "../fixtures/message.fixture";
import {Observable, Subject} from "rxjs";
import {TestExecutor} from "../models/test-executor";
import {PostboyExecutor} from "../../../models/postboy-executor";
import {MiddlewareBuilder} from "./middleware.builder";

export class ScenarioBuilder {
  private readonly world: PostboyWorld;
  private registryBuilder: RegistryBuilder | null = null;
  private middlewareBuilder: MiddlewareBuilder | null = null;
  private _message: TestMessage | TestCallbackMessage | TestExecutor<any> | null = null;

  constructor(world: PostboyWorld = new PostboyWorld()) {
    this.world = world;
    this.world.createPostboy();
  }

  useMessage(): this {
    this._message = this.world.createMessage(MessageFixture.message());
    return this;
  }

  useCallback(): this {
    this._message = this.world.createCallbackMessage<string, TestCallbackMessage>(MessageFixture.callbackMessage());
    return this;
  }

  useExecutor(): this {
    this._message = this.world.createExecutor<string, TestExecutor<any>>(MessageFixture.executor());
    return this;
  }

  executeRegistry<R>(func: (message: PostboyExecutor<any>) => R): this {
    this.ensureMessage();
    this.registryBuilder = new RegistryBuilder(this.world.getPostboy()).executor(this._message!.type, e => func(e));
    this.world.createRegistry(this.registryBuilder.build());
    return this;
  }

  useMiddleware(observableMessageIds?: string[]): MiddlewareBuilder {
    this.ensureMessage();
    this.middlewareBuilder = new MiddlewareBuilder(this.world, ...(observableMessageIds ?? [this._message!.id]));
    return this.middlewareBuilder;
  }

  handlerRegistry<T>(toReturn?: T): this {
    this.ensureMessage();
    this.registryBuilder = new RegistryBuilder(this.world.getPostboy()).handler(this._message!.type, MessageFixture.handler(toReturn));
    this.world.createRegistry(this.registryBuilder.build());
    return this;
  }

  subjectRegistry(): this {
    this.ensureMessage();
    this.registryBuilder = new RegistryBuilder(this.world.getPostboy()).subject(this._message!.type);
    this.world.createRegistry(this.registryBuilder.build());
    return this;
  }

  replayRegistry(): this {
    this.ensureMessage();
    this.registryBuilder = new RegistryBuilder(this.world.getPostboy()).replay(this._message!.type);
    this.world.createRegistry(this.registryBuilder.build());
    return this;
  }

  behaviorRegistry(initialValue: any): this {
    this.ensureMessage();
    this.registryBuilder = new RegistryBuilder(this.world.getPostboy()).behavior(this._message!.type, initialValue);
    this.world.createRegistry(this.registryBuilder.build());
    return this;
  }

  withPipeRegistry<T extends PostboyMessage = PostboyMessage>(func: (s: Subject<T>) => Observable<T>): this {
    this.ensureMessage();
    this.registryBuilder = new RegistryBuilder(this.world.getPostboy()).withPipe(this._message!.type, new Subject<any>(), (s) => func(s));
    this.world.createRegistry(this.registryBuilder.build());
    return this;
  }

  actions(): ScenarioActions {
    this.ensureMessage();
    return new ScenarioActions(this.world, this.getMessage());
  }

  getWorld(): PostboyWorld {
    return this.world;
  }

  getMessage(): any {
    this.ensureMessage();
    return this._message;
  }

  private ensureMessage(): void {
    if (!this._message) {
      throw new Error('ScenarioBuilder: message is not created yet');
    }
  }
}

/*
import { ScenarioBuilder } from '../../shared/builders/scenario.builder';

it('should deliver message to subscriber', () => {
  const scenario = new ScenarioBuilder()
    .message()
    .subjectRegistry();

  const actions = scenario.actions();
  const message = scenario.getMessage();
  const received: any[] = [];

  actions.subscribe(message.type, (value) => received.push(value));
  actions.fire(message);

  expect(received).toHaveLength(1);
});

---

it('should complete callback message', () => {
  const scenario = new ScenarioBuilder()
    .callbackMessage()
    .subjectRegistry();

  const actions = scenario.actions();
  const message = scenario.getMessage();

  let completed = false;
  message.result.subscribe({ complete: () => (completed = true) });

  actions.fireCallback(message);
  message.finish('ok');

  expect(completed).toBe(true);
});
 */
