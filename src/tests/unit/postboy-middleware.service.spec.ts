import {PostboyMiddlewareService} from '../../services/postboy-middleware.service';
import {PostboyMessage} from '../../models/postboy.message';
import {anything, instance, mock, reset, verify, when} from "ts-mockito";
import {PostboyMiddleware} from "../../services/postboy-middleware";
import {MiddlewareStage} from "../../models/middleware-stage.enum";
import {PostboyMessageContext} from "../../models/postboy-message.context";
import {Forger} from "@artstesh/forger";
import {MiddlewareDecision} from "../../models/middleware-decision.enum";
import {CancelError} from "../../models/cancel-error";

describe('PostboyMiddlewareService', () => {
  let service: PostboyMiddlewareService;
  let middleware= mock(PostboyMiddleware)

  beforeEach(() => {
    service = new PostboyMiddlewareService();
    service.addMiddleware(instance(middleware));
  });

  afterEach(() => {
    reset(middleware);
  })

  class MockMessage extends PostboyMessage {}

  describe('before', () => {
    let stage: MiddlewareStage;
    let message: MockMessage;
    let context: PostboyMessageContext;

    beforeEach(() => {
      stage = Forger.create<MiddlewareStage>()!;
      message = new MockMessage();
      context = Forger.create<PostboyMessageContext>()!;
    })

    it('should pass over if cannot handle', () => {
      when(middleware.canHandle).thenReturn(() => false);
      //
      expect(() => service.before(stage, message, context)).not.toThrow();
    });

    it('should pass over if MiddlewareDecision.Continue', () => {
      when(middleware.canHandle).thenReturn(() => true);
      when(middleware.before).thenReturn(() => MiddlewareDecision.Continue);
      //
      expect(() => service.before(stage, message, context)).not.toThrow();
    });

    it('should throw if MiddlewareDecision.Interrupt', () => {
      when(middleware.canHandle).thenReturn(() => true);
      when(middleware.before).thenReturn(() => MiddlewareDecision.Interrupt);
      //
      expect(() => service.before(stage, message, context)).toThrow(CancelError);
    });
  })

  describe('after', () => {
    let stage: MiddlewareStage;
    let message: MockMessage;
    let context: PostboyMessageContext;

    beforeEach(() => {
      stage = Forger.create<MiddlewareStage>()!;
      message = new MockMessage();
      context = Forger.create<PostboyMessageContext>()!;
    })

    it('should pass over if cannot handle', () => {
      when(middleware.canHandle).thenReturn(() => false);
      //
      expect(() => service.after(stage, message, context)).not.toThrow();
    });
  })

  it('should call all middlewares handle method when manage is invoked', () => {
    service.dispose();
    const list = Array.from({ length: 3 }, () => mock(PostboyMiddleware));
    list.forEach(m => service.addMiddleware(instance(m)));
    list.forEach(m => when(m.canHandle).thenReturn(() => true));
    //
    service.afterPublish(new MockMessage(), Forger.create<PostboyMessageContext>()!);
    //
    list.forEach(m => verify(m.after(anything(), anything())).once());
  });

  it('should remove middleware on dispose()', () => {
    service.dispose();
    //
    verify(middleware.dispose()).once();
  });

  it('should dispose middleware on removeMiddleware()', () => {
    service.removeMiddleware(instance(middleware));
    //
    verify(middleware.dispose()).once();
  });
});
