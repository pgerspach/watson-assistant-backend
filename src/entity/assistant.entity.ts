import * as AssistantV2 from 'ibm-watson/assistant/v2';
import {IamAuthenticator} from 'ibm-watson/auth';
import {InjectValue, Singleton, OnlyInstantiableByContainer} from 'typescript-ioc/dist/decorators';
import {AssistantConfig} from '../model';
import {LoggerApi} from '../logger';

@Singleton
@OnlyInstantiableByContainer
export abstract class Assistant {
  logger: LoggerApi
  id: string
  assistant: AssistantV2;

  constructor(@InjectValue('assistantConfig') config: AssistantConfig) {
    this.id = config.id;
    this.assistant = new AssistantV2({
      version: config.version,
      authenticator: new IamAuthenticator({
        apikey: config.apikey
      }),
      url: config.url
    });
  }

  createSession(params: AssistantV2.CreateSessionParams, callback?: AssistantV2.Callback<AssistantV2.SessionResponse>): Promise<AssistantV2.Response<AssistantV2.SessionResponse>> {
    return this.assistant.createSession(params, callback);
  }

  message(params: AssistantV2.MessageParams, callback?: AssistantV2.Callback<AssistantV2.MessageResponse>): Promise<AssistantV2.Response<AssistantV2.MessageResponse>> {
    return this.assistant.message(params, callback);
  }

  deleteSession(params: AssistantV2.DeleteSessionParams, callback?: AssistantV2.Callback<AssistantV2.Empty>): Promise<AssistantV2.Response<AssistantV2.Empty>> {
    return this.assistant.deleteSession(params, callback);
  }
}