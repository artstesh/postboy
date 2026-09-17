/**
 * Base class for all errors produced by the postboy library.
 *
 * Catch it — or use the {@link isPostboyError} guard — to handle any library error
 * (cancellations, missing registrations, ...) in one place, while letting unrelated
 * errors propagate. Concrete error types extend it: {@link CancelError},
 * {@link NoRegisteredMessageError}, {@link NoRegisteredExecutorError}.
 */
export class PostboyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PostboyError';
  }
}

/**
 * Type guard checking whether an unknown caught value is an error produced by the
 * postboy library — any subclass of {@link PostboyError}, including {@link CancelError}.
 *
 * @param error - The caught value.
 * @return True when the error was produced by the library.
 */
export function isPostboyError(error: unknown): error is PostboyError {
  return error instanceof PostboyError;
}
