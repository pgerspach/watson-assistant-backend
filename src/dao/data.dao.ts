import {AssistantData, Intent} from '../../src/model';

export abstract class DataDao {
  abstract getIntents(): Promise<AssistantData[]>
  abstract getEntities(): Promise<AssistantData[]>
  abstract recordIntent(intent: Intent): void
}
