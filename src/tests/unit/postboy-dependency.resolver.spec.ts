import { PostboyDependencyResolver } from '../../services/postboy-dependency.resolver';
import { PostboyMiddlewareService } from '../../services/postboy-middleware.service';
import { PostboyMessageStore } from '../../services/postboy-message.store';
import { PostboyNamespaceStore } from '../../services/postboy-namespace.store';

describe('PostboyDependencyResolver', () => {
  let resolver: PostboyDependencyResolver;

  beforeEach(() => {
    resolver = new PostboyDependencyResolver();
  });

  it('should create middleware services', () => {
    //
    const service = resolver.getMiddlewareService();
    //
    expect(service).toBeInstanceOf(PostboyMiddlewareService);
  });

  it('should create message stores', () => {
    //
    const store = resolver.getMessageStore();
    //
    expect(store).toBeInstanceOf(PostboyMessageStore);
  });

  it('should create namespace stores', () => {
    //
    const store = resolver.getNamespaceStore();
    //
    expect(store).toBeInstanceOf(PostboyNamespaceStore);
  });

  it('should create a fresh instance on every call', () => {
    //
    const first = resolver.getMessageStore();
    const second = resolver.getMessageStore();
    //
    expect(first).not.toBe(second);
  });
});
