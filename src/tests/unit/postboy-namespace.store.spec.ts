// postboy-namespace.store.spec.ts
import { Forger } from '@artstesh/forger';
import { PostboyNamespaceStore } from '../../services/postboy-namespace.store';
import { PostboyService } from '../../postboy.service';
import { PostboyAbstractRegistrator } from '../../postboy-abstract.registrator';

describe('PostboyNamespaceStore', () => {
  let postboyService: PostboyService;
  let store: PostboyNamespaceStore;

  beforeEach(() => {
    postboyService = new PostboyService();
    store = new PostboyNamespaceStore(postboyService);
  });

  describe('addSpace', () => {
    it('should add a new namespace if it does not exist', () => {
      const spaceName = Forger.create<string>()!;
      //
      const result = store.addSpace(spaceName);
      //
      expect(result).toBeInstanceOf(PostboyAbstractRegistrator);
    });

    it('should return the same namespace registrator if it already exists', () => {
      const spaceName = Forger.create<string>()!;
      //
      const firstInstance = store.addSpace(spaceName);
      const secondInstance = store.addSpace(spaceName);
      //
      expect(secondInstance).toBe(firstInstance);
    });
  });

  describe('eliminateSpace', () => {
    it('should remove a space if it exists', () => {
      const spaceName = Forger.create<string>()!;
      //
      const firstInstance = store.addSpace(spaceName);
      store.eliminateSpace(spaceName);
      const secondInstance = store.addSpace(spaceName);
      //
      expect(secondInstance).not.toBe(firstInstance);
    });

    it('should do nothing if the space does not exist', () => {
      const spaceName = Forger.create<string>()!;
      //
      expect(() => store.eliminateSpace(spaceName)).not.toThrow();
    });
  });

  describe('dispose', () => {
    it('should call down on all registrators and clear all spaces', () => {
      const spaceName = Forger.create<string>()!;
      //
      const firstInstance = store.addSpace(spaceName);
      store.dispose();
      const secondInstance = store.addSpace(spaceName);
      //
      expect(secondInstance).not.toBe(firstInstance);
    });
  });
});
