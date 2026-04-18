import {MiddlewareStage} from "./middleware-stage.enum";

export interface CancelDetails {
  stage: MiddlewareStage;
  reason?: string;
  middleware?: string;
  messageId?: string;
  namespace?: string;
}
