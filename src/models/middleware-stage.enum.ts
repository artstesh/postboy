/**
 * The pipeline phase a middleware hook is running for. Each bus verb has its own stage:
 * `Publish` for `fire`, `Callback` for `fireCallback`, `Execute` for `exec`.
 */
export enum MiddlewareStage {
  /** `PostboyService.fire` — pub/sub dispatch. */
  Publish = 1,
  /** `PostboyService.fireCallback` — async request/response dispatch. */
  Callback,
  /** `PostboyService.exec` — synchronous command execution, including infrastructure messages. */
  Execute,
}
