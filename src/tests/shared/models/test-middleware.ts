import {PostboyMiddleware} from "../../../services/postboy-middleware";
import {PipelineContext} from "../../../models/pipeline-context";
import {MiddlewareDecision} from "../../../models/middleware-decision.enum";

export class TestMiddleware extends PostboyMiddleware {
  _canHandle = false;
  _disposed = false;
  _throw = false;
  _before?: PipelineContext;
  _after?: PipelineContext;
  _onError?: PipelineContext;
  _decision: MiddlewareDecision = MiddlewareDecision.Continue;
  _result?: any;
  _error?: any;
  targetMessages = new Set<string>();

  constructor(messageIds: string[]) {
    super();
    this.targetMessages = new Set(messageIds);
  }

  canHandle(_context: PipelineContext): boolean {
    return this.targetMessages.has(_context.message.id) ? this._canHandle : true;
  }

  before(_context: PipelineContext): MiddlewareDecision {
    if (this._throw) throw new Error();
    this._before = _context;
    return this.targetMessages.has(_context.message.id) ? this._decision : MiddlewareDecision.Continue;
  }

  after(_context: PipelineContext, _result?: unknown): void {
    this._result = _result;
    this._after = _context;
  }

  onError(_context: PipelineContext, _error?: unknown): void {
    this._error = _error;
    this._onError = _context;
  }

  dispose(): void {
    this._disposed = true;
  }
}
