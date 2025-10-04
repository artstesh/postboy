import { PostboyMiddleware } from '../../models/postboy-middleware';
import { PostboyMiddlewareService } from '../../services/postboy-middleware.service';
import { PostboyMessage } from '../../models/postboy.message';

describe('PostboyMiddlewareService', () => {
  let service: PostboyMiddlewareService;

  beforeEach(() => {
    service = new PostboyMiddlewareService();
  });

  class MockMiddleware implements PostboyMiddleware {
    handle = jest.fn();
  }

  class MockMessage extends PostboyMessage {}

  it('should add middleware successfully', () => {
    const middleware = new MockMiddleware();
    service.addMiddleware(middleware);
    const msg = new MockMessage();
    //
    service.manage(msg);
    //
    expect(middleware.handle).toHaveBeenCalledWith(msg);
  });

  it('should remove middleware successfully', () => {
    const middleware = new MockMiddleware();
    service.addMiddleware(middleware);
    service.removeMiddleware(middleware);
    //
    middleware.handle.mockClear();
    service.manage(new MockMessage());
    //
    expect(middleware.handle).not.toHaveBeenCalled();
  });

  it('should call all middlewares handle method when manage is invoked', () => {
    const middleware1 = new MockMiddleware();
    const middleware2 = new MockMiddleware();
    service.addMiddleware(middleware1);
    service.addMiddleware(middleware2);
    const msg = new MockMessage();
    //
    service.manage(msg);
    //

    expect(middleware1.handle).toHaveBeenCalledWith(msg);
    expect(middleware2.handle).toHaveBeenCalledWith(msg);
  });

  it('should not call any middleware if the list is empty', () => {
    const msg = new MockMessage();
    //
    expect(() => service.manage(msg)).not.toThrow();
  });

  it('should remove middleware on dispose()', () => {
    const middleware = new MockMiddleware();
    service.addMiddleware(middleware);
    service.dispose();
    //
    middleware.handle.mockClear();
    service.manage(new MockMessage());
    //
    expect(middleware.handle).not.toHaveBeenCalled();
  });
});
