import {Application} from 'express';
import * as request from 'supertest';
import {Container, Scope} from 'typescript-ioc';
import * as Factory from 'factory.ts';
import * as faker from 'faker';

import {DataApi} from '../../src/services';
import {buildApiServer} from '../helper';
import {ApiServer} from '../../src/server';
import {AssistantData, Intent, Entity} from '../../src/model';

export const AssistantDataFactory = Factory.Sync.makeFactory<AssistantData>({
  name: Factory.each(() => faker.company.bsNoun()),
  count: Factory.each(() => Math.floor(Math.random() * 1000)),
});

export const IntentFactory = Factory.Sync.makeFactory<Intent>({
  name: Factory.each(() => faker.company.bsNoun()),
  confidence: Factory.each(() => Math.random()),
  session_id: Factory.each(() => faker.random.uuid())
});

export const EntityFactory = Factory.Sync.makeFactory<Entity>({
  name: Factory.each(() => faker.company.bsNoun()),
  confidence: Factory.each(() => Math.random()),
  session_id: Factory.each(() => faker.random.uuid()),
  value: Factory.each(() => faker.company.bsBuzz())
});

class MockDataService implements DataApi {
  getTopIntents = jest.fn().mockName('getTopIntents');
  getTopEntities = jest.fn().mockName('getTopEntities');
  recordIntent = jest.fn().mockName('recordIntent');
  recordEntity = jest.fn().mockName('recordEntity');
  recordData = jest.fn();
}

describe('data.controller', () => {

  let app: Application;
  let apiServer: ApiServer;
  let mockGetTopIntents: jest.Mock;
  let mockGetTopEntities: jest.Mock;

  beforeEach(() => {
    apiServer = buildApiServer();
    app = apiServer.getApp();
    Container.bind(DataApi).scope(Scope.Singleton).to(MockDataService);
    const mockService: DataApi = Container.get(DataApi);
    mockGetTopIntents = mockService.getTopIntents as jest.Mock;
    mockGetTopEntities = mockService.getTopEntities as jest.Mock;
  });

  test('canary validates test infrastructure', () => {
    expect(true).toBe(true);
  });

  describe('Given GET /data/intent', () => {
    const expectedResponse: AssistantData[] = AssistantDataFactory.buildList(1);

    beforeEach(() => {
      mockGetTopIntents.mockReturnValueOnce(Promise.resolve(expectedResponse));
    });

    test(`'should return mocked '/data/intent' response`, async done => {
      await request(app).get('/data/intent').expect(200).expect(expectedResponse);
      done();
    });

    test(`it should pass the query parameter 'number' to the service method`, async done => {
      const n = 5;

      await request(app).get(`/data/intent?number=${n}`).expect(200);
      expect(mockGetTopIntents).toBeCalledWith(n);
      
      done();
    });

  });

  describe('Given GET /data/entity', () => {
    const expectedResponse: AssistantData[] = AssistantDataFactory.buildList(1);

    beforeEach(() => {
      mockGetTopEntities.mockReturnValueOnce(Promise.resolve(expectedResponse));
    });

    test(`should return mocked '/data/entity' response`, async done => {
      await request(app).get('/data/entity').expect(200).expect(expectedResponse);
      done();
    });

    test(`it should pass the query parameter 'number' to the service method`, async done => {
      const n = 5;

      await request(app).get(`/data/entity?number=${n}`).expect(200);
      expect(mockGetTopEntities).toBeCalledWith(n);
      
      done();
    });
  });

});
