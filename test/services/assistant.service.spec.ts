import {Container, Scope} from 'typescript-ioc';
import {AssistantApi} from '../../src/services';
import {Assistant} from '../../src/entity';
import {AssistantConfig, PostgresConfig, Intent} from '../../src/model';
import {InjectValue, Inject} from 'typescript-ioc/dist/decorators';
import {assistantConfig_test} from '../../src/config';
import {SessionResponse, Response, MessageResponse} from 'ibm-watson/assistant/v2';
import * as faker from 'faker';
import * as Factory from 'factory.ts';
import AssistantV2 = require('ibm-watson/assistant/v2');
import {DataUtil} from '../../src/util/data';
import {DataDao} from '../../src/dao';
import {LoggerApi} from '../../src/logger';

export const assistantIntentFactory = Factory.Sync.makeFactory<AssistantV2.RuntimeIntent>({
  intent: Factory.each(() => faker.company.bsNoun()),
  confidence: Factory.each(() => Math.random()),
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

class MockDataDao implements DataDao {
  logger: LoggerApi
  getIntents = jest.fn();
  getEntities = jest.fn();
  recordIntent = jest.fn().mockImplementation(() => {});

  constructor(@Inject logger: LoggerApi) {
    this.logger = logger.child('MockDataDao');
  }
}

class MockResponse implements Response {
  result: any;
  status: 200;
  statusText: string;
  headers: {}
  constructor(res: any){
    this.result = res;
  }
}

class MockCreateSessionResponse implements SessionResponse {
  session_id: string;
  constructor(sessionId: string){
    this.session_id = sessionId;
  }
}

class MockMessageResponse implements MessageResponse {
  output: {intents: AssistantV2.RuntimeIntent[]}
  constructor(){
    this.output = {intents: [assistantIntentFactory.build()]};
  }
}

describe('assistant.service', () => {
  let service: AssistantApi;
  let dataUtil: DataUtil;
  let mockCreateSession: jest.Mock;
  let mockDeleteSession: jest.Mock;
  let mockMessage: jest.Mock;
  let mockRecordIntent: jest.Mock;
  let mockAssistant: Assistant;
  let mockDataDao: DataDao;

  beforeAll(() => {
    Container.bind(Assistant).scope(Scope.Singleton).to(MockAssistant);
    Container.bind(DataDao).scope(Scope.Singleton).to(MockDataDao);
    dataUtil = Container.get(DataUtil);
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
    const expectedResponse: Response<MessageResponse> = new MockResponse(new MockMessageResponse());

    beforeEach(() => {
      mockAssistant = Container.get(Assistant);
      mockMessage = mockAssistant.message as jest.Mock;
      mockMessage.mockClear();
      mockMessage.mockReturnValue(Promise.resolve(expectedResponse));
      mockRecordIntent = Container.get(DataDao).recordIntent as jest.Mock;
    });

    test('it should return a message response', async done => {
      const result = await service.sendMessage(sessionId, 'test message');
      expect(result).toEqual(expectedResponse);
      done();
    });

    test('it should call dao.recordIntent', async (done) => {
      await service.sendMessage(sessionId, 'test message');
      expect(mockRecordIntent)
        .toBeCalledWith(dataUtil.assistantIntentToDataIntent(expectedResponse.result.output.intents[0], sessionId));
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
