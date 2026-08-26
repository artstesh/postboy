import { CancelDetails } from '../../models/cancel-details';
import { CancelError, isCancelError } from '../../models/cancel-error';
import { MiddlewareStage } from '../../models/middleware-stage.enum';
import { Forger } from '@artstesh/forger';
import { should } from '@artstesh/it-should';

describe('CancelError', () => {
  const details = (): CancelDetails => ({
    stage: MiddlewareStage.Publish,
    reason: undefined,
    middleware: 'TestMiddleware',
  });

  it('should build the default message from the stage when no reason is given', () => {
    const error = new CancelError(details());
    //
    should().string(error.message).contains('Publish');
  });

  it('should use the provided reason as the message', () => {
    const reason = Forger.create<string>({ stringSpecial: false })!;
    //
    const error = new CancelError({ ...details(), reason });
    //
    should().string(error.message).equals(reason);
  });

  it('should expose the name and the structured details', () => {
    //
    const error = new CancelError(details());
    //
    should().string(error.name).equals('PostboyCancelError');
    expect(error.details.stage).toBe(MiddlewareStage.Publish);
    should().string(error.details.middleware!).equals('TestMiddleware');
  });

  it('should be recognized by isCancelError and reject other errors', () => {
    const error = new CancelError(details());
    //
    should().true(isCancelError(error));
    should().false(isCancelError(new Error('nope')));
  });
});
