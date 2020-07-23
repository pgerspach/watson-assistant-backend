import * as mockDb from 'mock-knex';
import {Container, Scope} from 'typescript-ioc';
import {DataDao, PostgresDataDao} from '../../src/dao';
import {getGroupedCount} from '../../src/util/sql/queries.util';
import {Intent, Entity} from 'src/model';
import * as Factory from 'factory.ts';
import * as faker from 'faker';

const tracker = mockDb.getTracker();
tracker.install();

export const IntentFactory = Factory.Sync.makeFactory<Intent>({
  name: Factory.each(() => faker.company.bsNoun()),
  confidence: Factory.each(() => Math.random()),
  session_id: Factory.each(() => faker.random.uuid())
});

export const EntityFactory = Factory.Sync.makeFactory<Entity>({
  name: Factory.each(() => faker.company.bsNoun()),
  confidence: Factory.each(() => Math.random()),
  value: Factory.each(() => faker.company.bsBuzz()),
  session_id: Factory.each(() => faker.random.uuid())
});

describe('test postgres-data.dao', () => {
  let dao: DataDao;
  beforeAll(() => {
    Container.bind(DataDao).to(PostgresDataDao).scope(Scope.Singleton);
    dao = Container.get(DataDao);
    mockDb.mock(dao.getDb());
  });
  test('canary', () => {
    expect(true).toBe(true);
  });

  describe('get intents', () => {
    const mockResponse = {
      rows: [{
        name: 'test-intent',
        count: '1'
      }]};
    beforeEach(() => {
      tracker.removeAllListeners();
    });
    test('makes correct query and returns count of all intents', async (done) => {
      tracker.on('query', (query) => {
        expect(query.sql).toEqual(getGroupedCount('intents', 'name'));
        query.response(mockResponse);
        done();
      });
      const intents = await dao.getIntents();
      const expectedIntents = [
        {...mockResponse.rows[0],
          count: Number(mockResponse.rows[0].count)
        }];
      expect(intents).toEqual(expectedIntents);
    });
  });

  describe('get entities', () => {
    const mockResponse = {
      rows: [{
        name: 'test-entity',
        count: '1'
      }]};
    beforeEach(() => {
      tracker.removeAllListeners();
    });
    test('makes correct query and returns count of all entities', async (done) => {
      tracker.on('query', (query) => {
        expect(query.sql).toEqual(getGroupedCount('entities', 'name'));
        query.response(mockResponse);
      });
      const entities = await dao.getEntities();
      const expectedEntities = [
        {...mockResponse.rows[0],
          count: Number(mockResponse.rows[0].count)
        }];
      expect(entities).toEqual(expectedEntities);
      done();
    });
  });

  describe('record intent', () => {
    const mockIntent = IntentFactory.build();
    beforeEach(() => {
      tracker.removeAllListeners();
    });
    test('makes insert query with all correct key/value pairs', async (done) => {
      tracker.on('query', (query) => {
        expect(query.method).toEqual('insert');
        const keyArrayMatch = query.sql.match(/\(("\w*",?\s?)*\)/g);
        const keyArray = keyArrayMatch 
          ? keyArrayMatch[0]
            .replace(/\(|\)|"/g, '')
            .split(', ') 
          : [];
        expect(keyArray).toHaveLength(Object.keys(mockIntent).length);
        keyArray.forEach((key, i) => {
          expect(query.bindings[i]).toEqual(mockIntent[key]);
        });
        done();
      });
      await dao.recordIntent(mockIntent);
    });
  });
  
  describe('record entity', () => {
    const mockEntity = EntityFactory.build();
    beforeEach(() => {
      tracker.removeAllListeners();
    });
    test('makes insert query with all correct key/value pairs', async (done) => {
      tracker.on('query', (query) => {
        expect(query.method).toEqual('insert');
        const keyArrayMatch = query.sql.match(/\(("\w*",?\s?)*\)/g);
        const keyArray = keyArrayMatch 
          ? keyArrayMatch[0]
            .replace(/\(|\)|"/g, '')
            .split(', ') 
          : [];
        expect(keyArray).toHaveLength(Object.keys(mockEntity).length);
        keyArray.forEach((key, i) => {
          expect(query.bindings[i]).toEqual(mockEntity[key]);
        });
        done();
      });
      await dao.recordEntity(mockEntity);
    });
  });
});