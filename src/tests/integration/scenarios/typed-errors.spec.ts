import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { TestMessage } from '../../shared/models/test-message';
import { NoRegisteredExecutorError } from '../../../models/no-registered-executor-error';
import { NoRegisteredMessageError } from '../../../models/no-registered-message-error';
import { isPostboyError } from '../../../models/postboy-error';
import { TestExecutor } from '../../shared/models/test-executor';
import { should } from '@artstesh/it-should';

describe('Integration.Scenarios.TypedErrors', () => {
  const catchError = (fn: () => void): unknown => {
    try {
      fn();
    } catch (e) {
      return e;
    }
    return undefined;
  };

  it('should throw NoRegisteredMessageError from fire for an unregistered message', () => {
    const scenario = new ScenarioBuilder().useMessage();
    const message = scenario.getMessage();
    //
    const error = catchError(() => scenario.getWorld().getPostboy().fire(message));
    //
    expect(error).toBeInstanceOf(NoRegisteredMessageError);
    should().true(isPostboyError(error));
    should()
      .string((error as NoRegisteredMessageError).id)
      .equals(TestMessage.ID);
    should()
      .string((error as NoRegisteredMessageError).typeName)
      .equals('TestMessage');
  });

  it('should throw NoRegisteredMessageError from sub and once for an unregistered message', () => {
    const scenario = new ScenarioBuilder().useMessage();
    const type = scenario.getMessage().type;
    //
    const subError = catchError(() => scenario.getWorld().getPostboy().sub(type));
    const onceError = catchError(() => scenario.getWorld().getPostboy().once(type));
    //
    expect(subError).toBeInstanceOf(NoRegisteredMessageError);
    expect(onceError).toBeInstanceOf(NoRegisteredMessageError);
  });

  it('should throw NoRegisteredMessageError from fireCallback for an unregistered callback message', () => {
    const scenario = new ScenarioBuilder().useCallback();
    const message = scenario.getMessage();
    //
    const error = catchError(() => scenario.getWorld().getPostboy().fireCallback(message));
    //
    expect(error).toBeInstanceOf(NoRegisteredMessageError);
  });

  it('should throw NoRegisteredExecutorError from exec for an unregistered executor', () => {
    const scenario = new ScenarioBuilder().useExecutor();
    const executor = scenario.getMessage() as TestExecutor<any>;
    //
    const error = catchError(() => scenario.getWorld().getPostboy().exec(executor));
    //
    expect(error).toBeInstanceOf(NoRegisteredExecutorError);
    should().true(isPostboyError(error));
    should()
      .string((error as NoRegisteredExecutorError).id)
      .equals(TestExecutor.ID);
  });
});
