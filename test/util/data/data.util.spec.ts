import {DataUtil} from '../../../src/util/data';
import {Container} from 'typescript-ioc';
import AssistantV2 = require('ibm-watson/assistant/v2');
import * as Factory from 'factory.ts';
import * as faker from 'faker';

export const assistantIntentFactory = Factory.Sync.makeFactory<AssistantV2.RuntimeIntent>({
  intent: Factory.each(() => faker.company.bsNoun()),
  confidence: Factory.each(() => Math.random()),
});

describe('assistantIntentToDataIntent', () => {
  const dataUtil = Container.get(DataUtil);
  const assistantIntent: AssistantV2.RuntimeIntent = assistantIntentFactory.build();
  const sessionId = faker.random.uuid();
  
  test('it should transform assistantIntent to dataIntent', () => {
    const dataIntent = dataUtil.assistantIntentToDataIntent(assistantIntent, sessionId);
    expect(dataIntent).toBeDefined();
  });
});