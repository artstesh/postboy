import { PostboyService } from './postboy.service';

describe('PostboyService', () => {
  let service: PostboyService;

  beforeEach(() => {
    service = new PostboyService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
