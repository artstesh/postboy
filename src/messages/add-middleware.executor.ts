import { PostboyExecutor } from '../models/postboy-executor';
import {PostboyMiddleware} from "../services/postboy-middleware";

/**
 * Represents a {@link PostboyMiddleware} addition operation for Postboy.
 * This class extends the functionality of the PostboyExecutor to add middleware to the processing chain.
 *
 * The middleware to be added is provided during instantiation.
 */
export class AddMiddleware extends PostboyExecutor<void> {
  static readonly ID = '0a8cfe0a-6193-4082-8440-d0793367b21d';

  /**
   * Initializes a new instance of the class with the specified middleware.
   *
   * @param {PostboyMiddleware} middleware - The {@link PostboyMiddleware} to be used for processing.
   */
  constructor(public middleware: PostboyMiddleware) {
    super();
  }
}
