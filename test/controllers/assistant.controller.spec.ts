import {Application} from 'express';
import * as request from 'supertest';
import {Container, Scope} from 'typescript-ioc';

import {SessionResponse, Response, MessageResponse} from 'ibm-watson/assistant/v2';
import {AssistantApi} from '../../src/services';
import {buildApiServer} from '../helper';
import {ApiServer} from 'src/server';
import {AssistantRestUtil} from '../../src/util/rest';
import {mocked} from 'ts-jest/utils';


jest.mock('../../src/util/rest', () => ({
  AssistantRestUtil: jest.fn(() => ({
    transformResponse: jest.fn((c: any, r: Response) => r.result) 
  }))
}));

class MockAssistantService implements AssistantApi {
  createSession = jest.fn().mockName('createSession');
  sendMessage = jest.fn().mockName('sendMessage');
  deleteSession = jest.fn().mockName('deleteSession');
  connect = jest.fn().mockName('connect');
}

class MockCreateSessionResponse implements SessionResponse {
  output: {} = {};
  session_id: string
  constructor(sessionId: string){
    this.session_id = sessionId;
  }
}

class MockMessageResponse implements MessageResponse {
  output: {} = {};
}

class MockResponse implements Response {
  result: any;
  status: 200;
  statusText: string;
  headers: {} = {};

  constructor(res: any){
    this.result = res;
  }
}

describe('assistant.controller', () => {

  let app: Application;
  let apiServer: ApiServer;
  let mockCreateSession: jest.Mock;
  let mockDeleteSession: jest.Mock;
  let mockSendMessage: jest.Mock;

  beforeEach(() => {
    apiServer = buildApiServer();
    app = apiServer.getApp();
    Container.bind(AssistantApi).scope(Scope.Singleton).to(MockAssistantService);
    const mockService: AssistantApi = Container.get(AssistantApi);
    mockCreateSession = mockService.createSession as jest.Mock;
    mockDeleteSession = mockService.deleteSession as jest.Mock;
    mockSendMessage = mockService.sendMessage as jest.Mock;
    mocked(AssistantRestUtil, true).mockClear();
  });

  test('canary validates test infrastructure', () => {
    expect(true).toBe(true);
  });

  describe('Given POST /assistant/session', () => {
    const expectedResponse = toObject(new MockCreateSessionResponse('fake-sess-ioni-dfak-eses-ioni'));

    beforeEach(() => {
      mockCreateSession.mockReturnValueOnce(Promise.resolve(new MockResponse(expectedResponse)));
    });

    test(`'should return mocked '/assistant/session' response`, async done => {
      await request(app).post('/assistant/session').expect(200).expect(expectedResponse);
      done();
    });
  });

  describe('Given /assistant/message', () => {
    const expectedResponse = toObject(new MockMessageResponse());

    beforeEach(() => {
      mockSendMessage.mockReturnValueOnce(Promise.resolve(new MockResponse(expectedResponse)));
    });

    test('should return mocked /assistant/message response',  async done => {
      await request(app).post('/assistant/message').expect(200).expect(expectedResponse);
      done();
    });
  });

  describe('Given DELETE /assistant/session', () => {
    const expectedResponse = toObject({});
    const sessionId = 'fake-session-id';

    beforeEach(() => {
      mockDeleteSession.mockReturnValueOnce(Promise.resolve(expectedResponse));
    });

    test('it should return a session deleted response', async done => { 
      await request(app).delete(`/assistant/session/${sessionId}`).expect(204);
      done();
    });
  });
});

function toObject(c: any): object {
  return JSON.parse(JSON.stringify(c));
}