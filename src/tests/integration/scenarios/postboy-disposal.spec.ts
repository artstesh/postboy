import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { LockMessage } from '../../../messages/lock-message.executor';

describe('Integration.Scenarios.PostboyDisposal', () => {
  it('should release locked ids when the service is disposed', () => {
    const scenario = new ScenarioBuilder().useMessage().subjectRegistry();

    const postboy = scenario.getWorld().getPostboy();
    const message = scenario.getMessage();
    postboy.exec(new LockMessage(message.type));

    postboy.dispose();

    expect((postboy as unknown as { locked: Set<string> }).locked.size).toBe(0);
  });
});
