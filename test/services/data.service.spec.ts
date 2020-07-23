import {Container, Scope} from 'typescript-ioc';
import {DataApi} from '../../src/services';
import {AssistantData, Intent, Entity} from '../../src/model';
import * as Factory from 'factory.ts';
import * as faker from 'faker';
import {DataDao} from '../../src/dao';
import {DataUtil} from '../../src/util/data';
import * as AssistantV2 from 'ibm-watson/assistant/v2';

export const AssistantDataFactory = Factory.Sync.makeFactory<AssistantData>({
  name: Factory.each(() => faker.company.bsNoun()),
  count: Factory.each(() => Math.floor(Math.random() * 1000)),
});

export const AssistantIntentFactory = Factory.Sync.makeFactory<AssistantV2.RuntimeIntent>({
  intent: Factory.each(() => faker.company.bsNoun()),
  confidence: Factory.each(() => Math.random()),
});

export const AssistantEntityFactory = Factory.Sync.makeFactory<AssistantV2.RuntimeEntity>({
  entity: Factory.each(() => faker.company.bsNoun()),
  confidence: Factory.each(() => Math.random()),
  value: Factory.each(() => faker.company.bsBuzz()),
  location: Factory.each(() => [])
});

class MockMessageOutput implements AssistantV2.MessageOutput {
  intents: AssistantV2.RuntimeIntent[];
  entities: AssistantV2.RuntimeEntity[];

  constructor(nIntents?: number, nEntities?: number){
    this.intents = AssistantIntentFactory.buildList(nIntents || 0),
    this.entities = AssistantEntityFactory.buildList(nEntities || 0);
  }
}

class MockDataDao implements DataDao {
  getIntents = jest.fn().mockName('getIntents');
  getEntities = jest.fn().mockName('getEntities');
  recordIntent = jest.fn().mockName('recordIntent');
  recordEntity = jest.fn().mockName('recordEntity');
  getDb = jest.fn();
}

