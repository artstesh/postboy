import {PostboyMessage} from "./postboy.message";
import {PostboyMessageContext} from "./postboy-message.context";
import {MiddlewareStage} from "./middleware-stage.enum";

export interface PipelineContext<T extends PostboyMessage = PostboyMessage> {
  stage: MiddlewareStage;
  message: T;
  messageContext?: PostboyMessageContext;
}
