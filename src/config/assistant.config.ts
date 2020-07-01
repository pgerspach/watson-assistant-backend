import {AssistantConfig} from '../model';

const assistantConfig_dev: AssistantConfig = {
  version: process.env.ASSISTANT_VERSION,
  apikey: process.env.ASSISTANT_APIKEY,
  url: process.env.ASSISTANT_URL,
  id: process.env.ASSISTANT_ID
};

const assistantConfig_test: AssistantConfig = {
  version: '01-01-0001',
  apikey: 'test-apikey',
  url: 'http://test-assistant-url.com',
  id: 'test-assistant-id'
};


export {
  assistantConfig_dev,
  assistantConfig_test
};