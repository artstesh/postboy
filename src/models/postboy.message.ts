export abstract class PostboyMessage {
  public get id(): string {
    return (this.constructor as any).ID;
  }
}
