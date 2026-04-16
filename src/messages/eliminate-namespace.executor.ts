import {PostboyExecutor} from "../models/postboy-executor";

/**
 * Represents an executor that eliminates a specific namespace.
 * This class extends the PostboyExecutor with a void return type.
 */
export class EliminateNamespace extends PostboyExecutor<void> {
  static readonly ID = '03bb03bb-53e0-4b74-9aad-64d5c54a8972';

  /**
   * Creates an instance of the class with the specified space value.
   *
   * @param {string} space - The string value representing the space configuration.
   */
  constructor(public space: string) {
    super();
  }
}
