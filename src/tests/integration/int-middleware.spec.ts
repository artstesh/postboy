import {TestPostboy} from './models/test-postboy';
import {TestMessage} from './models/test-message';
import {TestCallbackMessage} from './models/test-callback-message';
import {should} from '@artstesh/it-should';
import {TestExecutor} from "./models/test-executor";
import {Forger} from "@artstesh/forger";
import {TestMiddleware} from "./models/test-middleware";
import {TestReg} from "./models/test-registry";

describe('Integration.Middleware', () => {
  let postboy: TestPostboy;
  let middleware: TestMiddleware;
  let registry: TestReg;

  beforeEach(() => {
    postboy = new TestPostboy();
    registry = new TestReg(postboy);
    middleware = new TestMiddleware();
    postboy.addMiddleware(middleware);
  });

  it(`should pass GenericMessage through`, () => {
    let message = new TestMessage();
    registry.recordSubject(TestMessage);
    //
    postboy.fire(message);
    //
    should().true(middleware.fired === message);
  });

  it(`should pass CallbackMessage through`, () => {
    let message = new TestCallbackMessage();
    registry.recordSubject(TestCallbackMessage);
    //
    postboy.fire(message);
    //
    should().true(middleware.fired === message);
  });

  it(`should pass TestExecutor through`, () => {
    let message = new TestExecutor(Forger.create<string>()!);
    registry.recordExecutor(TestExecutor, () => {});
    //
    postboy.exec(message);
    //
    should().true(middleware.fired === message);
  });
});