describe('data.service', () => {
  let service: DataApi;
  let mockDataDao: DataDao;
  let mockGetIntents: jest.Mock;
  let mockGetEntities: jest.Mock;
  let mockRecordIntent: jest.Mock;
  let mockRecordEntity: jest.Mock;

  beforeAll(() => {
    Container.bind(DataDao).scope(Scope.Singleton).to(MockDataDao);
    mockDataDao = Container.get(DataDao);
    mockGetIntents = mockDataDao.getIntents as jest.Mock;
    mockGetEntities = mockDataDao.getEntities as jest.Mock;
    mockRecordIntent = mockDataDao.recordIntent as jest.Mock;
    mockRecordEntity = mockDataDao.recordEntity as jest.Mock;
    service = Container.get(DataApi);
    
  });

  test('canary test verifies test infrastructure', () => {
    expect(service).not.toBeUndefined();
  });

  describe('given getTopIntents', () => {
    const intents: AssistantData[] = AssistantDataFactory.buildList(10);

    beforeEach(() => {
      mockGetIntents.mockResolvedValue(Promise.resolve(intents));
    });

    test('it should return the top 5 intents', async done => {
      const expectedResponse = intents.slice(0, 5); 
      const result = await service.getTopIntents();
      expect(result).toEqual(expectedResponse);
      done();
    });

    test('it should return only the top 2 ', async done => {
      const n = 2;
      const expectedResponse = intents.slice(0, n);
      const result = await service.getTopIntents(n);
      expect(result).toEqual(expectedResponse);
      done();
    });

  });

  describe('given getTopEntities', () => {
    const entities: AssistantData[] = AssistantDataFactory.buildList(10);

    beforeEach(() => {
      mockGetEntities.mockResolvedValue(Promise.resolve(entities));
    });

    test('it should return the top 5 intents', async done => {
      const expectedResponse = entities.slice(0, 5); 
      const result = await service.getTopEntities();
      expect(result).toEqual(expectedResponse);
      done();
    });

    test('it should return only the top 2 ', async done => {
      const n = 2;
      const expectedResponse = entities.slice(0, n);
      const result = await service.getTopEntities(n);
      expect(result).toEqual(expectedResponse);
      done();
    });

  });

  describe('given recordIntent', () => {
    const intent: AssistantV2.RuntimeIntent = AssistantIntentFactory.build();
    const dataUtil: DataUtil = Container.get(DataUtil);
    let assistantIntentToDataIntentSpy;
    const session_id = faker.random.uuid();

    beforeEach(() => {
      mockRecordIntent.mockClear();
      mockRecordIntent.mockResolvedValue(Promise.resolve());
      assistantIntentToDataIntentSpy = jest.spyOn(dataUtil, 'assistantIntentToDataIntent');
    });

    test('it should call dataDao.recordIntent', async (done) => { 
      await service.recordIntent(intent, session_id);
      expect(assistantIntentToDataIntentSpy).toBeCalledTimes(1);
      expect(mockRecordIntent).toBeCalledTimes(1);

      const assistantIntentToDataIntentReturnValue = assistantIntentToDataIntentSpy.mock.results[0].value;
      const mockRecordIntentArg = mockRecordIntent.mock.calls[0][0];

      expect(mockRecordIntentArg).toEqual(assistantIntentToDataIntentReturnValue);
      done();
    });

    test('it should return nothing', async (done) => {
      const response = await service.recordIntent(intent, session_id);
      expect(response).toEqual(undefined);
      done();
    });

  });

  describe('given recordEntity', () => {
    const entity: AssistantV2.RuntimeEntity = AssistantEntityFactory.build();
    const dataUtil: DataUtil = Container.get(DataUtil);
    const session_id = faker.random.uuid();
    let assistantEntityToDataEntitySpy;

    beforeEach(() => {
      mockRecordEntity.mockClear();
      mockRecordEntity.mockResolvedValue(Promise.resolve());
      assistantEntityToDataEntitySpy = jest.spyOn(dataUtil, 'assistantEntityToDataEntity');
    });

    test('it should call dataDao.recordEntity', async (done) => {
      await service.recordEntity(entity, session_id);
      expect(mockRecordEntity).toBeCalledTimes(1);
      expect(assistantEntityToDataEntitySpy).toBeCalledTimes(1);

      const assistantEntityToDataEntityReturnValue = assistantEntityToDataEntitySpy.mock.results[0].value;
      const mockRecordEntityArg = mockRecordEntity.mock.calls[0][0];

      expect(mockRecordEntityArg).toEqual(assistantEntityToDataEntityReturnValue);
      done();
    });

    test('it should return nothing', async (done) => {
      const response = await service.recordEntity(entity, session_id);
      expect(response).toEqual(undefined);
      done();
    });

  });

  describe('given recordData', () => {
    const session_id = faker.random.uuid();
    let recordIntentSpy: jest.SpyInstance;
    let recordEntitySpy: jest.SpyInstance;
    let assistantMessageOutput: AssistantV2.MessageOutput;

    beforeEach(() => {
      recordIntentSpy = jest.spyOn(service, 'recordIntent');
      recordEntitySpy = jest.spyOn(service, 'recordEntity');
      recordEntitySpy.mockClear();
      recordIntentSpy.mockClear();
    });

    test('it should call dataService.recordIntent once', async (done) => {
      assistantMessageOutput = new MockMessageOutput(1, 1);
      service.recordData(assistantMessageOutput, session_id);
      expect(recordIntentSpy).toBeCalledTimes(1);

      done();
    });

    test('it should call dataService.recordEntity once', async (done) => {
      assistantMessageOutput = new MockMessageOutput(1, 1);
      service.recordData(assistantMessageOutput, session_id);
      expect(recordEntitySpy).toBeCalledTimes(1);

      done();
    });

    test('it should call dataService.recordEntity multiple times when there are multiple entities', async (done) => {
      const n = 4;
      assistantMessageOutput = new MockMessageOutput(1, n);
      service.recordData(assistantMessageOutput, session_id);
      expect(recordEntitySpy).toBeCalledTimes(n);

      done();
    });

    test('it should not call dataService.recordIntent when there are no intents', async (done) => {
      assistantMessageOutput = new MockMessageOutput(0, 1);
      service.recordData(assistantMessageOutput, session_id);
      expect(recordIntentSpy).toBeCalledTimes(0);

      done();
    });

    test('it should not call dataService.recordEntity when there are no entities', async (done) => {
      assistantMessageOutput = new MockMessageOutput(1, 0);
      service.recordData(assistantMessageOutput, session_id);
      expect(recordEntitySpy).toBeCalledTimes(0);

      done();
    });

  });

});
