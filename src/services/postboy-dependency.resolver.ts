import { PostboyMiddlewareService } from './postboy-middleware.service';
import { PostboyMessageStore } from './postboy-message.store';

export class PostboyDependencyResolver {
  getMiddlewareService = () => new PostboyMiddlewareService();
  getMessageStore = () => new PostboyMessageStore();
}
