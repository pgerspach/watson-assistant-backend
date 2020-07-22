import {DataDao} from './data.dao';
import {AssistantData, PostgresConfig, Intent} from '../../src/model';
import {InjectValue} from 'typescript-ioc/dist/decorators';
import * as Bookshelf from 'bookshelf';
import * as Knex from 'knex';


export class PostgresDataDao implements DataDao {

  dbName: string;
  bookshelf: Bookshelf;
  Intent: typeof Bookshelf.Model;

  constructor(@InjectValue('postgresConfig') config: PostgresConfig) {
    const knexInstance: Knex = Knex({
      client: 'postgres',
      connection: {
        ...config,
        charset  : 'utf8' 
      }
    });

    this.bookshelf = Bookshelf(knexInstance);
    this.Intent = this.bookshelf.model('Intent', {
      tableName: 'intents',
      hasTimestamps: false,
    });
    this.dbName = config.database;
  } 

  async getIntents(): Promise<AssistantData[]> {
    const intents = await this.bookshelf.knex.raw(`
    SELECT name, COUNT(*) 
    FROM intents 
    GROUP BY name;`
    ).then(res => res.rows.map(row => (
      {...row,
        count: Number(row.count)
      } 
    )));

    return intents;
  }

  recordIntent(intent: Intent): void {
    new this.Intent(intent)
      .save();
  }

  async getEntities(): Promise<AssistantData[]> {
    return [
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
  }
  
}