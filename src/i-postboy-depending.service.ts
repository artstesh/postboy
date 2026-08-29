/**
 * A service sharing the lifecycle of the {@link PostboyAbstractRegistrator} it is
 * attached to via `registerServices`.
 */
export interface IPostboyDependingService {
  /**
   * Called by `PostboyAbstractRegistrator.up()` after the registrator's own
   * registrations are done. Start or initialize the service here.
   */
  up(): void;

  /**
   * Optional teardown: called by `PostboyAbstractRegistrator.down()` before the
   * registrator disconnects its recorded messages. Release resources here.
   */
  down?(): void;
}
