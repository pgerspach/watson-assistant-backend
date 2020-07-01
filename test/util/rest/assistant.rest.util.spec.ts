import {AssistantRestUtil} from '../../../src/util/rest/assistant.rest.util';
import {Container} from 'typescript-ioc';
import {ServiceContext} from 'typescript-rest';
import {createMock} from 'ts-auto-mock';
import {Response} from 'express';
import {mocked} from 'ts-jest/utils';
import {Response as AssistantResponse} from 'ibm-watson/assistant/v2';

describe('Assistant Rest Util', () => {

  let assistantRestUtil: AssistantRestUtil;
  const mockServiceContext = new ServiceContext();
  let assistantResponse: AssistantResponse;

  const testHeaders = {
    'test-header-1': 'test-header-value-1',
    'test-header-2': 'test-header-value-2',
    'test-header-3': 'test-header-value-3',
    'test-header-4': 'test-header-value-4',
  };

  beforeAll(() => {
    mockServiceContext.response = createMock<Response>({
      setHeader: jest.fn()
    });
    assistantRestUtil = Container.get(AssistantRestUtil);

    assistantResponse = createMock<AssistantResponse<any>>({
      headers: testHeaders
    });
  });

  beforeEach(() => {
    mocked(mockServiceContext.response.setHeader).mockClear();
  });

  describe('Add Headers', () => { 
    test('It should add all headers to the context object', () => {
      assistantRestUtil.addHeaders(mockServiceContext, testHeaders);
      expect(mockServiceContext.response.setHeader).toBeCalledTimes(Object.keys(testHeaders).length);
      for(const [key, val] of Object.entries(testHeaders)) {
        expect(mockServiceContext.response.setHeader).toBeCalledWith(key, val);
      }
    });

    test('it should exclude specified headers', () => {
      const params = {
        exclude: ['test-header-2', 'test-header-3']
      };

      assistantRestUtil.addHeaders(mockServiceContext, testHeaders, params);
      expect(mockServiceContext.response.setHeader).toBeCalledTimes(Object.keys(testHeaders).length - params.exclude.length);
    });

    test('it should include only specified headers', () => {
      const params = {
        include: ['test-header-1']
      };

      assistantRestUtil.addHeaders(mockServiceContext, testHeaders, params);
      expect(mockServiceContext.response.setHeader).toBeCalledTimes(params.include.length);
    });

    test('it should include no headers', () => {
      const params = {
        include: []
      };

      assistantRestUtil.addHeaders(mockServiceContext, testHeaders, params);
      expect(mockServiceContext.response.setHeader).toBeCalledTimes(0);
    });
  });

  describe('transform response', () => {
    test('It should add all headers to the context object', () => {
      assistantRestUtil.transformResponse(mockServiceContext, assistantResponse);
      expect(mockServiceContext.response.setHeader).toBeCalledTimes(Object.keys(testHeaders).length);
      for(const [key, val] of Object.entries(testHeaders)) {
        expect(mockServiceContext.response.setHeader).toBeCalledWith(key, val);
      }
    }); 

    test('It should exclude specified headers', () => {
      const params = {
        headers: {
          exclude: ['test-header-2', 'test-header-3']
        }
      };

      assistantRestUtil.transformResponse(mockServiceContext, assistantResponse, params);
      expect(mockServiceContext.response.setHeader).toBeCalledTimes(Object.keys(testHeaders).length - params.headers.exclude.length);
    });

    test('It should include only specified headers', () => {
      const params = {
        headers: {
          include: ['test-header-2']
        }
      };

      assistantRestUtil.transformResponse(mockServiceContext, assistantResponse, params);
      expect(mockServiceContext.response.setHeader).toBeCalledTimes(params.headers.include.length);
    });

    test('It should include only specified headers', () => {
      const params = {
        headers: {
          include: []
        }
      };

      assistantRestUtil.transformResponse(mockServiceContext, assistantResponse, params);
      expect(mockServiceContext.response.setHeader).toBeCalledTimes(0);
    }); 
  });
});