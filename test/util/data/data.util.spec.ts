import {DataUtil} from '../../../src/util/data';
import {Container} from 'typescript-ioc';
import AssistantV2 = require('ibm-watson/assistant/v2');
import * as Factory from 'factory.ts';
import * as faker from 'faker';

export const assistantIntentFactory = Factory.Sync.makeFactory<AssistantV2.RuntimeIntent>({
  intent: Factory.each(() => faker.company.bsNoun()),
  confidence: Factory.each(() => Math.random()),
});

export const assistantEntityFactory = Factory.Sync.makeFactory<AssistantV2.RuntimeEntity>({
  entity: Factory.each(() => faker.company.bsNoun()),
  confidence: Factory.each(() => Math.random()),
  value: Factory.each(() => faker.company.bsBuzz()),
  location: Factory.each(() => [])
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

describe('assistantEntityToDataEntity', () => {
  const dataUtil = Container.get(DataUtil);
  const assistantEntity: AssistantV2.RuntimeEntity = assistantEntityFactory.build();
  const sessionId = faker.random.uuid();

  test('it should transform assistantEntity to dataEntity', () => {
    const dataEntity = dataUtil.assistantEntityToDataEntity(assistantEntity, sessionId);
    expect(dataEntity).toBeDefined();
  });
});