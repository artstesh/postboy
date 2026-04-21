import {PostboyAbstractRegistrator} from "../postboy-abstract.registrator";
import {PostboyExecutor} from "../models/postboy-executor";
import {PostboyExecutionHandler} from "../models/postboy-execution.handler";
import {PostboyNamespaceStore} from "../services/postboy-namespace.store";
import {PostboyService} from "../postboy.service";

/**
 * AddNamespace is a class that extends the PostboyExecutor with a specific implementation
 * for adding namespaces to a PostboyService instance.
 *
 * This class is identified uniquely by its static ID property for tracking and referencing purposes.
 */
export class AddNamespace extends PostboyExecutor<PostboyAbstractRegistrator> {
  static readonly ID = '6d1a6f7d-6b6e-4c4d-8af8-9cc9a32e850c';

  /**
   * Creates an instance of the class with the specified space identifier.
   *
   * @param {string} space - The identifier for the space.
   */
  constructor(public space: string) {
    super();
  }
}
