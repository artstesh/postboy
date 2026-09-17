import { Forger } from '@artstesh/forger';
import { should } from '@artstesh/it-should';
import { CancelError, isCancelError } from '../../models/cancel-error';
import { NoRegisteredExecutorError } from '../../models/no-registered-executor-error';
import { NoRegisteredMessageError } from '../../models/no-registered-message-error';
import { PostboyError, isPostboyError } from '../../models/postboy-error';
import { MiddlewareStage } from '../../models/middleware-stage.enum';

describe('PostboyError', () => {
  it('should be an Error with the library name', () => {
    const message = Forger.create<string>({ stringSpecial: false })!;
    //
    const error = new PostboyError(message);
    //
    should().string(error.message).equals(message);
    should().string(error.name).equals('PostboyError');
    expect(error).toBeInstanceOf(Error);
  });

  it('should be recognized by isPostboyError and reject foreign values', () => {
    //
    should().true(isPostboyError(new PostboyError('oops')));
    should().false(isPostboyError(new Error('nope')));
    should().false(isPostboyError('nope'));
    should().false(isPostboyError(undefined));
  });
});

describe('NoRegisteredMessageError', () => {
  it('should carry the id and the type name', () => {
    const id = Forger.create<string>()!;
    const typeName = Forger.create<string>({ stringSpecial: false })!;
    //
    const error = new NoRegisteredMessageError(id, typeName);
    //
    should().string(error.message).contains(typeName);
    should().string(error.name).equals('PostboyNoRegisteredMessageError');
    should().string(error.id).equals(id);
    should().string(error.typeName).equals(typeName);
  });

  it('should be a PostboyError but not a CancelError', () => {
    //
    const error = new NoRegisteredMessageError('id', 'Type');
    //
    should().true(isPostboyError(error));
    should().false(isCancelError(error));
    expect(error).toBeInstanceOf(Error);
  });
});

describe('NoRegisteredExecutorError', () => {
  it('should carry the id', () => {
    const id = Forger.create<string>()!;
    //
    const error = new NoRegisteredExecutorError(id);
    //
    should().string(error.message).contains(id);
    should().string(error.name).equals('PostboyNoRegisteredExecutorError');
    should().string(error.id).equals(id);
  });

  it('should be a PostboyError but not a CancelError', () => {
    //
    const error = new NoRegisteredExecutorError('id');
    //
    should().true(isPostboyError(error));
    should().false(isCancelError(error));
    expect(error).toBeInstanceOf(Error);
  });
});

describe('CancelError hierarchy', () => {
  it('should remain a CancelError and become a PostboyError', () => {
    const error = new CancelError({ stage: MiddlewareStage.Publish, reason: 'stop', middleware: 'Test' });
    //
    should().string(error.name).equals('PostboyCancelError');
    should().true(isCancelError(error));
    should().true(isPostboyError(error));
    expect(error).toBeInstanceOf(Error);
  });
});
