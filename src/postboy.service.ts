import { Observable, Subject } from 'rxjs';
import { PostboyGenericMessage } from './models/postboy-generic-message';

export class PostboyService {
  private applications: { [id: string]: Subject<any> } = {};

  public register<T>(id: string, sub: Subject<T>): void {
    this.applications[id] = sub;
  }

  public unregister<T>(id: string): void {
    if (!this.applications[id]) return;
    this.applications[id].complete();
    delete this.applications[id];
  }

  public subscribe<T>(id: string): Observable<T> {
    if (!this.applications[id]) throw new Error(`There is no event with id ${id}`);
    return this.applications[id].asObservable();
  }

  public fire<T extends PostboyGenericMessage>(message: T): void {
    if (!this.applications[message.id]) throw new Error(`There is no event with id ${message.id}`);
    this.applications[message.id].next(message);
  }

  public ngOnDestroy(): void {
    Object.keys(this.applications).forEach((key) => this.unregister(key));
  }
}
