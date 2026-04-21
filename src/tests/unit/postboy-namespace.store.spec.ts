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
    store = new PostboyNamespaceStore();
  });

  describe('addSpace', () => {
    it('should add a new namespace if it does not exist', () => {
      const spaceName = Forger.create<string>()!;
      //
      const result = store.addSpace(spaceName, postboyService);
      //
      expect(result).toBeInstanceOf(PostboyAbstractRegistrator);
    });

    it('should return the same namespace registrator if it already exists', () => {
      const spaceName = Forger.create<string>()!;
      //
      const firstInstance = store.addSpace(spaceName, postboyService);
      const secondInstance = store.addSpace(spaceName, postboyService);
      //
      expect(secondInstance).toBe(firstInstance);
    });
  });

  describe('eliminateSpace', () => {
    it('should remove a space if it exists', () => {
      const spaceName = Forger.create<string>()!;
      //
      const firstInstance = store.addSpace(spaceName, postboyService);
      store.eliminateSpace(spaceName);
      const secondInstance = store.addSpace(spaceName, postboyService);
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
      const firstInstance = store.addSpace(spaceName, postboyService);
      store.dispose();
      const secondInstance = store.addSpace(spaceName, postboyService);
      //
      expect(secondInstance).not.toBe(firstInstance);
    });
  });
});
