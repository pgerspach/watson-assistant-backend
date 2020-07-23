import {DataDao} from './data.dao';
import {AssistantData, PostgresConfig, Intent, Entity} from '../../src/model';
import {InjectValue} from 'typescript-ioc/dist/decorators';
import {getGroupedCount} from '../util/sql/queries.util';
import * as Bookshelf from 'bookshelf';
import * as Knex from 'knex';


export class PostgresDataDao implements DataDao {

  config: PostgresConfig;
  bookshelf: Bookshelf;
  db: Knex;
  Intent: typeof Bookshelf.Model;
  Entity: typeof Bookshelf.Model;

  constructor(@InjectValue('postgresConfig') config: PostgresConfig) {
    this.config = config;
    this.connect();
  } 

  getDb(): any {
    return this.db;
  }

  connect(): void {
    this.db= Knex({
      client: 'postgres',
      connection: {
        ...this.config,
        charset  : 'utf8' 
      }
    });
    const bookshelf = Bookshelf(this.db);
    this.Intent = bookshelf.model('Intent', {
      tableName: 'intents',
      hasTimestamps: false,
    });
    this.Entity = bookshelf.model('Entity', {
      tableName: 'entities',
      hasTimestamps: false
    });
  }

  async getIntents(): Promise<AssistantData[]> {
    const intents = await this.db.raw(getGroupedCount('intents', 'name'))
      .then(res => res.rows.map(row => (
        {...row,
          count: Number(row.count)
        } 
      )));

    return intents;
  }

  async getEntities(): Promise<AssistantData[]> {
    const entities = await this.db.raw(getGroupedCount('entities', 'name'))
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