import * as AssistantV2 from 'ibm-watson/assistant/v2';
import {mocked} from 'ts-jest/utils';
import {Container} from 'typescript-ioc';
import {Assistant} from '../../src/entity';


jest.mock('ibm-watson/assistant/v2');
jest.mock('ibm-watson/auth');

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
  output: {user_defined: {}}
  constructor(userDefined: any){
    this.output = {user_defined: userDefined};
  }
}

describe('assistant.entity', () => {
  let service: Assistant;
  let mockCreateSession: jest.Mock;
  let mockDeleteSession: jest.Mock;
  let mockMessage: jest.Mock;

  beforeAll(() => {
    service = Container.get(Assistant);
    mockCreateSession = service.assistant.createSession as jest.Mock;
    mockDeleteSession = service.assistant.deleteSession as jest.Mock;
    mockMessage = service.assistant.message as jest.Mock;
  });

  beforeEach(() => {
    mocked(service.assistant, true).createSession.mockClear();
    mocked(service.assistant, true).deleteSession.mockClear();
    mocked(service.assistant, true).message.mockClear();
  });

  test('canary test verifies test infrastructrue', () => {
    expect(true).toBe(true);
  });

  describe('create session', () => {
    const expectedCreateSessionResponse = new MockResponse(new MockCreateSessionResponse('test-session-id'));
     
    beforeEach(() => {
      mockCreateSession.mockReturnValue(Promise.resolve(expectedCreateSessionResponse));
    });

    test('createSession', async done => {
      const testParams = {assistantId: 'test-assistant-id'};
      const testCallback = () => {};
      const result = await service.createSession(testParams, testCallback);
      expect(service.assistant.createSession).toBeCalledWith(testParams, testCallback);
      expect(result).toEqual(expectedCreateSessionResponse);
      done();
    });
  });

  describe('message', () => {
    const expectedMessageResponse = new MockResponse(new MockMessageResponse({test: true}));

    beforeEach(() => {
      mockMessage.mockReturnValue(Promise.resolve(expectedMessageResponse));
    });

    test('message', async done => {
      const testParams = {
        assistantId: 'test-assistant-id',
        sessionId: 'test-session-id'
      };
      const testCallback = () => {};
      const result = await service.message(testParams, testCallback);
      expect(service.assistant.message).toBeCalledWith(testParams, testCallback);
      expect(result).toEqual(expectedMessageResponse);
      done();
    });
  });

  describe('delete session', () => {
    const expectedDeleteSessionResponse = {};
    beforeEach(() => {
      mockDeleteSession.mockReturnValue(Promise.resolve(expectedDeleteSessionResponse));
    }); 

    test('delete session', async done => {
      const testParams = {
        assistantId: 'test-assistant-id',
        sessionId: 'test-session-id'
      };
      const testCallback = () => {};

      const result = await service.deleteSession(testParams, testCallback);
      expect(service.assistant.deleteSession).toBeCalledWith(testParams, testCallback);
      expect(result).toEqual(expectedDeleteSessionResponse);
      done();
    });
  });

});