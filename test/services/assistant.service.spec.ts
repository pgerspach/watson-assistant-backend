import {Container, Scope} from 'typescript-ioc';
import {AssistantApi, DataApi} from '../../src/services';
import {Assistant} from '../../src/entity';
import {AssistantConfig} from '../../src/model';
import {InjectValue, Inject} from 'typescript-ioc/dist/decorators';
import {assistantConfig_test} from '../../src/config';
import * as faker from 'faker';
import * as Factory from 'factory.ts';
import * as AssistantV2 from'ibm-watson/assistant/v2';
import {LoggerApi} from '../../src/logger';

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

class MockAssistant implements Assistant {
  logger: null;
  id: string;
  assistant: null;
  message = jest.fn().mockName('message');
  createSession = jest.fn().mockName('createSession');
  deleteSession = jest.fn().mockName('deleteSession');
  constructor(@InjectValue('assistantConfig') config: AssistantConfig){
    this.id = config.id;
  }
}

class MockDataService implements DataApi {
  logger: LoggerApi
  getTopIntents = jest.fn();
  getTopEntities = jest.fn();
  recordIntent = jest.fn();
  recordEntity = jest.fn();
  recordData = jest.fn();

  constructor(@Inject logger: LoggerApi) {
    this.logger = logger.child('MockDataService');
  }
}

class MockResponse implements AssistantV2.Response {
  result: any;
  status: 200;
  statusText: string;
  headers: {}
  constructor(res: any){
    this.result = res;
  }
}

class MockCreateSessionResponse implements AssistantV2.SessionResponse {
  session_id: string;
  constructor(sessionId: string){
    this.session_id = sessionId;
  }
}

class MockMessageResponse implements AssistantV2.MessageResponse {
  output: {
    intents: AssistantV2.RuntimeIntent[],
    entities: AssistantV2.RuntimeEntity[]
  }
  constructor(){
    this.output = {
      intents: assistantIntentFactory.buildList(1),
      entities: assistantEntityFactory.buildList(1)
    };
  }
}

describe('assistant.service', () => {
  let service: AssistantApi;
  let mockCreateSession: jest.Mock;
  let mockDeleteSession: jest.Mock;
  let mockMessage: jest.Mock;
  let mockRecordData: jest.Mock;
  let mockAssistant: Assistant;

  beforeAll(() => {
    Container.bind(Assistant).scope(Scope.Singleton).to(MockAssistant);
    Container.bind(DataApi).scope(Scope.Singleton).to(MockDataService);
    service = Container.get(AssistantApi);
  });

  test('canary test verifies test infrastructure', () => {
    expect(service).not.toBeUndefined();
  });

  describe('given createSession', () => {
    const sessionId = faker.random.uuid();
    const expectedResponse = new MockResponse(new MockCreateSessionResponse(sessionId));

    beforeEach(() => {
      mockAssistant = Container.get(Assistant);
      mockCreateSession = mockAssistant.createSession as jest.Mock;
      mockCreateSession.mockClear();
      mockCreateSession.mockReturnValue(Promise.resolve(expectedResponse));
    });

    test('it should return a created session', async done => {
      const result = await service.createSession();
      expect(mockAssistant.createSession).toBeCalledWith({assistantId: assistantConfig_test.id});
      expect(result).toEqual(expectedResponse);
      done();
    });
  });

  describe('given message', () => {
    const sessionId = faker.random.uuid();
    const expectedResponse: AssistantV2.Response<AssistantV2.MessageResponse> = new MockResponse(new MockMessageResponse());

    beforeEach(() => {
      mockAssistant = Container.get(Assistant);
      mockMessage = mockAssistant.message as jest.Mock;
      mockMessage.mockClear();
      mockMessage.mockReturnValue(Promise.resolve(expectedResponse));
      mockRecordData = Container.get(DataApi).recordData as jest.Mock;
      
    });

    test('it should return a message response', async done => {
      const result = await service.sendMessage(sessionId, 'test message');
      expect(result).toEqual(expectedResponse);
      done();
    });

    test('it should call dataApi.recordData', async (done) => {
      await service.sendMessage(sessionId, 'test message');
      expect(mockRecordData)
        .toBeCalledWith(expectedResponse.result.output, sessionId);
      done(); 
    });

  });

  describe('delete session', () => {
    const sessionId = 'test-session-id';
    const expectedResponse = {};

    beforeEach(() => {
      mockAssistant = Container.get(Assistant);
      mockDeleteSession = mockAssistant.deleteSession as jest.Mock;
      mockDeleteSession.mockClear();
      mockDeleteSession.mockReturnValue(Promise.resolve(expectedResponse));
    });

    test('it should delete the session', async done => {
      const result = await service.deleteSession(sessionId);
      expect(result).toEqual(expectedResponse);
      done();
    });
  });
});
