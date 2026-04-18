import { TestPostboy } from './models/test-postboy';
import { TestMessage } from './models/test-message';
import { TestCallbackMessage } from './models/test-callback-message';
import { should } from '@artstesh/it-should';
import { TestExecutor } from './models/test-executor';
import { Forger } from '@artstesh/forger';
import { TestMiddleware } from './models/test-middleware';
import { TestReg } from './models/test-registry';
import {AddMiddleware} from "../../messages/add-middleware.executor";

describe('Integration.Middleware', () => {
  let postboy: TestPostboy;
  let middleware: TestMiddleware;
  let registry: TestReg;

  beforeEach(() => {
    postboy = new TestPostboy();
    registry = new TestReg(postboy);
    middleware = new TestMiddleware();
    postboy.exec(new AddMiddleware(middleware));
  });

  afterEach(() => {
    registry.down();
  })

  describe('generic message', () => {
    let message: TestMessage;

    beforeEach(() => {
      message = new TestMessage();
      registry.recordSubject(TestMessage);
    })

    it(`should pass by if cannot handle`, () => {
      middleware._canHandle = false;
      //
      postboy.fire(message);
      //
      should().false(middleware._before);
      should().false(middleware._after);
      should().false(middleware._onError);
    });

    it(`should manage before & after`, () => {
      middleware._canHandle = true;
      //
      postboy.fire(message);
      //
      should().true(middleware._before?.message === message);
      should().true(middleware._after?.message === message);
      should().false(middleware._onError);
    });

    it(`should manage onError`, () => {
      middleware._canHandle = true;
      middleware._throw = true;
      //
      postboy.fire(message)
      //
      // expect(() => postboy.fire(message)).toThrow();
      should().true(middleware._onError);
    });
  })

  it(`should pass Callback by if cannot handle`, () => {
    middleware._canHandle = false;
    registry.recordSubject(TestCallbackMessage);
    //
    postboy.fire(new TestCallbackMessage());
    //
    should().false(middleware._before);
    should().false(middleware._after);
    should().false(middleware._onError);
  });

  it(`should pass Executor by if cannot handle`, () => {
    let message = new TestExecutor(Forger.create<string>()!);
    registry.recordExecutor(TestExecutor, () => {});
    middleware._canHandle = false;
    //
    postboy.exec(message);
    //
    should().false(middleware._before);
    should().false(middleware._after);
    should().false(middleware._onError);
  });
});
