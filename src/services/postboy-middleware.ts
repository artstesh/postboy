import {PipelineContext} from "../models/pipeline-context";
import {MiddlewareDecision} from "../models/middleware-decision.enum";


/**
 * Abstract base class for defining middleware in a pipeline.
 * Middleware acts on various stages of pipeline execution, allowing operations
 * to be intercepted, modified, or monitored.
 */
export abstract class PostboyMiddleware {
  public readonly name: string;

  /**
   * Creates an instance of a class, optionally assigning a name.
   *
   * @param {string} [name] - An optional name to be assigned. If not provided, defaults to the class name.
   */
  constructor(name?: string) {
    this.name = name ?? this.constructor.name;
  }

  /**
   * Optional filter to skip middleware for unrelated messages/stages.
   */
  public canHandle(_context: PipelineContext): boolean {
    return true;
  }

  /**
   * Called before the stage is executed.
   * Return Interrupt to cancel the operation.
   */
  public before(_context: PipelineContext): MiddlewareDecision {
    return MiddlewareDecision.Continue;
  }

  /**
   * Called after the stage has finished successfully.
   * `result` is typically set for execute-stage.
   */
  public after(_context: PipelineContext, _result?: unknown): void {
    // noop
  }

  /**
   * Called when middleware or pipeline throws.
   */
  public onError(_context: PipelineContext, _error: unknown): void {
    // noop
  }

  /**
   * Optional cleanup hook.
   */
  public dispose(): void {
    // noop
  }
}
