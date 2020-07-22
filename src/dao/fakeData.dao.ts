import {DataDao} from '.';
import {AssistantData, Intent} from '../../src/model';
import {LoggerApi} from '../../src/logger';
import {Inject} from 'typescript-ioc';

export class FakeDataDao implements DataDao {
  logger: LoggerApi;

  recordIntent(intent: Intent): void { this.logger.info(intent);}

  constructor(@Inject logger: LoggerApi) {
    this.logger = logger.child('FakeDataDao');
  }

  async getIntents(): Promise<AssistantData[]> {
    const topIntents = [
      {
        name: 'Appointment Change',
        count: 100
      },
      {
        name: 'Account Info',
        count: 43
      },
      {
        name: 'Account Help',
        count: 340
      },
      {
        name: 'Payment',
        count: 138
      },
      {
        name: 'Appointment Details',
        count: 34
      }
    ];
    return topIntents;
  }

  async getEntities(): Promise<AssistantData[]> {
    const topEntities = [
      {
        name: 'Payment',
        count: 105
      },
      {
        name: 'Account',
        count: 76
      },
      {
        name: 'Date',
        count: 200
      },
      {
        name: 'Agent',
        count: 138
      },
      {
        name: 'Appointment',
        count: 68
      } 
    ];

    return topEntities;
  }
  
}
