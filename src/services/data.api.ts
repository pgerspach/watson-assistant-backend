import {AssistantData} from '../../src/model/data.model';
import AssistantV2 = require('ibm-watson/assistant/v2');

export abstract class DataApi {
  abstract async getTopIntents(n?: number): Promise<AssistantData[]>;
  abstract async getTopEntities(n?: number): Promise<AssistantData[]>;
  abstract recordIntent(intent: AssistantV2.RuntimeIntent, sessionId: string): void;
  abstract recordEntity(entity: AssistantV2.RuntimeEntity, sessionId: string): void;
  abstract recordData(data: AssistantV2.MessageOutput, sessionId: string): void;
}
