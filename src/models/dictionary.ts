export class Dictionary<T> {
  public collection: DictionaryType<T> = {}
  private _keys = new Set<string>();

  public get keys(): string[] {
    return Array.from(this._keys);
  }

  public get size(): number {
    return this._keys.size;
  }

  public static clone<T>(dic: Dictionary<T>, action?: (e: T, k: string) => T): Dictionary<T> {
    return Dictionary.create(dic.collection, action);
  }

  public static create<T>(dic: DictionaryType<T>, action?: (e: T, k: string) => T): Dictionary<T> {
    const keyList = Object.keys(dic);
    const result = new Dictionary<T>();
    for (const key of keyList) {
      result._keys.add(key);
      result.collection[key] = action ? action(dic[key], key) : dic[key];
    }
    return result;
  }

  public find(predicate: (value: T) => boolean): T | null {
    let result: T | null = null;
    this.forEach(e => {
      if (result === null && predicate(e)) result = e
    });
    return result;
  }

  public has = (key: string) => this._keys.has(key);

  public take(key: string): T | null {
    return this._keys.has(key) ? this.collection[key] : null;
  }

  public put(key: string, value?: T | null): void {
    if (value == null) return;
    this.collection[key] = value;
    this._keys.add(key);
  }

  public rmv(key: string): void {
    if (!this._keys.has(key)) return;
    delete this.collection[key];
    this._keys.delete(key);
  }

  public forEach(callback: (value: T, index: number) => void): void {
    const keys = Object.keys(this.collection);
    for (let i = 0; i < keys.length; i++) {
      callback(this.collection[keys[i]], i);
    }
  }
}

export type DictionaryType<T> = { [id: string]: T };
