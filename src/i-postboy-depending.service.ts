export interface IPostboyDependingService {
  up(): void;
  down?: () => void;
}
