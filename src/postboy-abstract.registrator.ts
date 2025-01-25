import {PostboyService} from './postboy.service';
import {BehaviorSubject, Observable, ReplaySubject, Subject} from 'rxjs';
import {IPostboyDependingService} from './i-postboy-depending.service';
import {PostboyExecutor} from './models/postboy-executor';

export abstract class PostboyAbstractRegistrator {
  private ids: string[] = [];
  private services: IPostboyDependingService[] = [];

  constructor(protected postboy: PostboyService) {}

  public registerServices(services: IPostboyDependingService[]): void {
    this.services = services;
  }

  public up(): void {
    this._up();
    this.services.forEach((s) => s.up());
  }

  protected abstract _up(): void;

  /**
   * @deprecated The method should be replaced with recordExecutor<T>
   */
  public registerExecutor<E extends PostboyExecutor<T>, T>(id: string, exec: (e: E) => T): void {
    this.postboy.registerExecutor(id, exec);
  }

  public recordExecutor<T>(type: new (...args: any[]) => PostboyExecutor<T>, exec: (e: PostboyExecutor<T>) => T): void {
    this.postboy.recordExecutor(type, exec);
  }

  /**
   * @deprecated The method should be replaced with record<T>
   */
  public register<T>(id: string, sub: Subject<T>): void {
    this.ids.push(id);
    this.postboy.register(id, sub);
  }

  /**
   * @deprecated The method should be replaced with recordWithPipe<T>
   */
  public registerWithPipe<T>(id: string, sub: Subject<T>, pipe: (s: Subject<T>) => Observable<T>): void {
    this.ids.push(id);
    this.postboy.registerWithPipe(id, sub, pipe);
  }

  /**
   * @deprecated The method should be replaced with recordReplay<T>
   */
  public registerReplay = <T>(id: string, bufferSize = 1) => this.register(id, new ReplaySubject<T>(bufferSize));

  /**
   * @deprecated The method should be replaced with recordBehavior<T>
   */
  public registerBehavior = <T>(id: string, initial: T) => this.register(id, new BehaviorSubject<T>(initial));

  /**
   * @deprecated The method should be replaced with recordSubject<T>
   */
  public registerSubject = <T>(id: string) => this.register(id, new Subject<T>());

  public down(): void {
    this.services = [];
    this.ids.forEach((id) => this.postboy.unregister(id));
  }

  // future

  public record<T>(type: new (...args: any[]) => T, sub: Subject<T>): void {
    this.ids.push(type.name);
    this.postboy.record(type, sub);
  }

  public recordWithPipe<T>(type: new (...args: any[]) => T, sub: Subject<T>, pipe: (s: Subject<T>) => Observable<T>): void {
    this.ids.push(type.name);
    this.postboy.recordWithPipe(type, sub, pipe);
  }

  public recordReplay = <T>(type: new (...args: any[]) => T, bufferSize = 1) => this.record(type, new ReplaySubject<T>(bufferSize));

  public recordBehavior = <T>(type: new (...args: any[]) => T, initial: T) => this.record(type, new BehaviorSubject<T>(initial));

  public recordSubject = <T>(type: new (...args: any[]) => T) => this.record(type, new Subject<T>());

}
