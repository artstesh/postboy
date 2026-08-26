import { PostboyMiddleware } from '../../services/postboy-middleware';
import { MiddlewareDecisionType } from '../../models/middleware-decision.enum';
import { should } from '@artstesh/it-should';

class TestMiddleware extends PostboyMiddleware {}

describe('PostboyMiddleware', () => {
  it('should default the name to the class name', () => {
    const middleware = new TestMiddleware();
    //
    should().string(middleware.name).equals('TestMiddleware');
  });

  it('should use the provided custom name', () => {
    const name = 'custom-middleware';
    //
    const middleware = new TestMiddleware(name);
    //
    should().string(middleware.name).equals(name);
  });

  it('should handle any context by default', () => {
    const middleware = new TestMiddleware();
    //
    should().true(middleware.canHandle({} as any));
  });

  it('should continue by default in before', () => {
    const middleware = new TestMiddleware();
    //
    expect(middleware.before({} as any).type).toBe(MiddlewareDecisionType.Continue);
  });

  it('should not throw in after and dispose hooks', () => {
    const middleware = new TestMiddleware();
    //
    expect(() => {
      middleware.after({} as any, 'result');
      middleware.dispose();
    }).not.toThrow();
  });
});
