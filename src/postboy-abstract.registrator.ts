import { PostboyService } from './postboy.service';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { IPostboyDependingService } from './i-postboy-depending.service';
import { PostboyExecutor } from './models/postboy-executor';

export abstract class PostboyAbstractRegistrator {
  private ids: string[] = [];
  private services: IPostboyDependingService[] = [];

  constructor(protected postboy: PostboyService) {}

  protected registerServices(services: IPostboyDependingService[]): void {
    this.services = services;
  }

  public up(): void {
    this._up();
    this.services.forEach((s) => s.up());
  }

  protected abstract _up(): void;

  protected registerExecutor<E extends PostboyExecutor<T>, T>(id: string, exec: (e: E) => T): void {
    this.postboy.registerExecutor(id, exec);
  }

  protected register<T>(id: string, sub: Subject<T>): void {
    this.ids.push(id);
    this.postboy.register(id, sub);
  }

  protected registerWithPipe<T>(id: string, sub: Subject<T>, pipe: (s: Subject<T>) => Observable<T>): void {
    this.ids.push(id);
    this.postboy.registerWithPipe(id, sub, pipe);
  }

  protected registerReplay = <T>(id: string, bufferSize = 1) => this.register(id, new ReplaySubject<T>(bufferSize));

  protected registerBehavior = <T>(id: string, initial: T) => this.register(id, new BehaviorSubject<T>(initial));

  protected registerSubject = <T>(id: string) => this.register(id, new Subject<T>());

  public down(): void {
    this.services = [];
    this.ids.forEach((id) => this.postboy.unregister(id));
  }
}
