import {DataDao} from './data.dao';
import {AssistantData, PostgresConfig, Intent, Entity} from '../../src/model';
import {InjectValue} from 'typescript-ioc/dist/decorators';
import * as Bookshelf from 'bookshelf';
import * as Knex from 'knex';


export class PostgresDataDao implements DataDao {

  config: PostgresConfig;
  bookshelf: Bookshelf;
  Intent: typeof Bookshelf.Model;
  Entity: typeof Bookshelf.Model;

  constructor(@InjectValue('postgresConfig') config: PostgresConfig) {
    this.config = config;
    this.connect();
  } 

  connect(): void {
    const knexInstance: Knex = Knex({
      client: 'postgres',
      connection: {
        ...this.config,
        charset  : 'utf8' 
      }
    });

    this.bookshelf = Bookshelf(knexInstance);
    this.Intent = this.bookshelf.model('Intent', {
      tableName: 'intents',
      hasTimestamps: false,
    });
    this.Entity = this.bookshelf.model('Entity', {
      tableName: 'entities',
      hasTimestamps: false
    });
  }

  async getIntents(): Promise<AssistantData[]> {
    const intents = await this.bookshelf.knex.raw(`
      SELECT name, COUNT(*) 
      FROM intents 
      GROUP BY name;
    `)
      .then(res => res.rows.map(row => (
        {...row,
          count: Number(row.count)
        } 
      )));

    return intents;
  }

  async getEntities(): Promise<AssistantData[]> {
    const entities = await this.bookshelf.knex.raw(`
      SELECT name, COUNT(*) 
      FROM entities 
      GROUP BY name;
    `)
      .then(res => res.rows.map(row => (
        {...row,
          count: Number(row.count)
        } 
      )));

    return entities;
  }

  recordIntent(intent: Intent): void {
    new this.Intent(intent)
      .save();
  }

  recordEntity(entity: Entity): void {
    new this.Entity(entity)
      .save();
  }
}