import { PostboyMessage } from './postboy.message';

/**
 * Base class for pub/sub messages — the "letters" carried by the bus.
 *
 * A subclass must declare its own `static readonly ID` (a unique string): registration,
 * subscription, locking, and dispatch are all keyed by that `ID`, not by class identity.
 * Inheriting a parent's `ID` makes two message types silently collide on one registration.
 *
 * @example
 * ```ts
 * class PingMessage extends PostboyGenericMessage {
 *   static readonly ID = 'app.ping';
 *   constructor(public text: string) {
 *     super();
 *   }
 * }
 * ```
 */
export abstract class PostboyGenericMessage extends PostboyMessage {}

/**
 * Returns the static `ID` of a message class, refusing classes that declare none.
 *
 * @param message - The constructor to read the `ID` from.
 * @return The static `ID` value.
 * @throws Error When the class declares no static `ID`.
 */
export function checkId(message: new (...args: any[]) => any): string {
  if (!(message as any).ID) throw new Error(`${message.name} should have a static ID field`);
  return (message as any).ID;
}
