import {Container, Scope} from 'typescript-ioc';
import {AssistantApi} from '../../src/services';
import {Assistant} from '../../src/entity';
import {AssistantConfig} from '../../src/model';
import {InjectValue} from 'typescript-ioc/dist/decorators';
import {assistantConfig_test} from '../../src/config';
import {SessionResponse, Response, MessageResponse} from 'ibm-watson/assistant/v2';

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
  output: {user_defined: {}}
  constructor(userDefined: any){
    this.output = {user_defined: userDefined};
  }
}

describe('assistant.service', () => {
  let service: AssistantApi;
  let mockCreateSession: jest.Mock;
  let mockDeleteSession: jest.Mock;
  let mockMessage: jest.Mock;
  let mockAssistant: Assistant;

  beforeAll(() => {
    Container.bind(Assistant).scope(Scope.Singleton).to(MockAssistant);
    mockAssistant = Container.get(Assistant);
    mockCreateSession = mockAssistant.createSession as jest.Mock;
    mockDeleteSession = mockAssistant.deleteSession as jest.Mock;
    mockMessage = mockAssistant.message as jest.Mock;
    service = Container.get(AssistantApi);
  });

  test('canary test verifies test infrastructure', () => {
    expect(service).not.toBeUndefined();
  });

  describe('given createSession', () => {
    const expectedResponse = new MockResponse(new MockCreateSessionResponse('test-session-id'));

    beforeEach(() => {
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
    const expectedResponse = new MockResponse(new MockMessageResponse({testing: true}));

    beforeEach(() => {
      mockMessage.mockReturnValue(Promise.resolve(expectedResponse));
    });

    test('it should return a created session', async done => {
      const result = await service.sendMessage('test-session-id', 'test message');
      expect(result).toEqual(expectedResponse);
      done();
    });
  });

  describe('delete session', () => {
    const sessionId = 'test-session-id';
    const expectedResponse = {};

    beforeEach(() => {
      mockDeleteSession.mockReturnValue(Promise.resolve(expectedResponse));
    });

    test('it shoudl delete the session', async done => {
      const result = await service.deleteSession(sessionId);
      expect(result).toEqual(expectedResponse);
      done();
    });
  });
});
