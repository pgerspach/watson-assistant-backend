import {AssistantData, Intent} from '../../src/model/data.model';

export abstract class DataApi {
  abstract async getTopIntents(n?: number): Promise<AssistantData[]>;
  abstract async getTopEntities(n?: number): Promise<AssistantData[]>;
  abstract recordIntent(intent: Intent): void;
}
