import {PostboyMessage} from './postboy.message';

export abstract class PostboyExecutor<T> extends PostboyMessage {
  declare protected readonly _postboyResultType?: T;
}
