import {ScenarioBuilder} from "../../shared/builders/scenario.builder";
import {MessageFixture} from "../../shared/fixtures/message.fixture";
import {waitFor} from "../../shared/utils/async";
import {AddNamespace} from "../../../messages";
import {Forger} from "@artstesh/forger";
import {ConnectExecutor} from "../../../messages/connect-executor.executor";
import {ConnectHandler} from "../../../messages/connect-handler.executor";

describe('#Integration.Scenarios.ExecutorRegistration', () => {
  let scenario: ScenarioBuilder;

  beforeEach(() => {
    scenario = new ScenarioBuilder();
  });

  afterEach(() => {
    scenario.getWorld().dispose();
  });

  it('executor with Postboy success', async () => {
    const executor = MessageFixture.executor();
    let fired = false;
    scenario.getWorld().getPostboy().exec(new ConnectExecutor(executor.type, () => fired=true));
    //
    scenario.actions().exec(executor);
    await waitFor(() => fired, {timeoutMs: 20, intervalMs: 3});
  });

  it('handler with Postboy success', async () => {
    const executor = MessageFixture.executor();
    scenario.getWorld().getPostboy().exec(new ConnectHandler(executor.type, MessageFixture.handler()));
    //
    const result = scenario.actions().exec(executor);
    await waitFor(() => !!result, {timeoutMs: 20, intervalMs: 3});
  });

  it('executor with namespace success', async () => {
    const executor = MessageFixture.executor();
    let fired = false;
    scenario.getWorld().getPostboy().exec(new AddNamespace(Forger.create<string>()!))
      .recordExecutor(executor.type, () => fired=true);
    //
    scenario.actions().exec(executor);
    await waitFor(() => fired, {timeoutMs: 20, intervalMs: 3});
  });

  it('handler with namespace success', async () => {
    const executor = MessageFixture.executor();
    scenario.getWorld().getPostboy().exec(new AddNamespace(Forger.create<string>()!))
      .recordHandler(executor.type, MessageFixture.handler());
    //
    const result = scenario.actions().exec(executor);
    await waitFor(() => !!result, {timeoutMs: 20, intervalMs: 3});
  });

  it('executor with registrator success', async () => {
    let fired = false;
    scenario.useExecutor().executeRegistry(() => fired=true);
    //
    scenario.actions().exec(scenario.getMessage());
    await waitFor(() => fired, {timeoutMs: 20, intervalMs: 3});
  });

  it('executor with registrator success', async () => {
    scenario.useExecutor().handlerRegistry(MessageFixture.handler());
    //
    const result = scenario.actions().exec(scenario.getMessage());
    await waitFor(() => !!result, {timeoutMs: 20, intervalMs: 3});
  });
});
