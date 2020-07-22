import {DataApi} from './data.api';
import {AssistantData, Intent} from '../model';
import {Inject} from 'typescript-ioc';
import {DataDao} from '../dao';

export class DataService implements DataApi {

  @Inject
  dao: DataDao

  async getTopIntents(n?: number): Promise<AssistantData[]> {
    const topIntents = await this.dao.getIntents();
    return topIntents.slice(0, n || 5);
  }

  async getTopEntities(n?: number): Promise<AssistantData[]> {
    const topEntities = await this.dao.getEntities();
    return topEntities.slice(0, n || 5);
  }

  recordIntent(intent: Intent): void {
    this.dao.recordIntent(intent);
  }
}
