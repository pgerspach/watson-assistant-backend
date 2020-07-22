import {Container, Scope} from 'typescript-ioc';
import {DataApi} from '../../src/services';
import {AssistantData, Intent} from '../../src/model';
import * as Factory from 'factory.ts';
import * as faker from 'faker';
import {DataDao} from '../../src/dao';

export const AssistantDataFactory = Factory.Sync.makeFactory<AssistantData>({
  name: Factory.each(() => faker.company.bsNoun()),
  count: Factory.each(() => Math.floor(Math.random() * 1000)),
});

export const IntentFactory = Factory.Sync.makeFactory<Intent>({
  name: Factory.each(() => faker.company.bsNoun()),
  confidence: Factory.each(() => Math.random()),
  session_id: Factory.each(() => faker.random.uuid())
});

class MockDataDao implements DataDao {
  getIntents = jest.fn().mockName('getIntents');
  getEntities = jest.fn().mockName('getEntities');
  recordIntent = jest.fn().mockName('recordIntent')
}

describe('data.service', () => {
  let service: DataApi;
  let mockDataDao: DataDao;
  let mockGetIntents: jest.Mock;
  let mockGetEntities: jest.Mock;
  let mockRecordIntent: jest.Mock;

  beforeAll(() => {
    Container.bind(DataDao).scope(Scope.Singleton).to(MockDataDao);
    mockDataDao = Container.get(DataDao);
    mockGetIntents = mockDataDao.getIntents as jest.Mock;
    mockGetEntities = mockDataDao.getEntities as jest.Mock;
    mockRecordIntent = mockDataDao.recordIntent as jest.Mock;
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
    const intent: Intent = IntentFactory.build();

    beforeEach(() => {
      mockRecordIntent.mockClear();
      mockRecordIntent.mockResolvedValue(Promise.resolve());
    });

    test('it should call dataDao.recordIntent', async (done) => {
      await service.recordIntent(intent);
      expect(mockRecordIntent).toBeCalledWith(intent);
      done();
    });

    test('it should return nothing', async (done) => {
      const response = await service.recordIntent(intent);
      expect(response).toEqual(undefined);
      done();
    });

  });

});
