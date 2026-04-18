import {CancelDetails} from "./cancel-details";
import {MiddlewareStage} from "./middleware-stage.enum";

export class CancelError extends Error {
  public readonly details: CancelDetails;

  constructor(details: CancelDetails) {
    super(details.reason ?? `Postboy operation was cancelled at stage "${MiddlewareStage[details.stage]}"`);
    this.name = 'PostboyCancelError';
    this.details = details;
  }
}

export function isCancelError(error: unknown): error is CancelError {
  return error instanceof CancelError;
}
