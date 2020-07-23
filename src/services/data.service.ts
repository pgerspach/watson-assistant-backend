import {DataApi} from './data.api';
import {AssistantData} from '../model';
import {Inject} from 'typescript-ioc';
import {DataDao} from '../dao';
import AssistantV2 = require('ibm-watson/assistant/v2');
import {DataUtil} from '../../src/util/data';
import {LoggerApi} from '../../src/logger';

export class DataService implements DataApi {

  logger: LoggerApi
  @Inject
  dao: DataDao
  @Inject
  dataUtil: DataUtil

  constructor(@Inject logger: LoggerApi) {
    this.logger = logger.child('Data Service');
  }

  async getTopIntents(n?: number): Promise<AssistantData[]> {
    const topIntents = await this.dao.getIntents();
    return topIntents.slice(0, n || 5);
  }

  async getTopEntities(n?: number): Promise<AssistantData[]> {
    const topEntities = await this.dao.getEntities();
    return topEntities.slice(0, n || 5);
  }

  recordIntent(intent: AssistantV2.RuntimeIntent, sessionId: string): void {
    this.dao.recordIntent(this.dataUtil.assistantIntentToDataIntent(intent, sessionId));
  }

  recordEntity(entity: AssistantV2.RuntimeEntity, sessionId: string): void {
    this.dao.recordEntity(this.dataUtil.assistantEntityToDataEntity(entity, sessionId));
  }

  recordData(data: AssistantV2.MessageOutput, sessionId: string): void {
    if(data.intents && data.intents.length > 0) {
      const topIntent = data.intents
        .reduce((top, i) => i.confidence > top.confidence ? i : top);

      this.recordIntent(topIntent, sessionId);
    }

    if(data.entities && data.entities.length > 0) {
      data.entities.forEach((entity) => {
        this.recordEntity(entity, sessionId);
      });
    }
  }
}
