import { PostboyLocker } from './models/postboy.locker';

export class LockerStore {
  private lockers: { [id: string]: string[] } = {};
  private unlockers: { [id: string]: string[] } = {};
  private locked = new Set<string>();

  addLocker(locker: PostboyLocker): void {
    this.lockers[locker.locker] = locker.locking;
    this.unlockers[locker.unlocker] = locker.locking;
  }

  check(eventId: string): boolean {
    if (this.locked.has(eventId)) return false;
    if (this.unlockers[eventId]) this.unlockers[eventId].forEach((id) => this.locked.delete(id));
    if (this.lockers[eventId]) this.lockers[eventId].forEach((id) => this.locked.add(id));
    return true;
  }
}
