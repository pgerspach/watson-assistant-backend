import {AssistantApi} from './assistant.api';
import {Assistant} from '../entity';
import {Inject} from 'typescript-ioc';
import {LoggerApi} from '../logger';
import {Response, MessageResponse, SessionResponse, Empty} from 'ibm-watson/assistant/v2';
import {DataDao} from '../../src/dao';
import {DataUtil} from '../../src/util/data';

export class AssistantService implements AssistantApi {
  logger: LoggerApi;
  
  @Inject
  assistant: Assistant;
  @Inject
  dao: DataDao
  @Inject
  dataUtil: DataUtil

  constructor(@Inject logger: LoggerApi) {
    this.logger = logger.child('AssistantService');
  }

  async createSession(): Promise<Response<SessionResponse>> {
    return await this.assistant.createSession({assistantId: this.assistant.id});
  }

  async sendMessage(sessionId: string, text: string): Promise<Response<MessageResponse>> {
    const messageResponse = await this.assistant.message({
      assistantId: this.assistant.id,
      sessionId,
      input: {
        'message_type': 'text',
        text
      }
    });

    if (messageResponse.result.output.intents && messageResponse.result.output.intents.length > 0) {
      const topIntent = messageResponse.result.output.intents
        .reduce((top, i) => i.confidence > top.confidence ? i : top);

      this.dao.recordIntent(this.dataUtil.assistantIntentToDataIntent(topIntent, sessionId)); 
    }
    return messageResponse;
  }

  async deleteSession(sessionId: string): Promise<Response<Empty>> {
    return await this.assistant.deleteSession({
      assistantId: this.assistant.id,
      sessionId
    });
  }
}