import { NamespaceRegistrator } from '../../services/namespace-registrator';
import { PostboyService } from '../../postboy.service';
import { instance, mock } from 'ts-mockito';

describe('NamespaceRegistrator', () => {
  let postboy: PostboyService;

  beforeEach(() => {
    postboy = instance(mock(PostboyService));
  });

  it('should be constructable with a postboy service', () => {
    //
    const registrator = new NamespaceRegistrator(postboy);
    //
    expect(registrator).toBeInstanceOf(NamespaceRegistrator);
  });

  it('should tolerate up and down without any registrations', () => {
    const registrator = new NamespaceRegistrator(postboy);
    //
    expect(() => {
      registrator.up();
      registrator.down();
    }).not.toThrow();
  });
});
