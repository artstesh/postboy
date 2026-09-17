import { PostboyError } from './postboy-error';

/**
 * The error thrown when a message type is addressed that was never registered with the bus —
 * a `ConnectMessage` for its static `ID` was not executed (or the type was disconnected again).
 *
 * Thrown by `PostboyService.fire`, `fireCallback`, `sub`, and `once`. Distinguish it from other
 * errors via `error instanceof NoRegisteredMessageError` or the {@link isPostboyError} guard,
 * then inspect {@link id} / {@link typeName} to find the missing registration.
 */
export class NoRegisteredMessageError extends PostboyError {
  /** The static `ID` the message type was looked up under. */
  public readonly id: string;
  /** The constructor name of the message class, as passed to the lookup. */
  public readonly typeName: string;

  /**
   * @param id - The static `ID` the message type was looked up under.
   * @param typeName - The constructor name of the message class; becomes part of the error message.
   */
  constructor(id: string, typeName: string) {
    super(`There is no registered event ${typeName}`);
    this.name = 'PostboyNoRegisteredMessageError';
    this.id = id;
    this.typeName = typeName;
  }
}
