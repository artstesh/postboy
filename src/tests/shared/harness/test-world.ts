export type CleanupTask = () => void | Promise<void>;

export interface Disposable {
  dispose: () => void | Promise<void>;
}

export class TestWorld<TState extends Record<string, any> = Record<string, any>> {
  private state = new Map<keyof TState | string, any>();
  private cleanupTasks: CleanupTask[] = [];
  private disposed = false;

  set<K extends keyof TState>(key: K, value: TState[K]): this {
    this.assertNotDisposed();
    this.state.set(key, value);
    return this;
  }

  get<K extends keyof TState>(key: K): TState[K] {
    this.assertNotDisposed();
    if (!this.state.has(key)) {
      throw new Error(`TestWorld: value for key "${String(key)}" is not set`);
    }
    return this.state.get(key);
  }

  has<K extends keyof TState>(key: K): boolean {
    return this.state.has(key);
  }

  tryGet<K extends keyof TState>(key: K): TState[K] | undefined {
    return this.state.get(key);
  }

  use<T extends Disposable>(resource: T): T {
    this.assertNotDisposed();
    this.addCleanup(() => resource.dispose());
    return resource;
  }

  addCleanup(task: CleanupTask): this {
    this.assertNotDisposed();
    this.cleanupTasks.push(task);
    return this;
  }

  async dispose(): Promise<void> {
    if (this.disposed) {
      return;
    }

    this.disposed = true;

    for (let i = this.cleanupTasks.length - 1; i >= 0; i--) {
      await this.cleanupTasks[i]();
    }

    this.cleanupTasks = [];
    this.state.clear();
  }

  reset(): void {
    this.state.clear();
    this.cleanupTasks = [];
    this.disposed = false;
  }

  createScope(): TestWorld<TState> {
    const child = new TestWorld<TState>();
    child.addCleanup(() => this.dispose());
    return child;
  }

  private assertNotDisposed(): void {
    if (this.disposed) {
      throw new Error('TestWorld is already disposed');
    }
  }
}
