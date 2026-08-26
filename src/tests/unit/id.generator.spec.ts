import { IdGenerator } from '../../utils/id.generator';

describe('IdGenerator', () => {
  it('should generate ids in the expected 7-group format', () => {
    //
    const id = IdGenerator.get();
    //
    expect(id).toMatch(/^[A-Z0-9]{5}(-[A-Z0-9]{5}){6}$/);
  });

  it('should generate different ids across calls', () => {
    //
    const first = IdGenerator.get();
    const second = IdGenerator.get();
    //
    expect(first).not.toBe(second);
  });
});
