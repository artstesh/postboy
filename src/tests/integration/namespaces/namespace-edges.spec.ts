import { ScenarioBuilder } from '../../shared/builders/scenario.builder';
import { SubscriptionBuilder } from '../../shared/builders/subscription.builder';
import { TestAssertions } from '../../shared/harness/assertions';
import { AddNamespace } from '../../../messages/add-namespace.executor';
import { EliminateNamespace } from '../../../messages/eliminate-namespace.executor';
import { Forger } from '@artstesh/forger';

describe('Integration.Namespaces.Edges', () => {
  it('should return the same registrator for an existing namespace', () => {
    const scenario = new ScenarioBuilder();
    const postboy = scenario.getWorld().getPostboy();
    const namespace = Forger.create<string>()!;
    //
    const first = postboy.exec(new AddNamespace(namespace));
    const second = postboy.exec(new AddNamespace(namespace));
    //
    expect(first).toBe(second);
  });

  it('should tolerate eliminating an unknown namespace', () => {
    const scenario = new ScenarioBuilder();
    const postboy = scenario.getWorld().getPostboy();
    //
    expect(() => postboy.exec(new EliminateNamespace(Forger.create<string>()!))).not.toThrow();
  });

  it('should register a namespace registrator again after it was eliminated', async () => {
    const scenario = new ScenarioBuilder().useMessage();
    const postboy = scenario.getWorld().getPostboy();
    const namespace = Forger.create<string>()!;
    const message = scenario.getMessage();

    postboy.exec(new AddNamespace(namespace)).recordSubject(message.type);
    postboy.exec(new EliminateNamespace(namespace));

    const received: unknown[] = [];
    postboy.exec(new AddNamespace(namespace)).recordSubject(message.type);
    SubscriptionBuilder.forType(scenario.getWorld(), message.type).collect(received).subscribe();

    scenario.actions().fire(message);

    TestAssertions.receivedOne(received, message);
  });

  it('should keep other namespaces alive when one is eliminated', () => {
    const scenario = new ScenarioBuilder().useMessage();
    const postboy = scenario.getWorld().getPostboy();
    const message = scenario.getMessage();
    const doomed = Forger.create<string>()!;
    const survivor = Forger.create<string>()!;

    postboy.exec(new AddNamespace(doomed)).recordSubject(message.type);
    const survivorRegistry = postboy.exec(new AddNamespace(survivor));
    survivorRegistry.recordSubject(message.type);

    postboy.exec(new EliminateNamespace(doomed));

    const received: unknown[] = [];
    survivorRegistry.recordSubject(message.type);
    SubscriptionBuilder.forType(scenario.getWorld(), message.type).collect(received).subscribe();

    scenario.actions().fire(message);

    TestAssertions.receivedOne(received, message);
  });
});
