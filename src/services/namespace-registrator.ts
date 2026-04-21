import { PostboyAbstractRegistrator } from '../postboy-abstract.registrator';
import { PostboyService } from '../postboy.service';

/**
 * NamespaceRegistrator is a specialized class that extends PostboyAbstractRegistrator.
 *
 * @class NamespaceRegistrator
 * @extends PostboyAbstractRegistrator
 * @param {PostboyService} postboy - An instance of the PostboyService, used for managing registrations.
 */
export class NamespaceRegistrator extends PostboyAbstractRegistrator {
  constructor(postboy: PostboyService) {
    super(postboy);
  }

  protected _up(): void {
    // ignore
  }
}
