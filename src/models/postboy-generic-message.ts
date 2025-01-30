/**
 * An inheritor should have a static ID field
 */
export abstract class PostboyGenericMessage {
  public get id(): string {
    return (this.constructor as any).ID;
  }
}
export function checkId(message: new (...args: any[]) => any): string {
  if (!(message as any).ID) throw new Error(`${message.name} should have a static ID field`);
  return (message as any).ID;
}
