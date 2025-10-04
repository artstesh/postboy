export class IdGenerator {
  private static collection = 'ABCDEFGHIJKLMNOPQRSTUVWXTZ0123456789'.split('');

  public static get(): string {
    const result: string[] = [];
    for (let i = 0; i < 7; i++) {
      result.push(
        IdGenerator.collection
          .sort(() => 0.5 - Math.random())
          .slice(0, 5)
          .join(''),
      );
    }
    return result.join('-');
  }
}
