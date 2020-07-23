import {AssistantData, Intent, Entity} from '../../src/model';

export abstract class DataDao {
  abstract getIntents(): Promise<AssistantData[]>
  abstract getEntities(): Promise<AssistantData[]>
  abstract recordIntent(intent: Intent): void
  abstract recordEntity(entity: Entity): void
}
