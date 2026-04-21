import { TestPostboy } from './models/test-postboy';
import { TestReg } from './models/test-registry';
import { should } from '@artstesh/it-should';
import { TestExecutor } from './models/test-executor';
import { Forger } from '@artstesh/forger';
import { TestHandler } from './models/test-handler';

describe('Integration.Executors', () => {
  let postboy: TestPostboy;
  let executor: TestExecutor<string>;
  let handler: TestHandler;

  beforeEach(() => {
    postboy = new TestPostboy();
    executor = new TestExecutor(Forger.create<string>()!);
    handler = new TestHandler(Forger.create<string>()!);
  });

  it(`should throw if exec not registered`, () => {
    expect(() => postboy.exec(executor)).toThrow();
  });

  [
    { name: 'Function', func: (r: TestReg) => r.recordExecutor(TestExecutor, (e) => handler.handle(e)) },
    { name: 'Handler', func: (r: TestReg) => r.recordHandler(TestExecutor, handler) },
  ].forEach((s) => {
    describe(`${s.name} Tests`, () => {
      let registry: TestReg;

      beforeEach(() => {
        registry = new TestReg(postboy);
        registry.ups.push(s.func);
        registry.up();
      });

      it(`should exec correctly`, () => {
        const result = postboy.exec(executor)!;
        //
        should().string(result).equals(handler.toReturn);
      });
    });
  });
});
