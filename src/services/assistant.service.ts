import {AssistantApi} from './assistant.api';
import {Assistant} from '../entity';
import {Inject} from 'typescript-ioc';
import {LoggerApi} from '../logger';
import {Response, MessageResponse, SessionResponse, Empty} from 'ibm-watson/assistant/v2';

export class AssistantService implements AssistantApi {
  logger: LoggerApi;
  
  @Inject
  assistant: Assistant;

  constructor(@Inject logger: LoggerApi) {
    this.logger = logger.child('AssistantService');
  }

  async createSession(): Promise<Response<SessionResponse>> {
    return await this.assistant.createSession({assistantId: this.assistant.id});
  }

  async sendMessage(sessionId: string, text: string): Promise<Response<MessageResponse>> {

    return await this.assistant.message({
      assistantId: this.assistant.id,
      sessionId,
      input: {
        'message_type': 'text',
        text
      }
    });
  }

  async deleteSession(sessionId: string): Promise<Response<Empty>> {
    return await this.assistant.deleteSession({
      assistantId: this.assistant.id,
      sessionId
    });
  }
}